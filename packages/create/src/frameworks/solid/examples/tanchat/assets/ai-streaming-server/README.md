# AI Streaming Server

An Express server with TypeScript that provides a streaming API endpoint for Anthropic's Claude AI model.

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and add your Anthropic API key:
   ```bash
   cp .env.example .env
   ```
4. Edit `.env` and replace `your_api_key_here` with your actual Anthropic API key

## Development

Run in development mode with auto-reload:

```bash
npm run dev
```

Type checking:

```bash
npm run typecheck
```

## Production

Build the TypeScript code:

```bash
npm run build
```

Run in production mode:

```bash
npm start
```

## API Usage

### POST /api/chat

Endpoint that accepts chat messages and returns a streaming response from Claude.

#### Request Body

```typescript
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
}
```

Example request:

```json
{
  "messages": [{ "role": "user", "content": "Hello, how are you?" }]
}
```

#### Response

The endpoint returns a Server-Sent Events (SSE) stream. Each event contains a chunk of the response from Claude.

Example usage with JavaScript/TypeScript:

```typescript
const response = await fetch("http://localhost:3000/api/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    messages: [{ role: "user", content: "Hello, how are you?" }],
  }),
});

const reader = response.body!.getReader();
const decoder = new TextDecoder();

while (true) {
  const { value, done } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split("\n");

  for (const line of lines) {
    if (line.startsWith("data: ")) {
      const data = JSON.parse(line.slice(6));
      if (data === "[DONE]") break;

      // Handle the streaming response chunk
      console.log(data);
    }
  }
}
```
