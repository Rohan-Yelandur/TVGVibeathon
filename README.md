# TVGVibeathon - Harmonium 🎵

A virtual instrument platform with real-time hand tracking and **multiplayer capabilities**!

## Features

### 🎹 Virtual Instruments
- **Piano** - Full octave range with visual feedback
- **Guitar** - Chord-based playing
- **Drums** - Percussion with drumstick tracking

### 👋 Hand Tracking
- Real-time hand detection using MediaPipe
- Play instruments with natural hand gestures
- Adjustable tracking sensitivity

### 🌐 **NEW: Multiplayer Mode**
- **Connect with friends** and play together in real-time
- **Audio streaming** - Hear each other's instruments live
- **Video streaming** - See your partner's camera feed
- **Peer-to-peer connection** using WebRTC (no server required!)
- Works perfectly on **Vercel Hobby plan**

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

### Build
```bash
npm run build
```

## Multiplayer Usage

1. Navigate to the **Multiplayer** page
2. Click **"Start Session"** and allow camera access
3. Share your **Session ID** with a partner
4. Enter their **Session ID** and click **"Connect"**
5. Play together in real-time! 🎶

For detailed multiplayer documentation, see [MULTIPLAYER_GUIDE.md](./MULTIPLAYER_GUIDE.md)

## Technology Stack

- **React** - UI framework
- **Tone.js** - Audio synthesis
- **MediaPipe** - Hand tracking
- **WebRTC + PeerJS** - Peer-to-peer multiplayer
- **Canvas API** - Visual rendering

## Deployment

Deployed on **Vercel** (Hobby plan compatible!)

The multiplayer feature uses PeerJS's free cloud signaling service, so no additional backend hosting is required.

## Browser Support

- Chrome/Edge ✅
- Firefox ✅
- Safari ✅

Requires camera access for hand tracking and multiplayer.

---

Built with ❤️ for TVG Vibeathon
