const express = require("express")
const admin = require("firebase-admin")
const dotenv = require("dotenv")

dotenv.config()
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
};


const app = express()
const port = process.env.PORT

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

app.use(express.json());

app.post("/", async (req, res) => {
    const { token, title, body } = req.body
    try {
        const message = {
            notification: {
                "title": title,
                "body": body
            },
            data: {
                "title": title,
                "body": body,
                "score": "4.5"
            },
            android: {
                "notification": {
                    "priority": "high",
                    "sound": "default",
                    "clickAction": ".PushReceiverActivity"
                }
            },
            token: token,
        };
        const response = await admin.messaging().send(message);
        res.status(200).send({ success: true, response });
    } catch (error) {
        console.error("Error sending notification:", error);
        res.status(500).send({ success: false, error: error.message });
    }
})

const paymentRouter = require("./routes/payment_route.js")
app.use("/payments", paymentRouter)



app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
})