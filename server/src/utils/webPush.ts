import webPush from "web-push";
import User from "../models/user.model"; // Assuming you have a User model
import logger from "./logger";
import Notification from "../models/notification.model";

const publicVapidKey = process.env.PUBLIC_VAPID_KEY!;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY!;

webPush.setVapidDetails(
  "mailto:ashish06072@gmail.com",
  publicVapidKey,
  privateVapidKey
);

export const sendNotification = async (subscription: any, payload: string, userId: string) => {
  try {
    // Send the notification
    await webPush.sendNotification(subscription, payload);

    // Save the notification to the database
    const user = await User.findById(userId);
    if (user) {
      const { title, body } = JSON.parse(payload);
      const notification = new Notification({ userId, title, body });
      await notification.save();
    }
  } catch (error) {
    logger.error("Error sending notification:", error);
  }
};