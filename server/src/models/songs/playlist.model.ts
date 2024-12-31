import mongoose, { Schema, Document } from 'mongoose';

export interface IPlaylist extends Document {
  name: string;
  userId: mongoose.Types.ObjectId; // User who owns the playlist
  songs: mongoose.Types.ObjectId[]; // Array of song references
}

const PlaylistSchema: Schema = new Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
});

const Playlist = mongoose.model<IPlaylist>('Playlist', PlaylistSchema);
export default Playlist;
