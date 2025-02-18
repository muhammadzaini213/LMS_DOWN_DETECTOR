// Check if the browser supports push notifications and service workers
if ('Notification' in window && 'serviceWorker' in navigator) {
    // Request permission to show notifications when the page loads
    Notification.requestPermission().then(function(permission) {
        if (permission === "granted") {
            console.log("Permission granted for notifications");
            registerServiceWorker();
        } else {
            console.log("Notification permission denied");
        }
    });
}

// Register service worker and handle the subscription
function registerServiceWorker() {
    navigator.serviceWorker.register('/service-worker.js')
        .then(function(registration) {
            console.log("Service Worker registered with scope:", registration.scope);

            // Add event listener to the subscribe button
            const subscribeButton = document.getElementById('subscribe-button');
            subscribeButton.addEventListener('click', function() {
                subscribeUserToPush(registration);
            });
        })
        .catch(function(error) {
            console.error("Service Worker registration failed:", error);
        });
}

// Function to subscribe the user to push notifications
function subscribeUserToPush(registration) {
    // Convert the VAPID public key to the required format
    const vapidPublicKey = 'BJpNwfNuCvjDciLhVyvjcZmw5WSTEqK1fCxB9o7hNUDf1vJdwFnUDU_GkhLv9G7lfEtICBIl-8P8L-KYxG3qbj';  // Replace with your public VAPID key
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

    registration.pushManager.subscribe({
        userVisibleOnly: true,  // Required for notifications
        applicationServerKey: applicationServerKey,
    })
    .then(function(subscription) {
        console.log("User is subscribed:", subscription);
        sendSubscriptionToServer(subscription);
    })
    .catch(function(err) {
        console.log("Failed to subscribe the user:", err);
    });
}

// Convert the VAPID public key to a Uint8Array
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// Function to send the subscription object to the server
function sendSubscriptionToServer(subscription) {
    fetch('/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => console.log('Server response:', data))
    .catch(err => console.error('Error sending subscription to server:', err));
}
