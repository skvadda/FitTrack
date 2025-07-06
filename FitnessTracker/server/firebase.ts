import admin from 'firebase-admin';

let db: admin.firestore.Firestore | null = null;
let isFirebaseAvailable = false;

try {
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
    throw new Error('Firebase environment variables are not set');
  }

  // Initialize Firebase Admin
  if (!admin.apps.length) {
    // Handle the private key formatting - replace \n with actual newlines and clean up
    let privateKey = process.env.FIREBASE_PRIVATE_KEY!
      .replace(/\\n/g, '\n')
      .replace(/^\n+/, '')  // Remove leading newlines
      .replace(/\n+$/, ''); // Remove trailing newlines
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: privateKey,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
  }

  db = admin.firestore();
  isFirebaseAvailable = true;
  console.log('Firebase initialized successfully');
} catch (error) {
  console.warn('Firebase initialization failed:', error);
  console.warn('The app will continue using PostgreSQL database');
  isFirebaseAvailable = false;
}

export { db, admin, isFirebaseAvailable };