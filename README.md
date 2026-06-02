# Planning Poker

## Quick Start

Run these in two separate terminals from the project root:

```bash
cd server && npm install && npm start
```

```bash
cd client && npm install && npm run dev
```

This is a simple real-time Planning Poker application built with React, Node.js, and Socket.io.

## Features

- Create a new session with a unique ID.
- Join an existing session.
- Cast votes (0.5, 1, 2, 3, 5).
- Admin can reveal all cards and show the average.
- Admin can restart the vote.
- Real-time updates with Socket.io.

## How to run the application

### Prerequisites

- Node.js (v14 or higher)
- npm

### 1. Run the server

Open a terminal and navigate to the `server` directory:

```bash
cd server
```

Install the dependencies:

```bash
npm install
```

Start the server:

```bash
npm start
```

The server will be running on `http://localhost:3001`.

### 2. Run the client

Open another terminal and navigate to the `client` directory:

```bash
cd client
```

Install the dependencies:

```bash
npm install
```

Start the client:

```bash
npm run dev
```

The client will be running on `http://localhost:5173` by default. Open this URL in your browser to use the application.
