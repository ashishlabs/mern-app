import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import * as mm from "music-metadata";

const musicDir = path.join(__dirname, "../music");

const getSongMetadata = async (file: string) => {
  const filePath = path.join(musicDir, file);
  try {
    const metadata = await mm.parseFile(filePath);
    return {
      filename: file,
      title: path.parse(file).name,
      artist: metadata.common.artist || "Unknown Artist",
      album: metadata.common.album || "Unknown Album",
      genre: metadata.common.genre?.join(", ") || "Unknown Genre",
      duration: metadata.format.duration, // in seconds
    };
  } catch (err) {
    console.error(`Failed to read metadata for ${file}`, err);
    return {
      filename: file,
      title: path.parse(file).name,
      artist: "Unknown Artist",
      album: "Unknown Album",
      genre: "Unknown Genre",
      duration: 0,
    };
  }
};

export const getSongs = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = await fs.promises.readdir(musicDir);
    const mp3Files = files.filter((file) => file.endsWith(".mp3")); // Filter only mp3 files
    const songsPromises = mp3Files.map(getSongMetadata);
    const songs = await Promise.all(songsPromises);
    res.json(songs);
  } catch (err) {
    console.error("Failed to read music directory", err);
    res.status(500).send("Failed to read music directory");
  }
};


