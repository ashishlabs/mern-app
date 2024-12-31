import { Request, Response } from 'express';
import Playlist from '../../models/songs/playlist.model';

// Create a new playlist
export const createPlaylist = async (req: Request, res: Response) => {
  const { name, userId, songs } = req.body;

  try {
    const newPlaylist = new Playlist({ name, userId, songs });
    await newPlaylist.save();
    res.status(201).json(newPlaylist);
  } catch (err) {
    res.status(400).json({ message: 'Error creating playlist', error: err });
  }
};

// Get all playlists
export const getAllPlaylists = async (req: Request, res: Response) => {
  try {
    const playlists = await Playlist.find().populate('songs');
    res.status(200).json(playlists);
  } catch (err) {
    res.status(400).json({ message: 'Error fetching playlists', error: err });
  }
};

// Get a specific playlist by ID
export const getPlaylistById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const playlist = await Playlist.findById(id).populate('songs');
    if (playlist) {
      res.status(200).json(playlist);
    } else {
      res.status(404).json({ message: 'Playlist not found' });
    }
  } catch (err) {
    res.status(400).json({ message: 'Error fetching playlist', error: err });
  }
};

// Add song to playlist
export const addSongToPlaylist = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { songId } = req.body;

  try {
    const playlist = await Playlist.findById(id);
    if (playlist) {
      playlist.songs.push(songId);
      await playlist.save();
      res.status(200).json(playlist);
    } else {
      res.status(404).json({ message: 'Playlist not found' });
    }
  } catch (err) {
    res.status(400).json({ message: 'Error adding song to playlist', error: err });
  }
};

// Remove song from playlist
export const removeSongFromPlaylist = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { songId } = req.body;

  try {
    const playlist = await Playlist.findById(id);
    if (playlist) {
      playlist.songs = playlist.songs.filter(song => song.toString() !== songId);
      await playlist.save();
      res.status(200).json(playlist);
    } else {
      res.status(404).json({ message: 'Playlist not found' });
    }
  } catch (err) {
    res.status(400).json({ message: 'Error removing song from playlist', error: err });
  }
};
