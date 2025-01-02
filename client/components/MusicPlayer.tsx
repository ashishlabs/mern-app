"use client";
import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause, faForward, faBackward } from "@fortawesome/free-solid-svg-icons";
import { Song } from "@/model/songs/song";

interface MusicPlayerProps {
  songs: Song[];
  currentSongId: string | null;
  setCurrentSongId: (id: string | null) => void;
  isPlaying: string | null;
  setIsPlaying: (isPlaying: string | null) => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ songs, currentSongId, setCurrentSongId, isPlaying, setIsPlaying }) => {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentSong = songs.find(song => song.id === currentSongId);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        console.log(currentSong)
        audioRef.current.src = `${process.env.NEXT_PUBLIC_API_BASE_URL}/songs/stream/${currentSong?.fileName}`;
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSongId]);

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
    console.log(songs);
    setCurrentSongId(songs[nextIndex].id);
  };

  const handleBackward = () => {
    const currentIndex = songs.findIndex(song => song.id === currentSongId);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    setCurrentSongId(songs[prevIndex].id);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900  py-3 px-4 flex items-center justify-between rounded-full">
      <div className="flex items-center">
        <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-sm">
          🎵
        </div>
        {currentSong && (
          <div className="ml-4">
            <p className="text-base font-medium">{currentSong.title}</p>
            <p className="text-sm text-gray-400">{currentSong.artist}</p>
          </div>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <FontAwesomeIcon icon={faBackward} className="text-xl cursor-pointer" onClick={handleBackward} />
        <button
          className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white text-xl"
          onClick={handlePlayPause}
        >
          <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
        </button>
        <FontAwesomeIcon icon={faForward} className="text-xl cursor-pointer"  onClick={handleForward} />
      </div>
      <audio ref={audioRef} style={{ display: "none" }}>
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};


export default MusicPlayer;
