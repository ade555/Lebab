# Lebab—Multilingual Customer Support Platform

Lebab is a real-time multilingual customer support platform that enables support agents to work entirely in their preferred language while seamlessly handling customer conversations in any language.

Built with React, Node.js, and Socket.IO, the system automatically detects customer languages, translates messages bidirectionally in real-time, and maintains conversation continuity across sessions—allowing agents and customers to communicate naturally in their preferred languages without ever knowing translation is happening.

## Table of Contents

- [How It Works](#how-it-works)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Data & API](#data--api)
- [Contributing](#contributing)
- [License](#license)

## How It Works

1. **Agent** selects their preferred language
2. **Customer** sends a message in any language (Spanish, French, German, Japanese, etc.)
3. **System** detects the language and translates to the agent's preferred language
4. **Agent** sees the translated message in their workspace
5. **Agent** replies in their preferred language
6. **System** translates the reply back to customer's language
7. **Customer** receives the reply in their original language

## Key Features

- Automatic language detection
- Bidirectional translation
- Real-time communication
- Customer and agent chat UI
- Language selection helper component
- Persisted conversations stored in JSON
- Minimal, easy-to-run local dev setup

## Tech Stack

**Frontend:**

- React with Hooks
- Tailwind CSS for styling
- Socket.IO Client for real-time updates

**Backend:**

- Node.js with Express
- Socket.IO for WebSocket communication
- Lingo.dev SDK for translation

**Data:**

- JSON file stored in `server/data` for simplicity

## Project Structure

- [client/](client/) — frontend app (Vite + React)
  - [client/src/](client/src/) — React source files
  - [client/src/agent/](client/src/agent/) — agent components
  - [client/src/customer/](client/src/customer/) — customer components
  - [client/src/utils/LanguageSelector.jsx](client/src/utils/LanguageSelector.jsx) — language selector
- [server/](server/) — backend server
  - [server/index.js](server/index.js) — server entry
  - [server/routes/conversations.js](server/routes/conversations.js) — conversations routes
  - [server/data/conversations.json](server/data/conversations.json) — stored conversations
  - [server/utils/utils.js](server/utils/utils.js) — helper utilities

## Getting Started

Prerequisites: Node.js (16+ recommended) and npm.

Clone the project and navigate into it:

```bash
git clone https://github.com/ade555/Lebab.git

# naviagate into it
cd Lebab
```

Install dependencies for both client and server:

```bash
# from project root
cd client
npm install

#back into Lebab
cd ../

# cd into server
cd server
npm install
```

Create environment variables:

```text
# create client/.env and paste:
VITE_API_BASE_URL=http://localhost:3000

# create server/.env and paste:
LINGODOTDEV_API_KEY=your-api-key-from-lingo.dev
PORT=3000
CLIENT_ORIGIN=http://127.0.0.1:5173
```

## Development

Run the backend (in one terminal):

```bash
cd server
npm run dev
```

Run the frontend (in another terminal):

```bash
cd client
npm run dev
```

Open the frontend URL printed by Vite (usually http://localhost:5173) and interact with the app.

Navigate to `/customer` to simulate a customer session and `/agent` to simulate an agent.

## Data & API

Conversations are persisted to [server/data/conversations.json](server/data/conversations.json). The backend routes for conversations live in [server/routes/conversations.js](server/routes/conversations.js).

If you need to reset conversations, edit or replace the JSON file directly.

## Contributing

Contributions are welcome. Suggested workflow:

1. Fork the repo
2. Create a feature branch
3. Implement and test locally
4. Open a pull request

## License

This project is provided as-is. See the `LICENSE` file for details.
