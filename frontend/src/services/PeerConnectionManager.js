import Peer from 'peerjs';

/**
 * PeerConnectionManager
 * Manages WebRTC connections using PeerJS for signaling
 * Handles audio and video streaming between two users
 */
class PeerConnectionManager {
  constructor() {
    this.peer = null;
    this.currentConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.onRemoteStreamCallback = null;
    this.onConnectionStatusCallback = null;
    this.onErrorCallback = null;
    this.peerId = null;
  }

  /**
   * Initialize PeerJS connection
   * @returns {Promise<string>} Returns the peer ID for sharing
   */
  async initialize() {
    return new Promise((resolve, reject) => {
      try {
        // Create a new Peer instance with PeerJS cloud server
        this.peer = new Peer({
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
            ]
          }
        });

        // Handle successful connection to PeerJS server
        this.peer.on('open', (id) => {
          console.log('PeerJS initialized with ID:', id);
          this.peerId = id;
          this._updateConnectionStatus('ready');
          resolve(id);
        });

        // Handle incoming calls from remote peer
        this.peer.on('call', (call) => {
          console.log('Incoming call from:', call.peer);
          this._handleIncomingCall(call);
        });

        // Handle connection errors
        this.peer.on('error', (error) => {
          console.error('PeerJS error:', error);
          this._updateConnectionStatus('error');
          if (this.onErrorCallback) {
            this.onErrorCallback(error);
          }
          reject(error);
        });

        // Handle peer disconnection
        this.peer.on('disconnected', () => {
          console.log('Disconnected from PeerJS server');
          this._updateConnectionStatus('disconnected');
        });

      } catch (error) {
        console.error('Failed to initialize PeerJS:', error);
        reject(error);
      }
    });
  }

  /**
   * Set local stream (audio + video)
   * @param {MediaStream} stream Local media stream
   */
  setLocalStream(stream) {
    this.localStream = stream;
    console.log('Local stream set:', stream.getTracks().map(t => t.kind));
  }

  /**
   * Call another peer by their ID
   * @param {string} remotePeerId The peer ID to connect to
   */
  async callPeer(remotePeerId) {
    if (!this.peer || !this.localStream) {
      throw new Error('Peer or local stream not initialized');
    }

    try {
      console.log('Calling peer:', remotePeerId);
      this._updateConnectionStatus('connecting');

      // Make a call to the remote peer with our local stream
      const call = this.peer.call(remotePeerId, this.localStream);
      this._handleCall(call);

    } catch (error) {
      console.error('Failed to call peer:', error);
      this._updateConnectionStatus('error');
      throw error;
    }
  }

  /**
   * Handle an incoming call
   * @private
   */
  _handleIncomingCall(call) {
    if (!this.localStream) {
      console.error('Cannot answer call: local stream not set');
      return;
    }

    console.log('Answering incoming call');
    this._updateConnectionStatus('connecting');
    
    // Answer the call with our local stream
    call.answer(this.localStream);
    this._handleCall(call);
  }

  /**
   * Handle call events (both outgoing and incoming)
   * @private
   */
  _handleCall(call) {
    this.currentConnection = call;

    // Receive remote stream
    call.on('stream', (remoteStream) => {
      console.log('Received remote stream:', remoteStream.getTracks().map(t => t.kind));
      this.remoteStream = remoteStream;
      this._updateConnectionStatus('connected');
      
      if (this.onRemoteStreamCallback) {
        this.onRemoteStreamCallback(remoteStream);
      }
    });

    // Handle call closure
    call.on('close', () => {
      console.log('Call closed');
      this._updateConnectionStatus('disconnected');
      this.remoteStream = null;
      this.currentConnection = null;
    });

    // Handle call errors
    call.on('error', (error) => {
      console.error('Call error:', error);
      this._updateConnectionStatus('error');
      if (this.onErrorCallback) {
        this.onErrorCallback(error);
      }
    });
  }

  /**
   * Update connection status and notify callback
   * @private
   */
  _updateConnectionStatus(status) {
    console.log('Connection status:', status);
    if (this.onConnectionStatusCallback) {
      this.onConnectionStatusCallback(status);
    }
  }

  /**
   * Register callback for remote stream
   * @param {Function} callback Called when remote stream is received
   */
  onRemoteStream(callback) {
    this.onRemoteStreamCallback = callback;
  }

  /**
   * Register callback for connection status changes
   * @param {Function} callback Called with status: 'ready', 'connecting', 'connected', 'disconnected', 'error'
   */
  onConnectionStatus(callback) {
    this.onConnectionStatusCallback = callback;
  }

  /**
   * Register callback for errors
   * @param {Function} callback Called when errors occur
   */
  onError(callback) {
    this.onErrorCallback = callback;
  }

  /**
   * Get current peer ID
   * @returns {string|null}
   */
  getPeerId() {
    return this.peerId;
  }

  /**
   * Check if currently connected to a peer
   * @returns {boolean}
   */
  isConnected() {
    return this.currentConnection !== null && this.remoteStream !== null;
  }

  /**
   * Disconnect from current peer
   */
  disconnect() {
    console.log('Disconnecting from peer');
    
    if (this.currentConnection) {
      this.currentConnection.close();
      this.currentConnection = null;
    }
    
    this.remoteStream = null;
    this._updateConnectionStatus('ready');
  }

  /**
   * Clean up all resources
   */
  cleanup() {
    console.log('Cleaning up PeerConnectionManager');
    
    if (this.currentConnection) {
      this.currentConnection.close();
    }
    
    if (this.peer) {
      this.peer.destroy();
    }
    
    this.peer = null;
    this.currentConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.peerId = null;
    
    console.log('PeerConnectionManager cleaned up');
  }
}

export default PeerConnectionManager;
