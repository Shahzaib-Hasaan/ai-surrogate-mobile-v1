import { FinancialReport } from "../types";

const YAHOO_BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart";
const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3/simple/price";

export const getRealMarketData = async (symbol: string): Promise<FinancialReport | null> => {
    const upperSymbol = symbol.toUpperCase();

    // 1. Try CoinGecko for Crypto (Better CORS support & reliability for crypto)
    // Map common symbols to CoinGecko IDs
    const cryptoMap: Record<string, string> = {
        'BTC': 'bitcoin', 'BTC-USD': 'bitcoin', 'BITCOIN': 'bitcoin',
        'ETH': 'ethereum', 'ETH-USD': 'ethereum', 'ETHEREUM': 'ethereum',
        'SOL': 'solana', 'SOL-USD': 'solana',
        'DOGE': 'dogecoin', 'XRP': 'ripple'
    };

    if (cryptoMap[upperSymbol] || upperSymbol.includes('USD')) {
        const coinId = cryptoMap[upperSymbol] || upperSymbol.replace('-USD', '').toLowerCase();
        try {
            const response = await fetch(`${COINGECKO_BASE_URL}?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`);
            const data = await response.json();

            if (data[coinId]) {
                const coin = data[coinId];
                return {
                    symbol: upperSymbol,
                    price: coin.usd,
                    currency: 'USD',
                    change: coin.usd * (coin.usd_24h_change / 100), // Approx change value
                    changePercent: coin.usd_24h_change,
                    marketCap: `$${(coin.usd_market_cap / 1e9).toFixed(2)}B`,
                    peRatio: null,
                    week52High: coin.usd * 1.5, // Mock range as simple API doesn't have it freely
                    week52Low: coin.usd * 0.5,
                    recommendation: coin.usd_24h_change > 0 ? 'BUY' : 'SELL',
                    analysis: `Live data from CoinGecko. 24h Change: ${coin.usd_24h_change.toFixed(2)}%`
                };
            }
        } catch (e) {
            console.log("CoinGecko failed, falling back to Yahoo...");
        }
    }

    // 2. Try Yahoo Finance (Stocks)
    // Note: This often fails in Web Browsers due to CORS. Works in Native.
    try {
        let querySymbol = upperSymbol;
        // Basic cleanup
        if (!querySymbol.includes('-') && !querySymbol.includes('.')) {
            // Assume stock if not crypto map, but user might type 'apple'
            if (querySymbol === 'APPLE') querySymbol = 'AAPL';
            if (querySymbol === 'TESLA') querySymbol = 'TSLA';
            if (querySymbol === 'GOOGLE') querySymbol = 'GOOGL';
        }

        const response = await fetch(`${YAHOO_BASE_URL}/${querySymbol}?interval=1d&range=1d`);

        if (!response.ok) throw new Error("Yahoo API Error");

        const data = await response.json();

        if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
            return null;
        }

        const result = data.chart.result[0];
        const quote = result.meta;
        const price = quote.regularMarketPrice;
        const prevClose = quote.chartPreviousClose;
        const change = price - prevClose;
        const changePercent = (change / prevClose) * 100;

        return {
            symbol: querySymbol,
            price: price,
            currency: quote.currency || 'USD',
            change: change,
            changePercent: changePercent,
            marketCap: 'N/A',
            peRatio: null,
            week52High: quote.fiftyTwoWeekHigh || (price * 1.1),
            week52Low: quote.fiftyTwoWeekLow || (price * 0.9),
            recommendation: changePercent > 1 ? 'BUY' : changePercent < -1 ? 'SELL' : 'HOLD',
            analysis: `Market data for ${querySymbol}. Volatility: ${Math.abs(changePercent).toFixed(2)}%`
        };

    } catch (error) {
        console.error("Error fetching market data:", error);
        return null;
    }
};
