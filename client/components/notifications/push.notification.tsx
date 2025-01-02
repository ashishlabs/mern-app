"use client";
import  { useEffect } from "react";

const PushNotification = () => {
    useEffect(() => {
        if ("serviceWorker" in navigator && "PushManager" in window) {
            navigator.serviceWorker.register("/sw.js").then(registration => {
                console.log("Service Worker registered with scope:", registration.scope);

                registration.pushManager.getSubscription().then(subscription => {
                    if (!subscription) {
                        console.log(subscription);
                        const vapidKey = process.env.NEXT_PUBLIC_PUBLIC_VAPID_KEY;
                        if (!vapidKey) {
                            console.error("VAPID key is not defined");
                            return;
                        }
                        const convertedVapidKey = urlBase64ToUint8Array(vapidKey);

                        registration.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: convertedVapidKey,
                        }).then(newSubscription => {
                            console.log(newSubscription);
                            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/notification/subscribe`, {
                                method: "POST",
                                body: JSON.stringify({
                                    subscription: newSubscription,
                                    userId: localStorage.getItem("userId"), // Assuming userId is stored in localStorage
                                }),
                                headers: {
                                    "Content-Type": "application/json",
                                },
                            });
                        });
                    } else {
                        console.log("Existing Subscription:", subscription);
                    }
                });
            });
        }
    }, []);

    const urlBase64ToUint8Array = (base64String: string) => {
        const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    return null;
};

export default PushNotification;