import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { getChatResponse } from '../services/chatbotService';

export default function ChatbotScreen() {
    const { theme, isDarkMode, restaurants } = useApp();
    const [messages, setMessages] = useState([
        { id: '1', text: "Bonzour! 🇲🇺 I'm your QuickBite AI. I know all the best spots in Mauritius from Bagatelle to Grand Baie! What would you like to eat today?", sender: 'bot' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollViewRef = useRef();

    const handleSend = async () => {
        if (inputText.trim() === '' || isLoading) return;

        const userText = inputText.trim();
        const newUserMessage = { id: Date.now().toString(), text: userText, sender: 'user' };

        setMessages(prev => [...prev, newUserMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            // Convert current messages to OpenAI format for context
            const apiMessages = messages
                .filter(m => m.id !== '1') // Skip initial greeting
                .map(m => ({
                    role: m.sender === 'user' ? 'user' : 'assistant',
                    content: m.text
                }));

            apiMessages.push({ role: 'user', content: userText });

            const botResponseText = await getChatResponse(apiMessages, restaurants);

            const newBotMessage = { id: (Date.now() + 1).toString(), text: botResponseText, sender: 'bot' };
            setMessages(prev => [...prev, newBotMessage]);
        } catch (error) {
            console.error('Chat Error:', error);
            const errorMessage = { id: Date.now().toString(), text: "I'm sorry, I'm having trouble connecting to my brain. Please check your connection.", sender: 'bot' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [messages, isLoading]);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
                <View style={styles.headerTitleContainer}>
                    <Ionicons name="chatbubble-ellipses" size={24} color={theme.colors.primary} />
                    <Text style={[styles.headerTitle, { color: theme.colors.text }]}>QuickBite AI 🇲🇺</Text>
                </View>
                <Text style={[styles.headerSubtitle, { color: theme.colors.textLight }]}>OpenAI Powered • Mauritian Expert</Text>
            </View>

            <ScrollView
                ref={scrollViewRef}
                style={styles.chatContainer}
                contentContainerStyle={styles.chatContent}
                showsVerticalScrollIndicator={false}
            >
                {messages.map((message) => (
                    <View
                        key={message.id}
                        style={[
                            styles.messageWrapper,
                            message.sender === 'user' ? styles.userMessageWrapper : styles.botMessageWrapper
                        ]}
                    >
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
                                    { color: message.sender === 'user' ? '#FFF' : theme.colors.text }
                                ]}
                            >
                                {message.text}
                            </Text>
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
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={[styles.inputContainer, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
                    <TextInput
                        style={[styles.input, { color: theme.colors.text, backgroundColor: isDarkMode ? '#374151' : '#F9FAFB' }]}
                        placeholder="Ask about food in Mauritius..."
                        placeholderTextColor={theme.colors.muted}
                        value={inputText}
                        onChangeText={setInputText}
                        onSubmitEditing={handleSend}
                        editable={!isLoading}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, { backgroundColor: isLoading ? theme.colors.muted : theme.colors.primary }]}
                        onPress={handleSend}
                        disabled={isLoading}
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
        paddingBottom: 40,
    },
    messageWrapper: {
        marginBottom: 15,
        maxWidth: '80%',
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
        padding: 15,
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
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
