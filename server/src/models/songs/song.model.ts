// models/song.model.ts
import mongoose, { Schema, Document } from 'mongoose';

// Define the Song interface
interface Song extends Document {
    id: string;
    title: string;
    artist: string;
    album: string;
    genre: string;
    duration: number;
    coverArt: string | null;
    thumbnail: string | null;
    url: string;
    filename:string;
}

// Define the Song schema
const SongSchema: Schema = new Schema({
    title: { type: String, required: true },
    artist: { type: String},
    album: { type: String},
    genre: { type: String},
    duration: { type: Number},
    coverArt: { type: String},
    thumbnail: { type: String },
    url: { type: String },
    filename: { type: String },
});

// Create a Mongoose model from the schema
const SongModel = mongoose.model<Song>('Song', SongSchema);

export default SongModel;
