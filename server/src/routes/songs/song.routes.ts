import express from 'express';
import * as songController from '../../controllers/songs/song.controller';

const router = express.Router();


// Get all songs
router.get('/', songController.getAllSongs);

// Search songs by title, artist, album, or genre
router.get('/search', songController.searchSongs);

router.get("/stream/:filename", songController.streamMusic);



export default router;
