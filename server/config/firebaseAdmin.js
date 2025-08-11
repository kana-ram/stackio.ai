// backend/config/firebaseAdmin.js
import admin from "firebase-admin";
import serviceAccount from "../serviceAccountKey.json"; // adjust path if needed

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
