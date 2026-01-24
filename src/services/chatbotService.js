const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

export const getChatResponse = async (messages, restaurants) => {
    try {
        const systemPrompt = `
You are "QuickBite AI 🇲🇺", a premium food assistant dedicated to the island of Mauritius.
Your goal is to help users find the best food from our partners: KFC, McDonald's (Macdo), Domino's, Ocean Basket, and Sitar Indian Restaurant.

**CONTEXT**:
- Current Restaurants and Menus: ${JSON.stringify(restaurants)}
- Location Context: Most partners are located in Bagatelle Mall, Moka, or Quatre Bornes.

**GUIDELINES**:
1. **Tone**: Enthusiastic, helpful, and proudly Mauritian.
2. **Language**: Use English as the base, but enrich it with common Mauritian Creole words (e.g., "Mari bon!", "Ayo", "Dousman", "Kofé?").
3. **Local Knowledge**: You are an expert on Mauritius. You know Bagatelle Mall like the back of your hand.
4. **Accuracy**: Always quote prices in Rs (Mauritian Rupees) and refer to our specific menu items.
5. **Brand Personality**: You are state-of-the-art AI, but you have the heart of a "Mauricien".

Limit your scope to food and restaurants in Mauritius. If asked about other countries, remind them that Mauritius has the best food anyway!
`;

        // Format messages for Gemini
        const history = messages.slice(0, -1).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        const currentMessage = messages[messages.length - 1].content;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: systemPrompt }]
                    },
                    {
                        role: 'model',
                        parts: [{ text: "Understood. I am QuickBite AI 🇲🇺, ready to help with Mauritian food! How can I assist you today?" }]
                    },
                    ...history,
                    {
                        role: 'user',
                        parts: [{ text: currentMessage }]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 500,
                }
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error('Gemini API Error:', data.error);
            if (data.error.message?.includes('API key expired') || data.error.reason === 'API_KEY_INVALID') {
                return "Ayo! 😔 Your Gemini API key has expired or is invalid. Please update the EXPO_PUBLIC_GEMINI_API_KEY in your .env file with a fresh key from Google AI Studio.";
            }
            return "Désolé! 😔 I'm having a little trouble connecting to my brain right now. Please try again in a moment.";
        }

        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Chat Service Error:', error);
        return "Oops! Enn ti problem teknikk. 🇲🇺 I couldn't process your request. Please check your connection.";
    }
};
