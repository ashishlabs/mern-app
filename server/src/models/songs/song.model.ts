import mongoose, { Schema, Document } from 'mongoose';

export interface ISong extends Document {
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration: number; // in seconds
  coverArt: string; // URL or file path to album art
  audioFile:any;
}

const SongSchema: Schema = new Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  album: { type: String, required: true },
  genre: { type: String, required: true },
  duration: { type: Number, required: true },
  coverArt: { type: String, required: true },
  audioFile: { type: String },
});

const Song = mongoose.model<ISong>('Song', SongSchema);
export default Song;
