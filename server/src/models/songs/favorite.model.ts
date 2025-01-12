import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  songId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
    required: true
  }
}, {
  timestamps: true
});

// Ensure a user can't favorite the same song twice
favoriteSchema.index({ userId: 1, songId: 1 }, { unique: true });

export default mongoose.model('Favorite', favoriteSchema); 