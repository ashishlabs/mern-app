"use client";
import { useState, useEffect, useRef } from "react";
import HomeLayout from "@/components/home/Home";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons"; // Import FontAwesome icons

interface Song {
  filename: string;
  title: string;
  artist?: string;  // Optional artist property, can be useful for the UI
  thumbnailUrl?: string; // Optional thumbnail URL for the song
}

export default function PlaylistPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Fetch the list of songs from the server
    const fetchSongs = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/music/songs`);
        if (!response.ok) {
          throw new Error("Failed to fetch songs");
        }
        const data = await response.json();
        setSongs(data);
      } catch (error) {
        console.error("Error fetching songs:", error);
      }
    };

    fetchSongs();
  }, []);

  useEffect(() => {
    // Play the song when currentSong is updated
    if (currentSong && audioRef.current) {
      audioRef.current.src = `${process.env.NEXT_PUBLIC_API_BASE_URL}/music/stream/${currentSong}`;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [currentSong]);

  const togglePlayPause = (filename: string) => {
    if (currentSong === filename) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      setCurrentSong(filename);
    }
  };

  return (
    <HomeLayout>
      <div className="flex flex-col p-8 min-h-screen bg-gray-100">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">My Playlist</h1>
        <ul className="space-y-6">
          {songs.map((song) => (
            <li
              key={song.filename}
              className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 bg-white p-4 rounded-lg shadow-md hover:shadow-xl transition duration-200 sm:space-y-0 sm:space-x-6"
            >
              <div className="relative w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                {/* Song Thumbnail with Play Button on top */}
                <img
                  src={song.thumbnailUrl || "/placeholder-icon.png"} // Use a default icon if no thumbnail URL is provided
                  alt={song.title}
                  className="object-cover w-full h-full"
                />
                <button
                  onClick={() => togglePlayPause(song.filename)}
                  className="absolute inset-0 flex items-center justify-center bg-blue-500 bg-opacity-50 text-white rounded-full p-2 opacity-0 hover:opacity-100 transition-opacity duration-300"
                >
                  {currentSong === song.filename && isPlaying ? (
                    <FontAwesomeIcon icon={faPause} className="w-6 h-6" />
                  ) : (
                    <FontAwesomeIcon icon={faPlay} className="w-6 h-6" />
                  )}
                </button>
              </div>
              <div className="flex-1 sm:text-left sm:ml-0 text-center">
                <span className="block text-lg font-semibold text-gray-900 break-words">{song.title}</span>
                {song.artist && (
                  <span className="block text-sm text-gray-600 break-words">{song.artist}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
        <audio ref={audioRef} style={{ display: "none" }}>
          Your browser does not support the audio element.
        </audio>
      </div>
    </HomeLayout>
  );
}
