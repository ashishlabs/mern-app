import { Document, Schema, model } from 'mongoose';
import Song, { ISong } from './song.model';

interface IPlayHistory extends Document {
  userId: Schema.Types.ObjectId;
  songId: ISong & Document;  // Use the Song interface for populated documents
  createdAt: Date;
}

const playHistorySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  songId: { type: Schema.Types.ObjectId, ref: 'Song', required: true },
  createdAt: { type: Date, default: Date.now }
});

export default model<IPlayHistory>('PlayHistory', playHistorySchema);
