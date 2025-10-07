# Harmonium 🎵

### Winner at the 2025 TVG Hackathon!

An augmented reality platform that lets you play a variety of instruments from your laptop.

Has ***real-time*** hand tracking and ***multiplayer capabilities***!

Deployed on Vercel here: https://tvg-vibeathon.vercel.app

vv   View our demo here!   vv
<a href="https://www.youtube.com/watch?v=mPMlWaZJMw0" target="_blank" rel="noopener noreferrer">
  <img src="https://img.youtube.com/vi/mPMlWaZJMw0/maxresdefault.jpg" alt="Harmonium Demo" style="max-width: 100%;">
</a>


## Quick Start

### Installation
```bash
cd frontend
npm install
```

### Development
```bash
npm start
```

## Multiplayer Usage

1. Navigate to the **Multiplayer** page
2. Click **"Start Session"** and allow camera access
3. Share your **Session ID** with a partner
4. Enter their **Session ID** and click **"Connect"**
5. Play together in real-time! 🎶

For detailed multiplayer documentation, see [MULTIPLAYER_GUIDE.md](./MULTIPLAYER_GUIDE.md)

## Tech Stack

- **React** - UI framework
- **Tone.js** - Audio synthesis
- **MediaPipe** - Hand tracking
- **WebRTC + PeerJS** - Peer-to-peer multiplayer
- **Canvas API** - Visual rendering
