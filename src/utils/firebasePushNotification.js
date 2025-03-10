const admin = require("firebase-admin");
const serviceAccount = require("../gymhero-b7346-firebase-adminsdk-p2e62-f26f332800.json");

admin.initializeApp({
  credential:admin.credential.cert(serviceAccount)
})

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
    const messageSend = {
      token:fcmToken,
      notification:{
        title:"hello World",
        body:"sdifhsid"
      }
    }
    admin.messaging().send(messageSend).then(response =>{
      console.log("successfully sent notification", response)
    }).catch(
      error=>{
        console.error("Message not sent successfully", error)
      }
    )
    // return response.data;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw new Error('Failed to send notification');
  }
};

module.exports = pushNotification;