import express from 'express';
import * as songController from '../../controllers/songs/song.controller';

const router = express.Router();

// Create a new song
router.post('/', songController.createSong);

// Get all songs
router.get('/', songController.getAllSongs);

// Search songs by title, artist, album, or genre
router.get('/search', songController.searchSongs);



export default router;
