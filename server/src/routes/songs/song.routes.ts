import express from 'express';
import * as songController from '../../controllers/songs/song.controller';
import { getSongs } from '../../controllers/music/music.controller';

const router = express.Router();


// Get all songs
router.get('/', songController.getAllSongs);

// Search songs by title, artist, album, or genre
router.get('/search', songController.searchSongs);

router.get("/stream/:filename", songController.streamMusic);

router.post("/save", songController.savePlayHistory);

router.get("/music", getSongs);

router.get("/recommended", songController.getRecommendedSongs);
router.get("/trending", songController.getTrendingSongs);
router.get('/recently-played', songController.getRecentlyPlayed);
router.get('/genre/:genre', songController.getSongsByGenre);
router.get('/artist/:artist', songController.getSongsByArtist);
router.get('/genres', songController.getGenres);
router.get('/artists', songController.getArtists);
router.get('/artist/:artist/albums', songController.getAlbumsByArtist);


router.post('/favorites/:songId', songController.addToFavorites);
router.delete('/favorites/:songId', songController.removeFromFavorites);
router.get('/favorites', songController.getFavorites);

export default router; 
