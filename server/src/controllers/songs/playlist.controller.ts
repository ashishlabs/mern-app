import { Request, Response } from 'express';
import Playlist from '../../models/songs/playlist.model';
import { getUserIdFromToken } from '../../utils/auth';
import { sendResponse } from '../../utils/response';
import { statusCodes } from '../../config/status.code';
import { send } from 'process';

// Create a new playlist
export const createPlaylist = async (req: Request, res: Response) => {
  const { name, songs } = req.body;

  try {
    const userId = getUserIdFromToken(req.headers.authorization);
    const newPlaylist = new Playlist({ name, userId, songs });
    await newPlaylist.save();
    sendResponse(res, statusCodes.CREATED, 'Playlist created successfully', newPlaylist);
  } catch (err) {
    sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, 'Error creating playlist');
  }
};

// Get all playlists
export const getAllPlaylists = async (req: Request, res: Response) => {
  try {
    const playlists = await Playlist.find().populate('songs');
    sendResponse(res, statusCodes.OK, 'Playlists fetched successfully', playlists);
  } catch (err) {
    sendResponse(res, statusCodes.NOT_FOUND, 'Error fetching playlists');
  }
};

// Get a specific playlist by ID
export const getPlaylistById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const playlist = await Playlist.findById(id).populate('songs');
    if (playlist) {
      sendResponse(res, statusCodes.OK, 'Playlist fetched successfully', playlist);
    } else {
      sendResponse(res, statusCodes.NOT_FOUND, 'Playlist not found');
    }
  } catch (err) {
    sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, 'Error fetching playlist');
  }
};

// Add song to playlist
export const addSongToPlaylist = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { songId } = req.body;

  try {
    const playlist = await Playlist.findById(id);
    if (playlist) {
      // Check if the song already exists in the playlist
      if (playlist.songs.includes(songId)) {
        sendResponse(res, statusCodes.CONFLICT, 'Song already exists in the playlist');
        return;
      }

      // If the song is not a duplicate, add it to the playlist
      playlist.songs.push(songId);
      await playlist.save();
      sendResponse(res, statusCodes.OK, 'Song added to playlist successfully', playlist);
    } else {
      sendResponse(res, statusCodes.NOT_FOUND, 'Playlist not found');
    }
  } catch (err) {
    sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, 'Error adding song to playlist');
  }
};


// Remove song from playlist
export const removeSongFromPlaylist = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { songId } = req.body;

  try {
    const playlist = await Playlist.findById(id);
    if (playlist) {
      // Check if the song exists in the playlist
      const songIndex = playlist.songs.findIndex(song => song.toString() === songId);

      if (songIndex === -1) {
        // Song not found in the playlist, do nothing and return a message
        sendResponse(res, statusCodes.BAD_REQUEST, 'Song not found in the playlist');
        return;
      }

      // Remove the song from the playlist if it exists
      playlist.songs.splice(songIndex, 1);
      await playlist.save();
      sendResponse(res, statusCodes.OK, 'Song removed from playlist successfully', playlist);
    } else {
      sendResponse(res, statusCodes.NOT_FOUND, 'Playlist not found');
    }
  } catch (err) {
    sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, 'Error removing song from playlist');
  }
};

