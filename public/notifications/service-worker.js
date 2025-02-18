self.addEventListener('push', function(event) {
    const data = event.data.json();  // The push message
    const options = {
        body: data.body,
        icon: '/icon.png', // Path to your icon
        badge: '/badge.png', // Path to your badge icon
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('https://yourwebsite.com') // Open the website when the notification is clicked
    );
});
