import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator, Dimensions, Animated, Easing, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getChatResponse } from '../services/chatbotService';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';

export default function ChatbotScreen() {
    const { theme, isDarkMode, restaurants } = useApp();
    const [messages, setMessages] = useState([
        { id: '1', text: "Hello! I'm your QuickBite AI. I know all the best spots in Mauritius! How can I assist you today?", sender: 'bot' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const scrollViewRef = useRef();
    const recordingRef = useRef(null);
    const isRecordingReady = useRef(false);

    const { width } = Dimensions.get('window');
    const isTablet = width > 768;

    // TTS using ElevenLabs
    const speakText = async (text) => {
        console.log("Speaking text:", text);
        if (isSpeaking) {
            Speech.stop();
            setIsSpeaking(false);
            return;
        }

        setIsSpeaking(true);
        try {
            // Check if we have ElevenLabs credentials
            const apiKey = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY;
            const voiceId = process.env.EXPO_PUBLIC_VOICE_ID;

            if (apiKey && voiceId) {
                const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                    method: 'POST',
                    headers: {
                        'xi-api-key': apiKey,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        text: text,
                        model_id: "eleven_monolingual_v1",
                        voice_settings: { stability: 0.5, similarity_boost: 0.5 }
                    })
                });
                console.log("ElevenLabs Response Status:", response.status);

                if (response.ok) {
                    const blob = await response.blob();
                    const reader = new FileReader();
                    reader.onload = async () => {
                        const base64 = reader.result.split(',')[1];
                        const path = `${FileSystem.cacheDirectory}speech.mp3`;
                        await FileSystem.writeAsStringAsync(path, base64, { encoding: 'base64' });
                        const { sound } = await Audio.Sound.createAsync({ uri: path });
                        await sound.playAsync();
                        sound.setOnPlaybackStatusUpdate((status) => {
                            if (status.didJustFinish) setIsSpeaking(false);
                        });
                    };
                    reader.readAsDataURL(blob);
                } else {
                    // Fallback to basic Expo Speech
                    Speech.speak(text, { onDone: () => setIsSpeaking(false), onError: () => setIsSpeaking(false) });
                }
            } else {
                Speech.speak(text, { onDone: () => setIsSpeaking(false), onError: () => setIsSpeaking(false) });
            }
        } catch (error) {
            console.error('Speech Error:', error);
            setIsSpeaking(false);
        }
    };

    // STT Start Recording
    const startRecording = async () => {
        console.log("Starting recording...");
        try {
            isRecordingReady.current = false;
            // Clean up any existing recording first
            if (recordingRef.current) {
                await recordingRef.current.stopAndUnloadAsync().catch(() => { });
                recordingRef.current = null;
            }

            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permission Denied", "We need microphone access to use voice chat.");
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
                staysActiveInBackground: false,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            recordingRef.current = recording;
            isRecordingReady.current = true;
            setIsRecording(true);
            setInputText(""); // Clear bar on start
        } catch (err) {
            console.error('Failed to start recording', err);
            setIsRecording(false);
            isRecordingReady.current = false;
        }
    };

    // STT Stop Recording
    const stopRecording = async () => {
        if (!isRecording) return;

        setIsRecording(false);

        // Wait a bit if the recorder is still initializing (prevents "Recorder does not exist" error)
        let retryCount = 0;
        while (!isRecordingReady.current && retryCount < 10) {
            await new Promise(resolve => setTimeout(resolve, 100));
            retryCount++;
        }

        if (!recordingRef.current || !isRecordingReady.current) {
            setIsTranscribing(false);
            return;
        }

        setIsTranscribing(true);
        try {
            console.log("Stopping recording... isRecordingReady:", isRecordingReady.current);
            console.log("Stopping recording...");
            // Get recording status to check duration
            const status = await recordingRef.current.getStatusAsync();
            if (status.durationMillis < 500) {
                // Too short, don't even try to stop/transcribe
                await recordingRef.current.stopAndUnloadAsync().catch(() => { });
                recordingRef.current = null;
                isRecordingReady.current = false;
                setIsTranscribing(false);
                return;
            }

            await recordingRef.current.stopAndUnloadAsync();
            const uri = recordingRef.current.getURI();
            recordingRef.current = null;
            isRecordingReady.current = false;

            // Transcription via Gemini (replacing OpenAI Whisper)
            const geminiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
            console.log("Gemini Key present:", !!geminiKey);
            console.log("Recording URI:", uri);

            if (geminiKey && uri) {
                setIsTranscribing(true);

                // Convert file to base64
                const base64Audio = await FileSystem.readAsStringAsync(uri, {
                    encoding: 'base64',
                });

                const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                { text: "Transcribe the following audio precisely. Output ONLY the transcribed text and nothing else. If you hear nothing, output exactly 'NONE'." },
                                {
                                    inline_data: {
                                        mime_type: "audio/m4a",
                                        data: base64Audio
                                    }
                                }
                            ]
                        }]
                    })
                });

                const data = await response.json();
                console.log("Gemini STT Data:", data);
                setIsTranscribing(false);

                if (data.error) {
                    Alert.alert("STT Error", data.error.message || "Gemini failed to transcribe.");
                    setInputText("");
                    return;
                }

                let transcribedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

                if (transcribedText && transcribedText !== "NONE" && transcribedText.length > 0) {
                    setInputText(transcribedText);
                    // Stay visible for 1.2s before auto-sending
                    setTimeout(() => {
                        handleSendWithText(transcribedText);
                    }, 1200);
                } else {
                    setInputText("");
                }
            } else {
                setIsTranscribing(false);
                setInputText("");
                Alert.alert("Configuration Error", "Gemini API key is missing.");
            }
        } catch (error) {
            console.error('Failed to stop recording', error);
            setIsTranscribing(false);
            setInputText("");
            if (!error.message.includes('no valid audio data')) {
                Alert.alert("Voice Error", "Something went wrong with the voice recording.");
            }
        }
    };

    const handleSend = () => handleSendWithText(inputText);

    const handleSendWithText = async (userText) => {
        console.log("handleSendWithText called with:", userText);
        if (!userText || userText.trim() === '' || isLoading) return;

        const cleanText = userText.trim();
        const newUserMessage = {
            id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 5),
            text: cleanText,
            sender: 'user'
        };

        setMessages(prev => [...prev, newUserMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            const apiMessages = messages
                .filter(m => m.id !== '1')
                .map(m => ({
                    role: m.sender === 'user' ? 'user' : 'assistant',
                    content: m.text
                }));

            apiMessages.push({ role: 'user', content: cleanText });

            const botResponseText = await getChatResponse(apiMessages, restaurants);

            const newBotMessage = {
                id: (Date.now() + 1).toString() + '-' + Math.random().toString(36).substr(2, 5),
                text: botResponseText,
                sender: 'bot'
            };
            setMessages(prev => [...prev, newBotMessage]);

            // Auto-speak the bot's response
            speakText(botResponseText);
        } catch (error) {
            console.error('Chat Error:', error);
            const errorMessage = { id: Date.now().toString(), text: "I'm sorry, I'm having trouble connecting to my brain. Please check your connection.", sender: 'bot' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Use a small delay to ensure keyboard layout has finished adjusting
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages, isLoading]);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                <View style={styles.headerTitleContainer}>
                    <Ionicons name="chatbubble-ellipses" size={24} color={theme.colors.primary} />
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>QuickBite AI Assistant</Text>
                </View>
                <Text style={[styles.headerSubtitle, { color: theme.colors.textLight }]}>Powered by GPT-4 • Your Food Expert</Text>
            </View>

            <ScrollView
                ref={scrollViewRef}
                style={styles.chatContainer}
                contentContainerStyle={styles.chatContent}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
            >
                {messages.map((message) => (
                    <View
                        key={message.id}
                        style={[
                            styles.messageWrapper,
                            message.sender === 'user' ? styles.userMessageWrapper : styles.botMessageWrapper
                        ]}
                    >
                        <View style={message.sender === 'user' ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }}>
                            <View
                                style={[
                                    styles.messageBubble,
                                    message.sender === 'user'
                                        ? [styles.userBubble, { backgroundColor: theme.colors.primary }]
                                        : [styles.botBubble, { backgroundColor: isDarkMode ? theme.colors.card : '#F3F4F6' }]
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.messageText,
                                        { color: message.sender === 'user' ? '#FFF' : theme.colors.text, fontSize: isTablet ? 18 : 16 }
                                    ]}
                                >
                                    {message.text}
                                </Text>
                            </View>

                            {/* Voice Icon Below Bubble (OpenAI Style) */}
                            <TouchableOpacity
                                onPress={() => speakText(message.text)}
                                style={[
                                    styles.voiceIconContainer,
                                    message.sender === 'user' ? { marginRight: 10 } : { marginLeft: 10 }
                                ]}
                            >
                                <Ionicons name="volume-medium" size={18} color={theme.colors.muted} />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
                {isLoading && (
                    <View style={[styles.messageWrapper, styles.botMessageWrapper]}>
                        <View style={[styles.messageBubble, styles.botBubble, { backgroundColor: isDarkMode ? theme.colors.card : '#F3F4F6', paddingHorizontal: 20 }]}>
                            <ActivityIndicator size="small" color={theme.colors.primary} />
                        </View>
                    </View>
                )}
            </ScrollView>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
            >
                <View style={[styles.inputContainer, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border, paddingHorizontal: isTablet ? 40 : 12 }]}>
                    <TouchableOpacity
                        style={[styles.voiceBtn, { backgroundColor: isRecording ? theme.colors.error : (isDarkMode ? '#374151' : '#F3F4F6') }]}
                        onPressIn={startRecording}
                        onPressOut={stopRecording}
                        onLongPress={() => { }} // Handle feedback
                    >
                        {isTranscribing ? (
                            <ActivityIndicator size="small" color={theme.colors.primary} />
                        ) : (
                            <Ionicons name={isRecording ? "mic" : "mic-outline"} size={22} color={isRecording ? "#FFF" : theme.colors.text} />
                        )}
                    </TouchableOpacity>

                    <TextInput
                        style={[styles.input, { color: theme.colors.text, backgroundColor: isDarkMode ? '#374151' : '#F9FAFB' }]}
                        placeholder={isRecording ? "Listening..." : (isTranscribing ? "Transcribing..." : "Say something...")}
                        placeholderTextColor={theme.colors.muted}
                        value={inputText}
                        onChangeText={setInputText}
                        onSubmitEditing={handleSend}
                        editable={!isLoading && !isTranscribing}
                        multiline={false}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, { backgroundColor: isLoading ? theme.colors.muted : theme.colors.primary }]}
                        onPress={handleSend}
                        disabled={isLoading || isTranscribing}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Ionicons name="send" size={20} color="#FFF" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        paddingTop: Platform.OS === 'android' ? 40 : 15,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    headerSubtitle: {
        fontSize: 12,
        marginTop: 4,
    },
    chatContainer: {
        flex: 1,
    },
    chatContent: {
        padding: 20,
        paddingBottom: 20,
    },
    messageWrapper: {
        marginBottom: 15,
        maxWidth: '85%',
    },
    userMessageWrapper: {
        alignSelf: 'flex-end',
    },
    botMessageWrapper: {
        alignSelf: 'flex-start',
    },
    messageBubble: {
        padding: 12,
        borderRadius: 20,
    },
    userBubble: {
        borderBottomRightRadius: 4,
    },
    botBubble: {
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        paddingBottom: Platform.OS === 'ios' ? 30 : 12,
        alignItems: 'center',
        borderTopWidth: 1,
    },
    input: {
        flex: 1,
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginRight: 10,
        fontSize: 16,
        maxHeight: 100,
    },
    voiceBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    voiceIconContainer: {
        marginTop: 4,
        padding: 4,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
