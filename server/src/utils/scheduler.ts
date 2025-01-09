import cron from "node-cron";
import Todo from "../models/todo/todo.model";
import User from "../models/user/user.model";
import { sendNotification } from "./webPush";
import logger from "./logger";

// Function to check for upcoming deadlines
const checkUpcomingDeadlines = async () => {
  const now = new Date();
  const upcoming = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

  try {
    const todos = await Todo.find({ dueDate: { $lte: upcoming, $gte: now }, status: { $ne: "completed" } });

    for (const todo of todos) {
      const user = await User.findById(todo.userId);
      if (user) {
        const payload = JSON.stringify({
          title: `Reminder: Upcoming deadline for "${todo.title}"`,
          body: `You have an upcoming deadline for the task "${todo.title}" on ${todo.dueDate.toLocaleDateString()}.`,
        });
        sendNotification(user?.subscription, payload, todo.userId.toString());
    }
    }
  } catch (error) {
    logger.error(`Error checking upcoming deadlines: ${error}`);
  }
};

// Schedule the job to run every day at midnight
cron.schedule("0 0 * * *", checkUpcomingDeadlines);

export const triggerNotificationsNow = async () => {
    await checkUpcomingDeadlines();
  };