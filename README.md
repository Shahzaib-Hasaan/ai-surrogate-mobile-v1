# AI Surrogate - Mobile Application

**AI Surrogate** is an intelligent, agentic mobile application built with **Expo (React Native)** that acts as your digital twin. It uses advanced LLMs (via OpenRouter) to understand natural language and autonomously execute tasks across various domains like scheduling, communication, and financial analysis.

## 🚀 Features

### 🧠 Intelligent Agents
The app routes your requests to specialized agents:
- **Schedule Agent**: Manages your calendar. Can create events and generate Google Calendar links.
- **Email Agent**: Drafts professional emails based on context and generates direct `mailto` or Gmail links.
- **Docs Agent**: Creates and saves text documents/notes to local storage.
- **Payment Agent**: Simulates financial transactions and tracks payment history.
- **Financial Agent**: Fetches real-time crypto prices (CoinGecko) and stocks (Yahoo Finance), analyzed by Mistral AI.
- **Search Agent**: Performs web searches (Simulated/Mock results for demo).

### 🛠 Tech Stack
- **Framework**: React Native (Expo SDK 54)
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS)
- **Routing**: Expo Router (File-based routing)
- **AI Backend**: OpenRouter API (Access to Llama 3.3, Gemini 2.0, etc.)
- **Local Database**: `AsyncStorage` (Persists chats, events, settings locally)
- **Icons**: Lucide React Native

## 📱 Screenshots
*will be updated soon*

## 🛠 Installation & Setup

### Prerequisites
- Node.js (v18+)
- Expo Go app on your Android/iOS device.

### 1. Clone the Repository
```bash
git clone https://github.com/maliksaad1/ai-surrogate-mobile-v1.git
cd ai-surrogate-mobile-v1
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```properties
EXPO_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key_here
```
*(Note: The project is pre-configured to use a free OpenRouter model by default)*

### 4. Run the App
Start the development server:
```bash
npx expo start -c
```
- Scan the QR code with **Expo Go** (Android) or the Camera app (iOS).

## 🏗 Architecture

### Service Layer
- **`geminiService.ts`**: Handles communication with the OpenRouter API. It constructs the system prompt, manages chat history, and parses the LLM's JSON response.
- **`agentTools.ts`**: Contains the logic for each agent. It executes the specific actions (e.g., `db.addEvent`, `generateGoogleCalendarUrl`) requested by the LLM.
- **`db.ts`**: A wrapper around `AsyncStorage` to manage local data persistence for users, events, documents, and chat history.
- **`financeService.ts`**: Fetches real-time market data from CoinGecko (Crypto) and Yahoo Finance (Stocks).
- **`analysisService.ts`**: Uses Mistral AI to generate technical analysis and trading recommendations.

### UI Components
- **`ChatScreen.tsx`**: The main interface. Handles voice input, image attachments, and renders different "Agent Cards" based on the response type (e.g., a special card for Payment confirmation or Stock analysis).
- **`DashboardScreen.tsx`**: Visualizes agent activity and task logs.

## ⚠️ Notes
- **Web Support**: The current version is optimized for **Mobile (Android/iOS)**. Web support is experimental.
- **Mock Data**: The **Search** agent currently uses simulated data. The **Financial Agent** uses LIVE data for crypto and stocks.

## 📄 License
MIT
