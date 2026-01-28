const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

export const getChatResponse = async (messages, restaurants) => {
    try {
        const systemPrompt = `
You are "QuickBite AI", a premium food assistant dedicated to the island of Mauritius.
Your goal is to help users find the best food from our partners: KFC, McDonald's (Macdo), Domino's, Ocean Basket, and Sitar Indian Restaurant.

**CONTEXT**:
- Current Restaurants and Menus: ${JSON.stringify(restaurants)}
- Location Context: Most partners are located in Bagatelle Mall, Moka, or Quatre Bornes.

**GUIDELINES**:
1. **Tone**: Enthusiastic, professional, and helpful.
2. **Language**: CRITICAL: Use ONLY pure English. Do not use any Creole words (e.g., No "Ayo", No "Mari", No "Bon"). If the user speaks Creole, politely ask them to speak English.
3. **Local Knowledge**: You are an expert on Mauritius restaurants and food.
4. **Accuracy**: Always quote prices in Rs (Mauritian Rupees).
5. **Brand Personality**: You are a state-of-the-art AI assistant.

**IMPORTANT**: KEEP RESPONSES VERY SHORT (1-2 sentences) and conversational.
Limit your scope to food and restaurants in Mauritius.
`;

        const history = messages.slice(0, -1).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        const currentMessage = messages[messages.length - 1].content;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
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
                        parts: [{ text: "Understood. I am QuickBite AI, ready to help with your food requests in pure English! How can I assist you today?" }]
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
                return "Your Gemini API key has expired or is invalid. Please update the EXPO_PUBLIC_GEMINI_API_KEY in your .env file.";
            }
            return "I'm having a little trouble connecting right now. Please try again in a moment.";
        }

        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Chat Service Error:', error);
        return "I couldn't process your request. Please check your connection.";
    }
};