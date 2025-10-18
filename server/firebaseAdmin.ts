// server/firebaseAdmin.ts
import admin from 'firebase-admin';

// Yeh key aapko Render ke Environment Variables me daalni hogi
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
