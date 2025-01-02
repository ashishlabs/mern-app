"use client";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV, faBarsStaggered } from "@fortawesome/free-solid-svg-icons";
import HomeLayout from "@/components/home/Home";
import MusicPlayer from "@/components/MusicPlayer";
import { Song } from "@/model/songs/song";

const SongList: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState<string | null>(null);
    const [currentSongId, setCurrentSongId] = useState<string | null>(null);
    const [songs, setSongs] = useState<Song[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");

    const handlePlayPause = (id: string) => {
        if (isPlaying === id) {
            setIsPlaying(null);
            setCurrentSongId(null);
        } else {
            setCurrentSongId(id);
            setIsPlaying(id);
        }
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    // Debounce the search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 1000); // Delay the API call by 500ms

        return () => {
            clearTimeout(timer); // Clear the previous timeout if the search query changes
        };
    }, [searchQuery]);

    // Fetch songs when debounced search query changes
    useEffect(() => {
        const fetchSongs = async (query: string) => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/songs/search?query=${query}`
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch songs");
                }
                const jsondata = await response.json();
                setSongs(jsondata?.data);
            } catch (error) {
                console.error("Error fetching songs:", error);
            }
        };

        if (debouncedSearchQuery.trim()) {
            fetchSongs(debouncedSearchQuery);
        } else {
            // If search query is empty, fetch all songs
            const fetchAllSongs = async () => {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/songs`);
                    if (!response.ok) {
                        throw new Error("Failed to fetch songs");
                    }
                    const jsondata = await response.json();
                    setSongs(jsondata?.data);
                } catch (error) {
                    console.error("Error fetching songs:", error);
                }
            };

            fetchAllSongs();
        }
    }, [debouncedSearchQuery]);

    return (
        <HomeLayout>
            <div className="h-screen flex flex-col bg-black text-white">
                <header className="px-4 py-2 text-xl font-bold">Tracks</header>
                <div className="px-4 py-2">
                    <input
                        type="text"
                        placeholder="Search songs..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full px-4 py-2 bg-gray-800 text-white rounded-full"
                    />
                </div>
                <div className="flex-1 overflow-y-auto">
                    {songs.map((song) => (
                        <div
                            key={song.id}
                            className={`flex items-center justify-between px-4 py-2 ${currentSongId === song.id ? "bg-gray-800 text-blue-500" : "hover:bg-gray-800 cursor-pointer"
                                }`}
                            onClick={() => handlePlayPause(song.id)}
                        >
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-sm">
                                    🎵
                                </div>
                                <div className="ml-4">
                                    <p className={`text-base font-medium ${currentSongId === song.id ? "text-blue-500" : ""}`}>
                                        {song.title}
                                    </p>
                                    <p className="text-sm text-gray-400">{song.artist}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                {currentSongId === song.id && isPlaying === song.id && (
                                    <FontAwesomeIcon
                                        icon={faBarsStaggered}
                                        className="text-blue-500 text-3xl animate-equalizer"
                                    />
                                )}
                                {/* <FontAwesomeIcon icon={faEllipsisV} /> */}
                            </div>
                        </div>
                    ))}
                </div>
                <MusicPlayer
                    songs={songs}
                    currentSongId={currentSongId}
                    setCurrentSongId={setCurrentSongId}
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                />
            </div>
        </HomeLayout>
    );
};

export default SongList;
