// HTML5 Audio Player for IELTS Listening Sections
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RotateCcw,
  Loader2,
  AlertCircle,
  Headphones 
} from 'lucide-react';

// Use proxy path for local development, backend URL for production
const getBackendUrl = () => {
  if (process.env.NODE_ENV === 'development' && window.location.hostname === 'localhost') {
    return '/functions'; // Use proxy path for local development
  }
  return process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';
};

export const AudioPlayer = ({ audioUrl, onProgressChange, initialTime = 0, className = '' }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialTime);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playCount, setPlayCount] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // Initialize audio element
  useEffect(() => {
    if (!audioUrl) {
      setError('No audio file specified');
      setLoading(false);
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    // Construct full audio URL with proper encoding
    const backendUrl = getBackendUrl();
    const fullAudioUrl = audioUrl.startsWith('http') 
      ? audioUrl 
      : `${backendUrl}${encodeURI(audioUrl)}`;

    console.log('Loading audio:', fullAudioUrl);
    audio.src = fullAudioUrl;
    audio.preload = 'metadata';

    // Audio event listeners
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setLoading(false);
      setIsReady(true);
      console.log('Audio loaded:', { duration: audio.duration });
    };

    const handleCanPlay = () => {
      setLoading(false);
      setIsReady(true);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (onProgressChange) {
        onProgressChange(audio.currentTime);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      console.log('Audio playback ended');
    };

    const handleError = (e) => {
      console.error('Audio loading error:', e, audio.error);
      setError(`Failed to load audio: ${audio.error?.message || 'Unknown error'}`);
      setLoading(false);
      setIsReady(false);
    };

    const handleLoadStart = () => {
      setLoading(true);
    };

    const handleWaiting = () => {
      setLoading(true);
    };

    const handleCanPlayThrough = () => {
      setLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);

    // Set initial time if provided
    if (initialTime > 0 && audio.duration > 0) {
      audio.currentTime = initialTime;
    }

    // Load the audio
    audio.load();

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
    };
  }, [audioUrl]);

  // Handle play/pause
  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio || !isReady) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
        if (currentTime === 0 || currentTime === duration) {
          setPlayCount(prev => prev + 1);
        }
      }
    } catch (err) {
      console.error('Playback error:', err);
      setError('Failed to play audio');
    }
  };

  // Handle seek
  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !isReady || duration === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  // Restart audio
  const handleRestart = () => {
    const audio = audioRef.current;
    if (!audio || !isReady) return;

    audio.currentTime = 0;
    setCurrentTime(0);
    setPlayCount(prev => prev + 1);
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === Infinity) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 shadow-md ${className}`}>
      {/* Hidden audio element */}
      <audio ref={audioRef} preload="metadata" />

      {/* Audio Player Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Headphones className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">IELTS Listening Audio</h3>
        </div>
        {playCount > 0 && (
          <div className="text-sm text-gray-600">
            Plays: {playCount}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div 
        className="relative h-2 bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300 transition-colors mb-2"
        onClick={handleSeek}
      >
        <div 
          className="absolute h-full bg-blue-600 rounded-full transition-all"
          style={{ width: `${progressPercentage}%` }}
        />
        <div 
          className="absolute h-4 w-4 bg-blue-600 rounded-full -top-1 -ml-2 shadow-lg"
          style={{ left: `${progressPercentage}%` }}
        />
      </div>

      {/* Time Display */}
      <div className="flex justify-between text-sm text-gray-600 mb-4">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center space-x-4">
        {/* Restart Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleRestart}
          disabled={!isReady || loading}
          className="hover:bg-gray-100"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        {/* Play/Pause Button */}
        <Button
          size="lg"
          onClick={togglePlayPause}
          disabled={!isReady || loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6"
        >
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </Button>

        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleMute}
            disabled={!isReady}
            className="hover:bg-gray-100"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            disabled={!isReady}
            className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center mt-4 text-sm text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Loading audio...
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
