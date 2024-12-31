import express from 'express';
import * as playlistController from '../../controllers/songs/playlist.controller';

const router = express.Router();

// Create a new playlist
router.post('/', playlistController.createPlaylist);

// Get all playlists
router.get('/', playlistController.getAllPlaylists);

// Get a specific playlist by ID
router.get('/:id', playlistController.getPlaylistById);

// Add song to playlist
router.put('/:id/add-song', playlistController.addSongToPlaylist);

// Remove song from playlist
router.put('/:id/remove-song', playlistController.removeSongFromPlaylist);

export default router;
