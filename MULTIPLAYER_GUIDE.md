# 🎵 Multiplayer Feature Guide

## Overview
The multiplayer feature allows two users to connect peer-to-peer and play virtual instruments together in real-time, hearing each other's music and seeing each other's cameras.

## How It Works

### Technology Stack
- **PeerJS**: Provides WebRTC signaling infrastructure (no need for our own server!)
- **WebRTC**: Handles peer-to-peer audio/video streaming
- **Tone.js Audio Capture**: Captures synthesized instrument audio
- **MediaStream API**: Manages camera and audio streams

### Architecture
```
User A                                    User B
  |                                         |
  |---> Camera Stream ------------------>   |
  |---> Tone.js Audio (Piano/Guitar) --->   |
  |                                         |
  |   <-------------------- Camera Stream <-|
  |   <---- Tone.js Audio (Piano/Guitar) <--|
```

## Usage Instructions

### For Users:

1. **Navigate to Multiplayer Page**
   - Click "Multiplayer" in the navigation header

2. **Start Your Session**
   - Click "Start Session" button
   - Allow camera access when prompted
   - Your Session ID will appear (e.g., `abc123xyz`)

3. **Connect to Partner**
   - Share your Session ID with your partner (via text, call, etc.)
   - Enter your partner's Session ID in the input field
   - Click "Connect"

4. **Play Together!**
   - Choose your instrument (Piano, Guitar, or Drums)
   - Use hand gestures to play - your partner hears everything
   - Your partner can choose their own instrument
   - See and hear each other in real-time

5. **Disconnect**
   - Click "Disconnect Partner" to end the connection
   - Click "End Session" to stop your camera and leave

## Features

### ✅ Implemented
- [x] Peer-to-peer connection using PeerJS
- [x] Video streaming (both users see each other)
- [x] Audio streaming (both users hear each other's instruments)
- [x] Support for Piano, Guitar, and Drums
- [x] Hand tracking visualization
- [x] Connection status indicators
- [x] Session ID sharing with copy-to-clipboard
- [x] Responsive design
- [x] Error handling and user feedback

### 🚀 Future Enhancements (Not Yet Implemented)
- [ ] Support for more than 2 users
- [ ] Text chat functionality
- [ ] Session recording
- [ ] Latency optimization
- [ ] Virtual backgrounds
- [ ] Metronome/tempo sync
- [ ] User authentication
- [ ] Persistent room codes

## Technical Details

### Audio Capture
The `AudioStreamManager` captures audio from Tone.js by:
1. Creating a `MediaStreamDestination` from the Web Audio Context
2. Connecting Tone.js output to this destination
3. Extracting the MediaStream for WebRTC transmission

### Connection Process
1. **Initialization**: Each user gets a unique Peer ID from PeerJS cloud server
2. **Session Start**: User starts camera and audio capture
3. **Call Setup**: User A calls User B with their Peer ID
4. **Stream Exchange**: Both users exchange video + audio streams
5. **Playback**: Remote audio plays through `<audio>` element, local audio plays through Tone.js

### Latency Considerations
- **Local Audio**: 0ms (instant playback through Tone.js)
- **Remote Audio**: Typically 100-300ms depending on network
- **Video**: Similar to audio, WebRTC optimizes for low latency

### Browser Compatibility
- **Chrome/Edge**: Full support ✅
- **Firefox**: Full support ✅
- **Safari**: Full support ✅ (with WebKit prefix handling)

## Deployment on Vercel

### Why PeerJS?
Vercel's Hobby plan doesn't support WebSocket servers, so we use PeerJS's free cloud signaling service instead. This means:
- ✅ No backend server needed
- ✅ No additional hosting costs
- ✅ Works perfectly on Vercel's static/serverless infrastructure
- ✅ Peer-to-peer connection means low server load

### Deployment Steps
1. Build the frontend: `npm run build`
2. Deploy to Vercel: `vercel deploy`
3. No additional configuration needed!

### Environment Variables
None required! PeerJS uses their default cloud server.

### Custom PeerJS Server (Optional)
If you want to host your own PeerJS server:
```javascript
// In PeerConnectionManager.js, modify initialization:
this.peer = new Peer({
  host: 'your-peerjs-server.com',
  port: 9000,
  path: '/myapp',
  config: { /* ICE servers */ }
});
```

## Troubleshooting

### "Connection Failed" Error
- **Issue**: Firewall or NAT blocking connection
- **Solution**: PeerJS uses STUN servers to handle most NAT scenarios. For strict firewalls, a TURN server may be needed (not included in basic setup)

### "No Audio" Issue
- **Issue**: Audio stream not captured
- **Solution**: Ensure you play at least one note before connecting. Tone.js needs to be initialized.

### "Camera Access Denied"
- **Issue**: Browser permissions not granted
- **Solution**: Check browser settings and allow camera access

### Partner Can't Connect
- **Issue**: Session ID incorrect or peer disconnected
- **Solution**: Verify Session ID is copied correctly. Both users must be on the Multiplayer page.

### High Latency
- **Issue**: Slow network or geographical distance
- **Solution**: WebRTC optimizes automatically, but physical distance affects latency. Ensure good WiFi/ethernet connection.

## Code Structure

```
/frontend/src/
├── pages/
│   ├── MultiplayerPage.js      # Main multiplayer UI component
│   └── MultiplayerPage.css     # Styling
├── services/
│   └── PeerConnectionManager.js # WebRTC connection management
├── utils/
│   └── AudioStreamManager.js    # Tone.js audio capture
└── components/
    ├── Piano.js                 # Instrument components (unchanged)
    ├── Guitar.js
    ├── Drums.js
    └── HandTracking.js          # Hand detection (unchanged)
```

## Performance Optimization

### Audio Quality
- Tone.js synthesizes audio locally (no compression)
- WebRTC uses Opus codec for transmitted audio (high quality, low bandwidth)

### Video Quality
- Adaptive bitrate based on network conditions
- 720p max resolution (adjustable in getUserMedia call)

### Data Usage
Approximate bandwidth per session:
- **Video**: ~1-3 Mbps (depending on quality)
- **Audio**: ~32-64 Kbps
- **Total**: ~1-3 Mbps per direction

## Security & Privacy

### Data Transmission
- All audio/video transmitted directly peer-to-peer (encrypted)
- No data stored on servers
- PeerJS signaling server only exchanges connection metadata

### Session IDs
- Temporary and session-specific
- Not stored or logged
- New ID generated each session

### Camera/Audio Permissions
- Requested only when "Start Session" is clicked
- Users have full control over permissions
- Can be revoked anytime through browser settings

## Support

For issues or questions:
1. Check console logs (F12 in browser)
2. Verify both users have good internet connection
3. Ensure latest browser version
4. Try different network (some corporate networks block WebRTC)

---

**Built with ❤️ using WebRTC, PeerJS, Tone.js, and React**
