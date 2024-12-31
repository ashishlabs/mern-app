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

const streamFile = (filePath: string, range: string | undefined, res: Response) => {
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;

  if (range) {
    const [start, end] = range.replace(/bytes=/, "").split("-").map(Number);
    if (start >= fileSize) {
      res.status(416).send(`Requested range not satisfiable: ${start} >= ${fileSize}`);
      return;
    }
    const chunksize = (end || fileSize - 1) - start + 1;
    const file = fs.createReadStream(filePath, { start, end: end || fileSize - 1 });

    const headers = {
      "Content-Range": `bytes ${start}-${end || fileSize - 1}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "audio/mpeg",
      "Cross-Origin-Resource-Policy": "cross-origin",
    };

    res.writeHead(206, headers);
    file.pipe(res);
  } else {
    const headers = {
      "Content-Length": fileSize,
      "Content-Type": "audio/mpeg",
    };
    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  }
};

export const streamMusic = (req: Request, res: Response): void => {
  const filePath = path.join(musicDir, req.params.filename);

  if (!fs.existsSync(filePath)) {
    res.status(404).send("File not found");
    return;
  }

  streamFile(filePath, req.headers.range, res);
};
