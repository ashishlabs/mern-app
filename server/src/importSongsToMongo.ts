// scripts/importSongsToMongo.ts
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import SongModel from './models/songs/song.model';

const songsDataPath = path.join(__dirname, 'songsData.json'); // Path to your JSON file

// Connect to MongoDB
mongoose.connect('mongodb://192.168.1.8:27017/mern-ts-db', {})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

// Function to import songs from the JSON file to MongoDB
const importSongs = async () => {
    try {
        // Read the data from the JSON file
        const songsData = JSON.parse(fs.readFileSync(songsDataPath, 'utf-8'));

        // Insert songs into MongoDB
        const insertedSongs = await SongModel.insertMany(songsData);

        console.log(`Successfully inserted ${insertedSongs.length} songs into MongoDB.`);
    } catch (error) {
        console.error('Error importing songs to MongoDB:', error);
    } finally {
        // Close the MongoDB connection
        mongoose.connection.close();
    }
};

// Call the function to import songs
importSongs();
