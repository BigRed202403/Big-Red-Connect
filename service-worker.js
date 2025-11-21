self.addEventListener("push", event => {
  let data = {};
  if (event.data) data = event.data.json();

  const title = data.title || "Big Red Connect";
  const options = {
    body: data.body || "",
    icon: "/icon.png",
    badge: "/icon.png",
    data: { url: data.url || "https://bigred202403.github.io/Big-Red-Connect/" }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});