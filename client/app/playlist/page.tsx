"use client";
import { useState, useEffect, useRef } from "react";
import Layout from "../layout";

interface Song {
  filename: string;
  title: string;
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
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Playlist</h1>
        <ul>
          {songs.map((song) => (
            <li key={song.filename} className="mb-4">
              <div className="flex justify-between items-center">
                <span>{song.title}</span>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={() => togglePlayPause(song.filename)}
                >
                  {currentSong === song.filename && isPlaying ? "Pause" : "Play"}
                </button>
              </div>
            </li>
          ))}
        </ul>
        <audio ref={audioRef} style={{ display: 'none' }}>
          Your browser does not support the audio element.
        </audio>
      </div>
    </Layout>
  );
}