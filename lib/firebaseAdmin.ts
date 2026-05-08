import admin from "firebase-admin";

const serviceAccount = JSON.parse(
  process.env.FIREBASE_ADMIN_KEY as string
);

export const adminApp =
  admin.apps.length
    ? admin.app()
    : admin.initializeApp({
        credential:
          admin.credential.cert(
            serviceAccount
          ),
      });

export const adminAuth =
  admin.auth();

export const adminDb =
  admin.firestore();