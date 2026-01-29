# TanStack Chat Application

Am example chat application built with TanStack Start, TanStack Store, and Claude AI.

## Sidecar service

This applicaton requires a sidecar microservice to be running. The server is located in the `ai-streaming-service` directory.

In that directory you should edit the `.env.local` file to add your Anthropic API key:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key
```

Then run the server:

```bash
cd ai-streaming-service
npm install
npm run dev
```

## ✨ Features

### AI Capabilities

- 🤖 Powered by Claude 3.5 Sonnet
- 📝 Rich markdown formatting with syntax highlighting
- 🎯 Customizable system prompts for tailored AI behavior
- 🔄 Real-time message updates and streaming responses (coming soon)

### User Experience

- 🎨 Modern UI with Tailwind CSS and Lucide icons
- 🔍 Conversation management and history
- 🔐 Secure API key management
- 📋 Markdown rendering with code highlighting

### Technical Features

- 📦 Centralized state management with TanStack Store
- 🔌 Extensible architecture for multiple AI providers
- 🛠️ TypeScript for type safety

## Architecture

### Tech Stack

- **Routing**: TanStack Router
- **State Management**: TanStack Store
- **Styling**: Tailwind CSS
- **AI Integration**: Anthropic's Claude API
