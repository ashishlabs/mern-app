import { Schema, model, Document } from "mongoose";

interface IUser extends Document {
  email: string;
  password: string;
  subscription?: {
    endpoint: string;
    expirationTime: Date | null;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  subscription: {
    endpoint: { type: String },
    expirationTime: { type: Date, default: null },
    keys: {
      p256dh: { type: String },
      auth: { type: String },
    },
  },
});

const User = model<IUser>("User", userSchema);

export default User;