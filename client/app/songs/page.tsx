"use client";
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBarsStaggered, faShare, faAdd, faList, faTimes } from "@fortawesome/free-solid-svg-icons";
import HomeLayout from "@/components/home/Home";
import MusicPlayer from "@/components/MusicPlayer";
import { Song } from "@/model/songs/song";
import { apiFetch } from "@/utils/api";

const SongList: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState<string | null>(null);
    const [currentSongId, setCurrentSongId] = useState<string | null>(null);
    const [songs, setSongs] = useState<Song[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
    const [recommendedSongs, setRecommendedSongs] = useState<Song[]>([]);
    const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
    const [albumSongs, setAlbumSongs] = useState<Song[]>([]);
    const [activeTab, setActiveTab] = useState("all");
    const [isLoading, setIsLoading] = useState(false);
    const [queue, setQueue] = useState<Song[]>([]);
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
    const [favoriteSongs, setFavoriteSongs] = useState<Song[]>([]);
    const [isQueueOpen, setIsQueueOpen] = useState(false);
    const [showSnackbar, setShowSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const handlePlayPause = async (id: string) => {
        if (isPlaying === id) {
            setIsPlaying(null);
            setCurrentSongId(null);
        } else {
            setCurrentSongId(id);
            setIsPlaying(id);
            await saveSongPlayStatus(id); // API call to save play status
        }
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    // Debounce the search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 1000); // Delay the API call by 1000ms

        return () => {
            clearTimeout(timer); // Clear the previous timeout if the search query changes
        };
    }, [searchQuery]);

    // API call to save the song play status
    const saveSongPlayStatus = async (songId: string) => {
        try {
            const response = await apiFetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/songs/save`,
                {
                    method: "POST",
                    body: { songId },
                }
            );
            console.log("Song play status saved:", response);
        } catch (error) {
            console.error("Error saving play status:", error);
        }
    };

    const fetchTabData = async (tabValue: string) => {
        setIsLoading(true);
        try {
            let response;
            switch (tabValue) {
                case 'all':
                    response = await apiFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/songs`);
                    setSongs(response?.data || []);
                    break;
                case 'recommended':
                    response = await apiFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/songs/recommended`);
                    setRecommendedSongs(response?.data || []);
                    break;
                case 'trending':
                    response = await apiFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/songs/trending`);
                    setTrendingSongs(response?.data || []);
                    break;
                case 'albums':
                    response = await apiFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/songs/albums`);
                    setAlbumSongs(response?.data || []);
                    break;
                case 'favorites':
                    await fetchFavoriteSongs();
                    break;
            }
        } catch (error) {
            console.error(`Error fetching ${tabValue} songs:`, error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
    };

    // Keep only this useEffect and modify it to handle all cases
    useEffect(() => {
        if (debouncedSearchQuery.trim()) {
            const fetchSearchResults = async () => {
                setIsLoading(true);
                try {
                    const response = await apiFetch(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL}/songs/search?query=${debouncedSearchQuery}&tab=${activeTab}`
                    );
                    switch (activeTab) {
                        case 'all':
                            setSongs(response?.data || []);
                            break;
                        case 'recommended':
                            setRecommendedSongs(response?.data || []);
                            break;
                        case 'trending':
                            setTrendingSongs(response?.data || []);
                            break;
                        case 'albums':
                            setAlbumSongs(response?.data || []);
                            break;
                    }
                } catch (error) {
                    console.error("Error fetching search results:", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchSearchResults();
        } else {
            fetchTabData(activeTab);
        }
    }, [debouncedSearchQuery, activeTab]);

    const addToQueue = (song: Song) => {
        setQueue(prev => [...prev, song]);
        showNotification(`Added "${song.title}" to queue`);
    };

    const toggleFavorite = async (songId: string) => {
        try {
            const method = favorites.has(songId) ? 'DELETE' : 'POST';
            await apiFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/songs/favorites/${songId}`, {
                method,
            });

            setFavorites(prev => {
                const newFavorites = new Set(prev);
                if (newFavorites.has(songId)) {
                    newFavorites.delete(songId);
                    showNotification('Removed from favorites');
                } else {
                    newFavorites.add(songId);
                    showNotification('Added to favorites');
                }
                return newFavorites;
            });

            // Refresh favorite songs list if we're on the favorites tab
            if (activeTab === 'favorites') {
                await fetchFavoriteSongs();
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            showNotification('Failed to update favorites');
        }
    };

    const shareSong = async (song: Song) => {
        try {
            // Check if running in mobile browser and native share is available
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

            if (isMobile && navigator.share) {
                // Use native share on mobile devices
                await navigator.share({
                    title: song.title,
                    text: `Check out ${song.title} by ${song.artist}!`,
                    url: `${window.location.origin}/songs/${song.id}`
                });
            } else if (navigator.clipboard) {
                // Use clipboard API if available
                await navigator.clipboard.writeText(
                    `${window.location.origin}/songs/${song.id}`
                );
                alert('Link copied to clipboard!');
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = `${window.location.origin}/songs/${song.id}`;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    alert('Link copied to clipboard!');
                } catch (err) {
                    alert('Failed to copy link. Please copy it manually.');
                } finally {
                    document.body.removeChild(textArea);
                }
            }
        } catch (error) {
            console.error('Error sharing song:', error);
            alert('Failed to share. Please try again.');
        }
    };

    // Initialize audio context
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const analyserNode = audioCtx.createAnalyser();
            setAudioContext(audioCtx);
            setAnalyser(analyserNode);
        }
    }, []);

    const fetchFavoriteSongs = async () => {
        try {
            const response = await apiFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/songs/favorites`);
            setFavoriteSongs(response?.data || []);
            const favoriteIds = new Set((response?.data || []).map(song => song.id as string));
            setFavorites(favoriteIds as Set<string>);
        } catch (error) {
            console.error('Error fetching favorite songs:', error);
        }
    };

    useEffect(() => {
        fetchFavoriteSongs();
    }, []);

    const renderSongList = (songs: Song[]) => (
        <div className="space-y-2">
            {songs.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-400">No songs found</p>
                </div>
            ) : (
                songs.map((song) => (
                    <div
                        key={song.id}
                        className={`flex items-center justify-between p-3 rounded-lg 
                                  transition-all duration-300 group cursor-pointer
                                  ${currentSongId === song.id
                                ? "bg-blue-500/20 border-[1.5px] border-blue-500/40"
                                : "bg-gray-800/40 hover:bg-gray-700/40 border-[1px] border-gray-800 hover:border-gray-700"
                            }`}
                        onClick={() => handlePlayPause(song.id)}
                    >
                        <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center 
                                           transition-all duration-300
                                           ${currentSongId === song.id
                                    ? "bg-blue-500/30 animate-pulse"
                                    : "bg-gray-700/50 group-hover:bg-gray-600/50"
                                }`}>
                                {currentSongId === song.id && isPlaying === song.id ? (
                                    <span className="text-blue-400">▶️</span>
                                ) : (
                                    <span>🎵</span>
                                )}
                            </div>
                            <div className="ml-3">
                                <p className={`text-sm font-medium transition-colors duration-300
                                                 ${currentSongId === song.id
                                        ? "text-blue-400 font-semibold"
                                        : "text-gray-200 group-hover:text-blue-300"
                                    }`}>
                                    {song.title}
                                </p>
                                <p className={`text-xs ${currentSongId === song.id ? 'text-blue-300' : 'text-gray-400'}`}>
                                    {song.artist}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(song.id);
                                }}
                                className="text-gray-400 hover:text-red-400 transition-colors"
                            >
                                {favorites.has(song.id) ? '❤️' : '🤍'}
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    addToQueue(song);
                                }}
                                className="text-gray-400 hover:text-blue-400 transition-colors"
                            >
                                <FontAwesomeIcon icon={faAdd} />
                            </button>
                            {/* <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    shareSong(song);
                                }}
                                className="text-gray-400 hover:text-blue-400 transition-colors"
                            >
                                <FontAwesomeIcon icon={faShare} />
                            </button> */}
                            {currentSongId === song.id && isPlaying === song.id && (
                                <div className="flex items-center space-x-1">
                                    <div className="w-1 h-3 bg-blue-400 animate-music-bar-1"></div>
                                    <div className="w-1 h-4 bg-blue-400 animate-music-bar-2"></div>
                                    <div className="w-1 h-2 bg-blue-400 animate-music-bar-3"></div>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );

    const getActiveSongCount = () => {
        switch (activeTab) {
            case 'recommended':
                return recommendedSongs.length;
            case 'trending':
                return trendingSongs.length;
            default:
                return songs.length;
        }
    };

    const removeFromQueue = (index: number) => {
        setQueue(prev => prev.filter((_, i) => i !== index));
    };

    const showNotification = (message: string) => {
        setSnackbarMessage(message);
        setShowSnackbar(true);
        setTimeout(() => setShowSnackbar(false), 3000); // Hide after 3 seconds
    };

    return (
        <HomeLayout>
            <div className="h-screen flex flex-col bg-gradient-to-b from-gray-950 to-black text-white relative">
                <div className="flex flex-col h-full pb-24">
                    <header className="hidden md:block flex-none px-6 py-4 bg-gray-900/40 backdrop-blur-sm border-b border-gray-800/50">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Tracks
                        </h1>
                        <p className="text-sm text-gray-400 mt-1">
                            {isLoading ?
                                'Loading...' :
                                `${getActiveSongCount()} ${getActiveSongCount() === 1 ? 'track' : 'tracks'} available`
                            }
                        </p>
                    </header>

                    <div className="flex-1 flex flex-col overflow-hidden">
                        <Tabs defaultValue="all" className="h-full" onValueChange={handleTabChange}>
                            <div className="sticky top-0 z-50 bg-gray-950/95 mb-2">
                                <div className="px-4 sm:px-6 pt-4">
                                    {/* Search Input with Icon */}
                                    <div className="relative mb-6 group">
                                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                            <svg className="w-4 h-4 text-gray-400 group-focus-within:text-blue-400 transition-colors duration-300"
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search songs..."
                                            value={searchQuery}
                                            onChange={handleSearchChange}
                                            className="w-full pl-12 pr-4 py-3.5 bg-gray-900/50 text-white rounded-2xl
                                                     border border-gray-700/50 
                                                     focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 
                                                     transition-all duration-300 placeholder-gray-500"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
                                    </div>

                                    {/* Tabs */}
                                    <TabsList className="flex overflow-x-auto whitespace-nowrap bg-transparent p-2 space-x-4">
                                        <TabsTrigger
                                            value="all"
                                            className="group flex items-center gap-2 px-4 py-2 rounded-xl
                                                     transition-all duration-300
                                                     data-[state=active]:bg-blue-500/15
                                                     data-[state=active]:text-blue-400
                                                     data-[state=active]:border-blue-500/30
                                                     text-gray-400 hover:text-gray-200
                                                     border border-gray-800 hover:border-gray-700
                                                     bg-gray-900/50 hover:bg-gray-800/50
                                                     focus:outline-none"
                                        >
                                            <span className="text-lg group-data-[state=active]:text-blue-400">🎵</span>
                                            <span className="text-sm font-medium">All Songs</span>
                                            <div className="ml-2 px-2 py-0.5 rounded-md bg-gray-800/80 
                                                          text-xs font-medium text-gray-400
                                                          group-data-[state=active]:bg-blue-500/20
                                                          group-data-[state=active]:text-blue-300">
                                                {songs.length}
                                            </div>
                                        </TabsTrigger>

                                        <TabsTrigger
                                            value="recommended"
                                            className="group flex items-center gap-2 px-4 py-2 rounded-xl
                                                     transition-all duration-300
                                                     data-[state=active]:bg-purple-500/15
                                                     data-[state=active]:text-purple-400
                                                     data-[state=active]:border-purple-500/30
                                                     text-gray-400 hover:text-gray-200
                                                     border border-gray-800 hover:border-gray-700
                                                     bg-gray-900/50 hover:bg-gray-800/50
                                                     focus:outline-none"
                                        >
                                            <span className="text-lg group-data-[state=active]:text-purple-400">✨</span>
                                            <span className="text-sm font-medium">For You</span>
                                            <div className="ml-2 px-2 py-0.5 rounded-md bg-gray-800/80 
                                                          text-xs font-medium text-gray-400
                                                          group-data-[state=active]:bg-purple-500/20
                                                          group-data-[state=active]:text-purple-300">
                                                {recommendedSongs.length}
                                            </div>
                                        </TabsTrigger>

                                        <TabsTrigger
                                            value="trending"
                                            className="group flex items-center gap-2 px-4 py-2 rounded-xl
                                                     transition-all duration-300
                                                     data-[state=active]:bg-pink-500/15
                                                     data-[state=active]:text-pink-400
                                                     data-[state=active]:border-pink-500/30
                                                     text-gray-400 hover:text-gray-200
                                                     border border-gray-800 hover:border-gray-700
                                                     bg-gray-900/50 hover:bg-gray-800/50
                                                     focus:outline-none"
                                        >
                                            <span className="text-lg group-data-[state=active]:text-pink-400">🔥</span>
                                            <span className="text-sm font-medium">Trending</span>
                                            <div className="ml-2 px-2 py-0.5 rounded-md bg-gray-800/80 
                                                          text-xs font-medium text-gray-400
                                                          group-data-[state=active]:bg-pink-500/20
                                                          group-data-[state=active]:text-pink-300">
                                                {trendingSongs.length}
                                            </div>
                                        </TabsTrigger>

                                        <TabsTrigger
                                            value="favorites"
                                            className="group flex items-center gap-2 px-4 py-2 rounded-xl
                                                     transition-all duration-300
                                                     data-[state=active]:bg-red-500/15
                                                     data-[state=active]:text-red-400
                                                     data-[state=active]:border-red-500/30
                                                     text-gray-400 hover:text-gray-200
                                                     border border-gray-800 hover:border-gray-700
                                                     bg-gray-900/50 hover:bg-gray-800/50
                                                     focus:outline-none"
                                        >
                                            <span className="text-lg group-data-[state=active]:text-red-400">❤️</span>
                                            <span className="text-sm font-medium">Favorites</span>
                                            <div className="ml-2 px-2 py-0.5 rounded-md bg-gray-800/80 
                                                          text-xs font-medium text-gray-400
                                                          group-data-[state=active]:bg-red-500/20
                                                          group-data-[state=active]:text-red-300">
                                                {favoriteSongs.length}
                                            </div>
                                        </TabsTrigger>
                                    </TabsList>
                                </div>
                                <div className="h-px mt-4 bg-gradient-to-r from-transparent via-gray-800/50 to-transparent"></div>
                            </div>

                            <div className=" h-full px-4 sm:px-6 overflow-y-auto">
                                <TabsContent value="all" className="mt-0 mb-24 focus-visible:outline-none focus-visible:ring-0">
                                    {isLoading ? (
                                        <div className="text-center py-4">Loading...</div>
                                    ) : (
                                        renderSongList(songs)
                                    )}
                                </TabsContent>

                                <TabsContent value="recommended" className="mt-0 mb-24">
                                    {isLoading ? (
                                        <div className="text-center py-4">Loading...</div>
                                    ) : (
                                        renderSongList(recommendedSongs)
                                    )}
                                </TabsContent>

                                <TabsContent value="trending" className="mt-0 mb-24">
                                    {isLoading ? (
                                        <div className="text-center py-4">Loading...</div>
                                    ) : (
                                        renderSongList(trendingSongs)
                                    )}
                                </TabsContent>

                                <TabsContent value="favorites" className="mt-0 mb-24">
                                    {isLoading ? (
                                        <div className="text-center py-4">Loading...</div>
                                    ) : (
                                        renderSongList(favoriteSongs)
                                    )}
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </div>

                <div className={`fixed right-0 top-0 h-full w-80 bg-gray-900/95 backdrop-blur-md transform transition-transform duration-300 ease-in-out z-50 border-l border-gray-800/50 ${isQueueOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="p-4 border-b border-gray-800/50">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-200">Queue</h2>
                            <button
                                onClick={() => setIsQueueOpen(false)}
                                className="text-gray-400 hover:text-gray-200 transition-colors"
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                    </div>
                    <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
                        {queue.length === 0 ? (
                            <p className="text-gray-400 text-center">Queue is empty</p>
                        ) : (
                            queue.map((song, index) => (
                                <div
                                    key={`${song.id}-${index}`}
                                    className="flex items-center justify-between p-3 mb-2 rounded-lg bg-gray-800/40 border border-gray-700/50"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-gray-200">{song.title}</p>
                                        <p className="text-xs text-gray-400">{song.artist}</p>
                                    </div>
                                    <button
                                        onClick={() => removeFromQueue(index)}
                                        className="text-gray-400 hover:text-red-400 transition-colors"
                                    >
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <MusicPlayer
                    className="fixed bottom-0 left-0 right-0 border-t border-gray-800/50 bg-gray-950/95 backdrop-blur-md z-50"
                    songs={songs}
                    currentSongId={currentSongId}
                    setCurrentSongId={setCurrentSongId}
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                    audioContext={audioContext}
                    analyser={analyser}
                    queue={queue}
                    setQueue={setQueue}
                    onQueueClick={() => setIsQueueOpen(!isQueueOpen)}
                />
            </div>
            {showSnackbar && (
                <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50">
                    <div className="bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg border border-gray-700/50 backdrop-blur-md">
                        <span className="text-sm">{snackbarMessage}</span>
                    </div>
                </div>
            )}
        </HomeLayout>
    );
};

export default SongList;
