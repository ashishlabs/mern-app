import { Request, Response } from 'express';
import Song from '../../models/songs/song.model';
import fs from 'fs';
import path from 'path';
import { sendResponse } from '../../utils/response';
import { statusCodes } from '../../config/status.code';
import PlayHistory from '../../models/songs/playHistory.model';
import { getUserIdFromToken } from '../../utils/auth';
import logger from '../../utils/logger';
import { send } from 'process';
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
    sendResponse(res, statusCodes.OK, 'Songs fetched successfully', transformedSongs)
  } catch (err) {
    sendResponse(res, statusCodes.NOT_FOUND, 'Error fetching songs', [])
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
    sendResponse(res, statusCodes.OK, 'Songs fetched successfully', transformedSongs)
  } catch (err) {
    sendResponse(res, statusCodes.NOT_FOUND, 'Error fetching songs', [])
  }
};

const streamFile = (filePath: string, range: string | undefined, res: Response) => {
  const stat = fs.statSync(filePath);
  const fileSize = stat.size;

  if (range) {
    const [start, end] = range.replace(/bytes=/, "").split("-").map(Number);
    if (start >= fileSize) {
      sendResponse(res, statusCodes.REQUESTED_RANGE_NOT_SATISFIABLE, `Requested range not satisfiable: ${start} >= ${fileSize}`, {});
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
    sendResponse(res, statusCodes.NOT_FOUND, 'File not found', {});
    return;
  }
  streamFile(filePath, req.headers.range, res);
};

export const savePlayHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserIdFromToken(req.headers.authorization);
    if (!userId) {
      sendResponse(res, statusCodes.UNAUTHORIZED, 'Unauthorized: No valid token provided', {});
      return;
    }
    const { songId } = req.body;
    const playHistory = new PlayHistory({
      userId,
      songId,
    });
    await playHistory.save();
    sendResponse(res, statusCodes.OK, 'Songs fetched successfully', {playHistory});
  } catch (error) {
    logger.error('Error saving play history:', error);
    sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, 'Error saving play history:', {});
  }
};
