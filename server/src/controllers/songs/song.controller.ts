import { Request, Response } from 'express';
import Song from '../../models/songs/song.model';
import fs from 'fs';
import path from 'path';
// Create a new song
export const createSong = async (req: Request, res: Response) => {
    const { title, artist, album, genre, duration, coverArt } = req.body;

    try {
        const newSong = new Song({ title, artist, album, genre, duration, coverArt });
        await newSong.save();
        res.status(201).json(newSong);
    } catch (err) {
        res.status(400).json({ message: 'Error creating song', error: err });
    }
};

// Get all songs
export const getAllSongs = async (req: Request, res: Response) => {
    try {
        const songs = await Song.find();
        res.status(200).json(songs);
    } catch (err) {
        res.status(400).json({ message: 'Error fetching songs', error: err });
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
        });
        res.status(200).json(songs);
    } catch (err) {
        res.status(400).json({ message: 'Error searching songs', error: err });
    }
};

