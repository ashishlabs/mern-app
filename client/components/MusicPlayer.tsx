"use client";
import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause, faForward, faBackward, faVolumeHigh, faVolumeMute, faList } from "@fortawesome/free-solid-svg-icons";
import { Song } from "@/model/songs/song";
import { apiFetch } from "@/utils/api";

interface MusicPlayerProps {
  songs: Song[];
  currentSongId: string | null;
  setCurrentSongId: (id: string | null) => void;
  isPlaying: string | null;
  setIsPlaying: (id: string | null) => void;
  className?: string;
  audioContext?: AudioContext | null;
  analyser?: AnalyserNode | null;
  queue: Song[];
  setQueue: (queue: Song[]) => void;
  onQueueClick: () => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ songs, currentSongId, setCurrentSongId, isPlaying, setIsPlaying, onQueueClick }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const currentSong = songs.find(song => song.id === currentSongId);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
      if (audioRef.current) audioRef.current.muted = true;
    } else {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.muted = false;
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.addEventListener('ended', handleForward);

      if (isPlaying === currentSongId) {
        const audioUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/songs/stream/${currentSong?.fileName}`;
        apiFetch(audioUrl, {
          method: 'GET',
          responseType: 'blob',
        })
          .then((blob) => {
            const audioBlobUrl = URL.createObjectURL(blob);
            audioRef.current.src = audioBlobUrl;
            audioRef.current.volume = volume;
            audioRef.current.muted = isMuted;
            audioRef.current.play().catch(error => {
              console.error('Error playing audio:', error);
            });
          })
          .catch((error) => {
            console.error('Error streaming audio:', error);
          });
      } else {
        audioRef.current.pause();
      }

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
          audioRef.current.removeEventListener('ended', handleForward);
          URL.revokeObjectURL(audioRef.current.src); // Clean up blob URL
        }
      };
    }
  }, [isPlaying, currentSongId, volume, isMuted]);

  const handlePlayPause = () => {
    if (isPlaying === currentSongId) {
      setIsPlaying(null);
    } else {
      setIsPlaying(currentSongId);
    }
  };

  const handleForward = () => {
    const currentIndex = songs.findIndex(song => song.id === currentSongId);
    const nextIndex = (currentIndex + 1) % songs.length;
    setCurrentSongId(songs[nextIndex].id);
    setIsPlaying(songs[nextIndex].id); // Auto-play next song
  };

  const handleBackward = () => {
    const currentIndex = songs.findIndex(song => song.id === currentSongId);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    setCurrentSongId(songs[prevIndex].id);
    setIsPlaying(songs[prevIndex].id); // Auto-play previous song
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touchEnd = e.touches[0].clientX;
    const diff = touchStart - touchEnd;

    // Swipe threshold of 50px
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleForward();
      } else {
        handleBackward();
      }
      setTouchStart(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 py-1 sm:py-2 px-2 sm:px-3">
      <div className="max-w-screen-xl mx-auto">
        <div className="w-full mb-1 sm:mb-2">
          <div className="h-1 bg-gray-600 rounded-lg">
            <div
              className="h-full bg-blue-500"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          {currentSong && (
            <div className="flex items-center sm:justify-start justify-center flex-1 min-w-0 p-3 sm:p-4 bg-gray-800 rounded-lg shadow-lg">
              {/* Icon Container */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-700 rounded-full flex items-center justify-center text-base sm:text-lg">
                🎵
              </div>

              {/* Song Info */}
              <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                <p className="text-sm sm:text-lg font-semibold text-white truncate">
                  {currentSong.title || "Unknown Title"}
                </p>
                <p className="text-xs sm:text-sm text-gray-400 truncate">
                  {currentSong.artist || "Unknown Artist"}
                </p>
              </div>
            </div>

          )}

          <div className="flex items-center justify-center space-x-3 sm:space-x-5 sm:flex-1">
            <FontAwesomeIcon
              icon={faBackward}
              className="text-lg sm:text-xl cursor-pointer hover:text-white transition-colors"
              onClick={handleBackward}
              title="Previous"
            />
            <button
              className="w-10 h-10 sm:w-12 sm:h-12 bg-white text-gray-900 rounded-full flex items-center justify-center text-lg sm:text-xl hover:bg-gray-200 transition-colors"
              onClick={handlePlayPause}
              title={isPlaying === currentSongId ? "Pause" : "Play"}
            >
              <FontAwesomeIcon icon={isPlaying === currentSongId ? faPause : faPlay} />
            </button>
            <FontAwesomeIcon
              icon={faForward}
              className="text-lg sm:text-xl cursor-pointer hover:text-white transition-colors"
              onClick={handleForward}
              title="Next"
            />
            <FontAwesomeIcon
              icon={faList}
              className="text-lg sm:text-xl cursor-pointer hover:text-white transition-colors"
              onClick={onQueueClick}
              title="Queue"
            />
          </div>

          <div className="hidden sm:flex items-center space-x-3 ml-3">
            <FontAwesomeIcon
              icon={isMuted ? faVolumeMute : faVolumeHigh}
              className="text-lg cursor-pointer"
              onClick={toggleMute}
              title={isMuted ? "Unmute" : "Mute"}
            />
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={volume}
              onChange={handleVolumeChange}
              className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div
            className="sm:hidden absolute inset-0 touch-pan-y pointer-events-none"
            style={{ zIndex: 10 }}
            onTouchStart={(e) => {
              e.currentTarget.classList.remove('pointer-events-none');
              handleTouchStart(e);
            }}
            onTouchMove={handleTouchMove}
            onTouchEnd={(e) => {
              e.currentTarget.classList.add('pointer-events-none');
              handleTouchEnd();
            }}
          />
        </div>
      </div>

      <audio ref={audioRef} style={{ display: "none" }}>
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};


export default MusicPlayer;
