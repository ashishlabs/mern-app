import { Request, Response } from 'express';
import Song, { ISong } from '../../models/songs/song.model';
import fs from 'fs';
import path from 'path';
import { sendResponse } from '../../utils/response';
import { statusCodes } from '../../config/status.code';
import PlayHistory from '../../models/songs/playHistory.model';
import { getUserIdFromToken } from '../../utils/auth';
import logger from '../../utils/logger';
import { send } from 'process';
import mongoose from 'mongoose';
import Favorite from '../../models/songs/favorite.model';
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

export const getRecommendedSongs = async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromToken(req.headers.authorization);
    if (!userId) {
      sendResponse(res, statusCodes.UNAUTHORIZED, 'Unauthorized: No valid token provided', {});
      return;
    }

    // Get user's play history and aggregate most played genres and artists
    const userPreferences = await PlayHistory.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'songs',
          localField: 'songId',
          foreignField: '_id',
          as: 'songDetails'
        }
      },
      { $unwind: '$songDetails' },
      {
        $group: {
          _id: null,
          genres: { $addToSet: '$songDetails.genre' },
          artists: { $addToSet: '$songDetails.artist' }
        }
      }
    ]);

    if (!userPreferences.length) {
      // If no play history, return random songs
      const randomSongs = await Song.aggregate([
        { $sample: { size: 10 } }
      ]);
      const transformedSongs = randomSongs.map(song => ({
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
      sendResponse(res, statusCodes.OK, 'Random recommendations fetched successfully', transformedSongs);
      return;
    }

    // Find songs with similar genres or artists
    const { genres, artists } = userPreferences[0];
    const recommendedSongs = await Song.find({
      $or: [
        { genre: { $in: genres } },
        { artist: { $in: artists } }
      ],
      _id: { 
        $nin: (await PlayHistory.find({ userId }).distinct('songId')) // Exclude already played songs
      }
    })
    .limit(10)
    .lean();

    const transformedSongs = recommendedSongs.map(song => ({
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

    sendResponse(res, statusCodes.OK, 'Recommendations fetched successfully', transformedSongs);
  } catch (error) {
    logger.error('Error getting recommendations:', error);
    sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, 'Error fetching recommendations', []);
  }
};

// Get trending songs (based on play count in the last 30 days)
export const getTrendingSongs = async (req: Request, res: Response) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // First check if we have any play history
    const hasPlayHistory = await PlayHistory.exists({
      createdAt: { $gte: thirtyDaysAgo }
    });

    if (!hasPlayHistory) {
      // If no recent play history, return most recently added songs
      const recentSongs = await Song.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      const transformedRecentSongs = recentSongs.map(song => ({
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
        playCount: 0
      }));

      sendResponse(res, statusCodes.OK, 'Recent songs fetched as no trending data available', transformedRecentSongs);
      return;
    }

    const trendingSongs = await PlayHistory.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$songId',
          playCount: { $sum: 1 }
        }
      },
      {
        $sort: { playCount: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'songs',
          localField: '_id',
          foreignField: '_id',
          as: 'songDetails'
        }
      },
      {
        $unwind: '$songDetails'
      },
      // Add a project stage to ensure we only get non-null song details
      {
        $match: {
          'songDetails': { $ne: null }
        }
      }
    ]);

    if (!trendingSongs || trendingSongs.length === 0) {
      // Fallback to random songs if no trending songs found
      const randomSongs = await Song.aggregate([
        { $sample: { size: 10 } }
      ]);

      const transformedRandomSongs = randomSongs.map(song => ({
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
        playCount: 0
      }));

      sendResponse(res, statusCodes.OK, 'Random songs fetched as no trending data available', transformedRandomSongs);
      return;
    }

    const transformedSongs = trendingSongs.map((item) => ({
      id: item.songDetails._id.toString(),
      title: item.songDetails.title,
      artist: item.songDetails.artist,
      album: item.songDetails.album,
      genre: item.songDetails.genre,
      duration: item.songDetails.duration,
      coverArt: item.songDetails.coverArt,
      thumbnail: item.songDetails.thumbnail,
      url: item.songDetails.url,
      fileName: item.songDetails.filename,
      playCount: item.playCount
    }));

    sendResponse(res, statusCodes.OK, 'Trending songs fetched successfully', transformedSongs);
  } catch (err) {
    logger.error('Error fetching trending songs:', err);
    sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, 'Error fetching trending songs', []);
  }
};

// Get user's recently played songs
export const getRecentlyPlayed = async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromToken(req.headers.authorization);
    if (!userId) {
      sendResponse(res, statusCodes.UNAUTHORIZED, 'Unauthorized: No valid token provided', {});
      return;
    }

    const recentlyPlayed = await PlayHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate({
        path: 'songId',
        model: 'Song',
        select: 'title artist album genre duration coverArt thumbnail url filename'
      })
      .lean();

    const transformedSongs = recentlyPlayed.map(history => ({
      id: history.songId._id.toString(),
      title: history.songId.title,
      artist: history.songId.artist,
      album: history.songId.album,
      genre: history.songId.genre,
      duration: history.songId.duration,
      coverArt: history.songId.coverArt,
      thumbnail: history.songId.thumbnail,
      url: history.songId.url,
      fileName: history.songId.filename,
      playedAt: history.createdAt
    }));

    sendResponse(res, statusCodes.OK, 'Recently played songs fetched successfully', transformedSongs);
  } catch (error) {
    logger.error('Error fetching recently played songs:', error);
    sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, 'Error fetching recently played songs', []);
  }
};

// Get songs by genre
export const getSongsByGenre = async (req: Request, res: Response) => {
  try {
    const { genre } = req.params;
    const songs = await Song.find({ genre: { $regex: genre, $options: 'i' } }).lean();

    const transformedSongs = songs.map(song => ({
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

    sendResponse(res, statusCodes.OK, 'Songs by genre fetched successfully', transformedSongs);
  } catch (error) {
    logger.error('Error fetching songs by genre:', error);
    sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, 'Error fetching songs by genre', []);
  }
};

// Get songs by artist
export const getSongsByArtist = async (req: Request, res: Response) => {
  try {
    const { artist } = req.params;
    const songs = await Song.find({ artist: { $regex: artist, $options: 'i' } }).lean();

    const transformedSongs = songs.map(song => ({
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

    sendResponse(res, statusCodes.OK, 'Songs by artist fetched successfully', transformedSongs);
  } catch (error) {
    logger.error('Error fetching songs by artist:', error);
    sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, 'Error fetching songs by artist', []);
  }
};

// Get available genres
export const getGenres = async (req: Request, res: Response) => {
  try {
    const genres = await Song.distinct('genre');
    sendResponse(res, statusCodes.OK, 'Genres fetched successfully', genres);
  } catch (error) {
    logger.error('Error fetching genres:', error);
    sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, 'Error fetching genres', []);
  }
};

// Get available artists
export const getArtists = async (req: Request, res: Response) => {
  try {
    const artists = await Song.distinct('artist');
    sendResponse(res, statusCodes.OK, 'Artists fetched successfully', artists);
  } catch (error) {
    logger.error('Error fetching artists:', error);
    sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, 'Error fetching artists', []);
  }
};

// Get albums by artist
export const getAlbumsByArtist = async (req: Request, res: Response) => {
  try {
    const { artist } = req.params;
    const albums = await Song.distinct('album', { artist: { $regex: artist, $options: 'i' } });
    sendResponse(res, statusCodes.OK, 'Albums fetched successfully', albums);
  } catch (error) {
    logger.error('Error fetching albums:', error);
    sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, 'Error fetching albums', []);
  }
};

// Add song to favorites
export const addToFavorites = async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromToken(req.headers.authorization);
    if (!userId) {
      sendResponse(res, statusCodes.UNAUTHORIZED, 'Unauthorized: No valid token provided', {});
      return;
    }

    const { songId } = req.params;
    const favorite = new Favorite({
      userId,
      songId
    });

    await favorite.save();
    sendResponse(res, statusCodes.OK, 'Song added to favorites successfully', { favorite });
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      sendResponse(res, statusCodes.BAD_REQUEST, 'Song is already in favorites', {});
      return;
    }
    logger.error('Error adding song to favorites:', error);
    sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, 'Error adding song to favorites', {});
  }
};

// Remove song from favorites
export const removeFromFavorites = async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromToken(req.headers.authorization);
    if (!userId) {
      sendResponse(res, statusCodes.UNAUTHORIZED, 'Unauthorized: No valid token provided', {});
      return;
    }

    const { songId } = req.params;
    const result = await Favorite.findOneAndDelete({ userId, songId });

    if (!result) {
      sendResponse(res, statusCodes.NOT_FOUND, 'Favorite not found', {});
      return;
    }

    sendResponse(res, statusCodes.OK, 'Song removed from favorites successfully', {});
  } catch (error) {
    logger.error('Error removing song from favorites:', error);
    sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, 'Error removing song from favorites', {});
  }
};

// Get user's favorite songs
export const getFavorites = async (req: Request, res: Response) => {
  try {
    const userId = getUserIdFromToken(req.headers.authorization);
    if (!userId) {
      sendResponse(res, statusCodes.UNAUTHORIZED, 'Unauthorized: No valid token provided', {});
      return;
    }

    const favorites = await Favorite.find({ userId })
      .populate<{ songId: ISong & Document }>({
        path: 'songId',
        model: 'Song',
        select: 'title artist album genre duration coverArt thumbnail url filename'
      })
      .lean();

    const transformedSongs = favorites.map(favorite => ({
      id: favorite.songId._id.toString(),
      title: favorite.songId.title,
      artist: favorite.songId.artist,
      album: favorite.songId.album,
      genre: favorite.songId.genre,
      duration: favorite.songId.duration,
      coverArt: favorite.songId.coverArt,
      thumbnail: favorite.songId.thumbnail,
      url: favorite.songId.url,
      fileName: favorite.songId.filename,
      favoriteId: favorite._id
    }));

    sendResponse(res, statusCodes.OK, 'Favorites fetched successfully', transformedSongs);
  } catch (error) {
    logger.error('Error fetching favorites:', error);
    sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, 'Error fetching favorites', []);
  }
};
