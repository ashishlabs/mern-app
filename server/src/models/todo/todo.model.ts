import mongoose, { Document, Schema } from "mongoose";

export interface ITodo extends Document {
  title: string;
  description: string;
  status: string;
  userId: mongoose.Schema.Types.ObjectId;
  priority: string;
  tags: string[]; // Update tags to be an array of strings
  dueDate: Date;
  createdDate: Date;
}

const todoSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String},
  status: { type: String, enum: ["pending", "in-progress", "completed"], default: "pending" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  tags: { type: [String], default: [] }, // Define tags as an array of strings
  createdDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
});

const Todo = mongoose.model<ITodo>("Todo", todoSchema);
export default Todo;