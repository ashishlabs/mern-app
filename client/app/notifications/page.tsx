"use client";
import React, { useEffect, useState } from "react";

interface Notification {
  title: string;
  body: string;
  date: string;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setError("User ID not found");
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/notification`, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "userId": `${localStorage.getItem("userId")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }

        const data = await response.json();
        setNotifications(data.notifications);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("An unknown error occurred");
        }
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      {error && <p className="text-red-500">{error}</p>}
      <ul className="space-y-4">
        {notifications.map((notification, index) => (
          <li key={index} className="p-4 bg-white shadow-md rounded">
            <h2 className="text-xl font-bold">{notification.title}</h2>
            <p>{notification.body}</p>
            <p className="text-sm text-gray-600">{new Date(notification.date).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;