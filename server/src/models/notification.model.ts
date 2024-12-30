import { Schema, model, Document } from "mongoose";

export interface INotification extends Document {
  userId: string;
  title: string;
  body: string;
  date: Date;
}

const notificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.String, ref: "User", required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const Notification = model<INotification>("Notification", notificationSchema);

export default Notification;