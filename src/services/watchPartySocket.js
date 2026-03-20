import { io } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants/config';

class WatchPartySocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.isConnected = false;
  }

  async connect() {
    if (this.socket?.connected) return this.socket;

    try {
      const token = await SecureStore.getItemAsync('token');

      this.socket = io(`${API_URL}/watch-party`, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        console.log('Watch Party socket connected');
        // Re-attach listeners after reconnect
        this.listeners.forEach((callbacks, event) => {
          callbacks.forEach((cb) => {
            this.socket.on(event, cb);
          });
        });
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
        console.log('Watch Party socket disconnected');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Watch Party socket connection error:', error.message);
      });

      return this.socket;
    } catch (error) {
      console.error('Failed to connect watch party socket:', error);
      throw error;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, ...args) {
    if (this.socket?.connected) {
      this.socket.emit(event, ...args);
    }
  }

  // Room events
  joinRoom(roomId, password) {
    this.emit('room:join', { roomId, password });
  }

  leaveRoom(roomId) {
    this.emit('room:leave', { roomId });
  }

  kickUser(roomId, targetUserId) {
    this.emit('room:kick', { roomId, targetUserId });
  }

  updateSettings(roomId, settings) {
    this.emit('room:updateSettings', { roomId, settings });
  }

  deleteRoom(roomId) {
    this.emit('room:delete', { roomId });
  }

  // Playback events
  play(roomId, currentTime) {
    this.emit('playback:play', { roomId, currentTime });
  }

  pause(roomId, currentTime) {
    this.emit('playback:pause', { roomId, currentTime });
  }

  seek(roomId, currentTime) {
    this.emit('playback:seek', { roomId, currentTime });
  }

  changeMedia(roomId, media) {
    this.emit('playback:changeMedia', { roomId, media });
  }

  requestSync(roomId) {
    this.emit('playback:requestSync', { roomId });
  }

  hostHeartbeat(roomId, currentTime) {
    this.emit('playback:hostHeartbeat', { roomId, currentTime });
  }

  // Chat events
  sendMessage(roomId, content) {
    this.emit('chat:send', { roomId, content });
  }

  // Time sync
  timePing() {
    this.emit('time:ping', { clientTime: Date.now() });
  }
}

// Singleton instance
const watchPartySocket = new WatchPartySocketService();
export default watchPartySocket;
