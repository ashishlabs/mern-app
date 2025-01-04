import mongoose, { Schema, Document } from 'mongoose';

// Define the PlayHistory Schema
const playHistorySchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  songId: { type: mongoose.Schema.Types.ObjectId, ref: 'Song', required: true },
  playedAt: { type: Date, default: Date.now }
});

// Create PlayHistory model
const PlayHistory = mongoose.model('PlayHistory', playHistorySchema);

export default PlayHistory;
