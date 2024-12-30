import mongoose, { Document, Schema } from "mongoose";

export interface ITodo extends Document {
  title: string;
  description: string;
  status: string;
  userId: mongoose.Schema.Types.ObjectId;
  priority: string;
  tags: string[]; // Update tags to be an array of strings
}

const todoSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ["pending", "in-progress", "completed"], default: "pending" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  tags: { type: [String], default: [] }, // Define tags as an array of strings
});

const Todo = mongoose.model<ITodo>("Todo", todoSchema);
export default Todo;