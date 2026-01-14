const apiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || '';
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export const generateMarketAnalysis = async (symbol: string, price: number, changePercent: number): Promise<string> => {
    if (!apiKey) return `Analysis unavailable (Missing API Key).`;

    try {
        const prompt = `
        Asset: ${symbol}
        Current Price: $${price}
        24h Change: ${changePercent.toFixed(2)}%

        You are a cautious financial analyst. Provide a structured trade setup with technical reasoning.
        
        Required Output Format:
        "Prediction: [Bullish/Bearish/Neutral]
        Reasoning: [Brief technical reason e.g., RSI divergence, bouncing off 200 EMA, breaking resistance at $X].
        Key Levels: Support $[price] | Resistance $[price]
        Setup: SL: $[price] | TP: $[price]"

        Keep the entire response under 60 words. Use financial terminology but remain concise.
        `;

        const response = await fetch(OPENROUTER_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://ai-surrogate-clone.com"
            },
            body: JSON.stringify({
                model: "meta-llama/llama-3.3-70b-instruct:free",
                messages: [{ role: "user", content: prompt }]
            })
        });

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        return content || `Analysis failed for ${symbol}.`;

    } catch (error) {
        console.error("Analysis Service Error:", error);
        return `Unable to generate analysis for ${symbol} at this time.`;
    }
};
