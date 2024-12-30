import { Request, Response } from "express";
import User from "../models/user.model"; // Assuming you have a User model
import Notification from "../models/notification.model";

export const subscribe = async (req: Request, res: Response): Promise<void> => {
  const { subscription, userId } = req.body;

  try {
    await User.findByIdAndUpdate(userId, { subscription });
    res.status(201).json({ message: "Subscription added successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add subscription" });
  }
};

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  const userId = req.headers['userid']; // Assuming user ID is stored in the headers
  try {
    const notifications = await Notification.find({userId});
    if (!notifications) {
      res.status(404).json({ error: "notifications not found" });
      return;
    }

    res.status(200).json({ notifications: notifications });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};