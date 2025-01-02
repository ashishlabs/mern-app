"use client";
import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause, faForward, faBackward } from "@fortawesome/free-solid-svg-icons";

interface Song {
    id: string;
    title: string;
    artist: string;
    url: string;
}

interface MusicPlayerProps {
    songs: Song[];
    currentSongId: string | null;
    setCurrentSongId: (id: string | null) => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ songs, currentSongId, setCurrentSongId }) => {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const currentSong = songs.find(song => song.id === currentSongId);

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play();
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, currentSongId]);

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handleForward = () => {
        const currentIndex = songs.findIndex(song => song.id === currentSongId);
        const nextIndex = (currentIndex + 1) % songs.length;
        setCurrentSongId(songs[nextIndex].id);
    };

    const handleBackward = () => {
        const currentIndex = songs.findIndex(song => song.id === currentSongId);
        const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
        setCurrentSongId(songs[prevIndex].id);
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (audioRef.current) {
            audioRef.current.currentTime = Number(e.target.value);
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <button onClick={handleBackward} className="focus:outline-none">
                    <FontAwesomeIcon icon={faBackward} />
                </button>
                <button onClick={handlePlayPause} className="focus:outline-none">
                    <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
                </button>
                <button onClick={handleForward} className="focus:outline-none">
                    <FontAwesomeIcon icon={faForward} />
                </button>
            </div>
            <div className="flex-1 mx-4">
                <div className="text-center">
                    <h3 className="text-lg font-bold">{currentSong?.title || "No song playing"}</h3>
                    <p className="text-gray-400">{currentSong?.artist}</p>
                </div>
                <input
                    type="range"
                    min="0"
                    max={audioRef.current?.duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full"
                />
            </div>
            <audio
                ref={audioRef}
                src={currentSong?.url}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleForward}
            />
        </div>
    );
};

export default MusicPlayer;