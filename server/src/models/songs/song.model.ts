// models/song.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ISong {
    _id: mongoose.Types.ObjectId;
    title: string;
    artist: string;
    album: string;
    genre: string;
    duration: number;
    coverArt: string | null;
    thumbnail: string | null;
    url: string;
    filename: string;
}

const songSchema = new Schema<ISong>({
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

export default mongoose.model<ISong>('Song', songSchema);
