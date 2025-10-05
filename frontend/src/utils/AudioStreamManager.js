import * as Tone from 'tone';

/**
 * AudioStreamManager
 * Captures Tone.js synthesized audio and provides it as a MediaStream
 * for WebRTC transmission
 */
class AudioStreamManager {
  constructor() {
    this.audioDestination = null;
    this.mediaStream = null;
  }

  /**
   * Initialize and capture Tone.js audio output
   * @returns {MediaStream} Audio stream from Tone.js
   */
  initialize() {
    if (this.mediaStream) {
      return this.mediaStream;
    }

    try {
      // Create a MediaStreamDestination node to capture Tone.js audio
      this.audioDestination = Tone.context.createMediaStreamDestination();
      
      // Connect Tone's main output to our capture destination
      // This allows us to capture all synthesized audio
      Tone.getDestination().connect(this.audioDestination);
      
      // Get the media stream
      this.mediaStream = this.audioDestination.stream;
      
      console.log('AudioStreamManager initialized, audio stream created');
      return this.mediaStream;
    } catch (error) {
      console.error('Failed to initialize AudioStreamManager:', error);
      return null;
    }
  }

  /**
   * Get the current audio stream
   * @returns {MediaStream|null}
   */
  getStream() {
    return this.mediaStream;
  }

  /**
   * Check if the audio stream is active
   * @returns {boolean}
   */
  isActive() {
    return this.mediaStream && this.mediaStream.active;
  }

  /**
   * Clean up resources
   */
  cleanup() {
    if (this.audioDestination) {
      try {
        Tone.getDestination().disconnect(this.audioDestination);
      } catch (error) {
        console.error('Error disconnecting audio destination:', error);
      }
      this.audioDestination = null;
    }
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    console.log('AudioStreamManager cleaned up');
  }
}

// Export singleton instance
const audioStreamManagerInstance = new AudioStreamManager();
export default audioStreamManagerInstance;
