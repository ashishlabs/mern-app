import { Request, Response } from 'express';
import Song from '../../models/songs/song.model';
import fs from 'fs';
import path from 'path';
import { sendResponse } from '../../utils/response';
import { statusCodes } from '../../config/status.code';
const musicDir = path.join(__dirname, "../../music");


// Get all songs
export const getAllSongs = async (req: Request, res: Response) => {
  try {
    const songs = await Song.find().lean();

    const transformedSongs = songs.map((song) => ({
      id: song._id.toString(),
      title: song.title,
      artist: song.artist,
      album: song.album,
      genre: song.genre,
      duration: song.duration,
      coverArt: song.coverArt,
      thumbnail: song.thumbnail,
      url: song.url,
      fileName: song.filename,
    }));
    sendResponse(res,statusCodes.OK,'Songs fetched successfully',transformedSongs)
  } catch (err) {
    sendResponse(res,statusCodes.NOT_FOUND,'Error fetching songs',[])
  }
};

// Search songs by title, artist, album, or genre
export const searchSongs = async (req: Request, res: Response) => {
  const { query } = req.query;

  try {
    const songs = await Song.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { artist: { $regex: query, $options: 'i' } },
        { album: { $regex: query, $options: 'i' } },
        { genre: { $regex: query, $options: 'i' } }
      ]
    }).lean();
    const transformedSongs = songs.map((song) => ({
      id: song._id.toString(),
      title: song.title,
      artist: song.artist,
      album: song.album,
      genre: song.genre,
      duration: song.duration,
      coverArt: song.coverArt,
      thumbnail: song.thumbnail,
      url: song.url,
      fileName: song.filename,
    }));
    sendResponse(res,statusCodes.OK,'Songs fetched successfully',transformedSongs)
  } catch (err) {
    sendResponse(res,statusCodes.NOT_FOUND,'Error fetching songs',[])
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

