const webPush = require("web-push");
const dotenv = require("dotenv");

dotenv.config();

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

webPush.setVapidDetails(
    "mailto:ashish06072@gmail.com",
    publicVapidKey,
    privateVapidKey
);

const subscription = {
    endpoint: "https://fcm.googleapis.com/fcm/send/fnTbMuHrkhk:APA91bFqoqG17sIMr0mZUDUjwiuOlRcA0IOWXtU2QjFLecgq-Q8gKREFcr8K2VjANHmNHFaFXXMnNUBQrece6esqrw9wH5f51aL-24iz2Hmfqn0Ra872zpROHueUMji_YTomWvBHcUVo",
    expirationTime: null,
    keys: {
        "p256dh": "BHjLI0MxVSbfclhcOmgjWe_eBI_EslonI9XKeFRXMqWamRZ-rHEDc9Nc9AMaVK9xHYQBVt_vPYNUSO-vavk_Ygw",
        "auth": "30DDPqgnkq0KA-bPrtFNrg"
      }
};

const payload = JSON.stringify({
    title: "Test Notification",
    body: "This is a test notification",
});

webPush.sendNotification(subscription, payload).catch(error => {
    console.error("Error sending notification:", error);
});