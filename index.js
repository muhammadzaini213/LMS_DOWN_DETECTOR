const express = require('express');
const webpush = require('web-push'); // Correct lowercase import
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config(); // Load environment variables


const app = express();
app.use(bodyParser.json());

const vapidKeys = webpush.generateVAPIDKeys();

app.use(express.static('public'));


webpush.setVapidDetails(
    'mailto:your-email@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

let subscriptions = [];
let previousStatus = null;

// API to Subscribe Clients
app.post('/subscribe', (req, res) => {
    const subscription = req.body;
    subscriptions.push(subscription);
    res.status(201).json({ message: 'Subscribed successfully!' });
});

app.get('/notify', (req, res) => {
    sendNotification("Test")
    res.status(201).json({ message: 'This is test' });
});

// Function to Send Notifications
function sendNotification(message) {
    subscriptions.forEach(sub => {
        webpush.sendNotification(sub, JSON.stringify({ title: "Website Status", body: message }))
            .catch(error => console.error("Error sending notification:", error));
    });
}

// Function to Check Website Status
async function checkWebsite(url) {
    try {
        const response = await axios.get(url, { timeout: 5000 });
        if (previousStatus !== 'accessible') {
            console.log({ title: "Website Status", body: response.status })
            sendNotification(`✅ Website is accessible. Status Code: ${response.status}`);
        }
        previousStatus = 'accessible';
    } catch (error) {
        if (previousStatus !== 'inaccessible') {
            console.log({ title: "Website is down", body: error.message })
            sendNotification(`❌ Website is down! Error: ${error.message}`);
        }
        previousStatus = 'inaccessible';
    } finally {
        setTimeout(() => checkWebsite(url), 5000); // Check every 30 seconds
        console.log("Check again...")
    }
}

checkWebsite("https://google.com");

app.listen(3000, () => console.log('Server running on port 3000'));
