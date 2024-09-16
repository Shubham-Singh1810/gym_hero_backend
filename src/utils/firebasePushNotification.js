const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');
require("dotenv").config();
// Load the service account key file
const serviceAccount = process.env;

// Initialize Google Auth Library
const auth = new GoogleAuth({
  credentials: serviceAccount,
  scopes: 'https://www.googleapis.com/auth/firebase.messaging'
});

const getAccessToken = async () => {
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token;
};

const pushNotification = async (fcmToken, title, body) => {
  if (!fcmToken || !title || !body) {
    throw new Error('Missing required fields');
  }

  try {
    const accessToken = await getAccessToken();

    const response = await axios.post(
      'https://fcm.googleapis.com/v1/projects/gymhero-b7346/messages:send',
      {
        message: {
          token: fcmToken,
          notification: {
            title: title,
            body: body
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw new Error('Failed to send notification');
  }
};

module.exports = pushNotification;



