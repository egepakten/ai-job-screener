# Job Assistant Frontend

A modern ChatGPT-style UI for the Job Assistant AI powered by GPT-4 and RAG (Retrieval Augmented Generation).

## Features

- 💬 ChatGPT-style conversational interface
- 🎨 Modern UI with Tailwind CSS
- 🔄 Real-time message streaming
- 📱 Responsive design
- 🎯 Job-specific AI assistant

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Markdown** - Markdown rendering

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:8000`

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file (optional, defaults to localhost:8000):

```bash
cp .env.example .env
```

3. Start the development server:

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/         # React components
│   ├── ChatMessage.tsx    # Individual message component
│   ├── ChatInput.tsx      # Input field with send button
│   ├── LoadingMessage.tsx # Loading indicator
│   └── Sidebar.tsx        # Sidebar with new chat button
├── pages/             # Page components
│   └── Chat.tsx          # Main chat page
├── services/          # API services
│   └── api.ts            # Axios configuration and API calls
├── types/             # TypeScript types
│   └── index.ts          # Shared type definitions
├── App.tsx            # Main app component
├── main.tsx           # Entry point
└── index.css          # Global styles
```

## API Integration

The frontend connects to the FastAPI backend at `/chat` endpoint:

**Request:**

```json
{
  "message": "What jobs are available?",
  "session_id": "session-123"
}
```

**Response:**

```json
{
  "answer": "Here are the available positions..."
}
```

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: `http://localhost:8000`)

## Contributing

Feel free to submit issues and enhancement requests!
