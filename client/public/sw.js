self.addEventListener("push", event => {
  console.log("Push received: ", event);
    const data = event.data.json();
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icon.png",
    });
  });