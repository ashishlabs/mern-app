import { Schema, model } from "mongoose";

const tagSchema = new Schema({
  tag: { type: String, required: true },
  userId: { type: String, required: true },
});

const Tag = model("Tag", tagSchema);

export default Tag;