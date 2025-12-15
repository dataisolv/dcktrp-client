# dcktrp-client

A modern chat application built with Next.js that integrates with the dcktrp-rag RAG (Retrieval-Augmented Generation) server.

## Features

- 🔐 **User Authentication** - Secure login and registration
- 💬 **Real-time Chat** - Streaming responses from RAG system
- 📝 **Conversation History** - Persistent chat conversations
- 🎨 **Modern UI** - Built with shadcn/ui components
- 🌓 **Dark Mode** - Full theme support
- 📱 **Responsive Design** - Works on all devices

## Quick Start

### Prerequisites

- Node.js 18+ or Bun
- pnpm (or npm/yarn)
- dcktrp-rag server running (default: http://localhost:8012)

### Installation

```bash
# Install dependencies
pnpm install

# Configure environment
# The .env.local file is already set up with:
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8012
# Modify if your server runs on a different port

# Run development server
pnpm run dev
```

Visit `http://localhost:3000` to see the application.

## Server Setup

Make sure the dcktrp-rag server is running before using the chat application:

```bash
cd ../dcktrp-rag
# Follow server setup instructions
# Start the server (usually on port 8012)
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── chat/              # Chat page
│   ├── login/             # Login page
│   └── register/          # Registration page
├── components/            # React components
│   ├── chat/             # Chat-specific components
│   └── ui/               # shadcn UI components
├── contexts/             # React contexts
├── lib/                  # Utilities and API clients
│   └── api/             # API service functions
└── types/               # TypeScript type definitions
```

## Usage

### 1. Register an Account

Navigate to `/register` and create a new account.

> **Note**: The registration endpoint requires admin privileges on the server. You may need to create an initial admin user on the server first, or modify the server to allow public registration.

### 2. Login

Use your credentials to log in at `/login`.

### 3. Start Chatting

- Click "New Chat" to create a conversation
- Type your message and press Enter or click Send
- Watch the AI response stream in real-time
- Switch between conversations in the sidebar

## Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui
- **State Management**: React Context
- **HTTP Client**: Axios
- **Markdown**: react-markdown
- **Notifications**: Sonner

## API Integration

The app integrates with these dcktrp-rag endpoints:

- `POST /login` - User authentication
- `POST /users/` - User registration
- `GET /users/me` - Get current user
- `GET /conversations/` - List conversations
- `POST /conversations/` - Create conversation
- `GET /conversations/:id/messages` - Get messages
- `POST /conversations/:id/messages` - Create message
- `POST /query/stream` - Stream chat responses

## Development

```bash
# Run dev server
pnpm run dev

# Build for production
pnpm run build

# Start production server
pnpm start

# Lint code
pnpm run lint
```

## Environment Variables

Create a `.env.local` file (already created):

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8012
```

## License

This project is part of the dcktrp system.
