# Planning Poker

## Quick Start

Run these in two separate terminals from the project root:

```bash
cd server && npm install && npm start
```

```bash
cd client && npm install && npm run dev
```

## Updating Production

### Client production update (Netlify)

The client is deployed on Netlify.

If Netlify is connected to your GitHub repo, the usual update flow is:

```bash
git add .
git commit -m "your change"
git push origin main
```

That should trigger a new Netlify deploy automatically.

Recommended Netlify settings for this repo:

- Base directory: `client`
- Build command: `npm run build`
- Publish directory: `dist`

Important: the client reads the server URL from `VITE_SOCKET_URL` in [client/src/socket.ts](client/src/socket.ts). In Netlify, make sure the environment variable `VITE_SOCKET_URL` points to your live server URL, then redeploy the site if that URL changes.

### Server production update

The backend server is deployed on Render.

Recommended Render settings for this repo:

- Server root: `server`
- Install command: `npm install`
- Start command: `npm start`
- Runtime port: `process.env.PORT` with fallback to `3001`

If Render is connected to your GitHub repo, the usual update flow is:

```bash
git add .
git commit -m "your change"
git push origin main
```

That should trigger a new Render deploy automatically.

If it does not auto-deploy, open the Render dashboard, select the backend service, and click **Manual Deploy** on the latest commit from `main`.

### If the server URL changes

1. Update the server deployment first.
2. Copy the new live server URL.
3. In Netlify, update `VITE_SOCKET_URL` to that server URL.
4. Trigger a new Netlify deploy for the client.

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
npm run build
```

The client will be running on `http://localhost:5173` by default. Open this URL in your browser to use the application.
