"use client";
import { useState, useEffect } from "react";

interface MusicPlayerProps {
  filename: string;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ filename }) => {
  const [audioSrc, setAudioSrc] = useState<string>("");

  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/music/stream/${filename}`);
        if (!response.ok) {
          throw new Error("Failed to fetch music file");
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setAudioSrc(url);
      } catch (error) {
        console.error("Error fetching music file:", error);
      }
    };

    fetchMusic();
  }, [filename]);

  return (
    <div>
      <audio controls src={audioSrc}>
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default MusicPlayer;