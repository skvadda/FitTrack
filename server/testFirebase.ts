import admin from 'firebase-admin';

console.log('Testing Firebase credentials...');

try {
  // Check if credentials exist
  console.log('PROJECT_ID exists:', !!process.env.FIREBASE_PROJECT_ID);
  console.log('CLIENT_EMAIL exists:', !!process.env.FIREBASE_CLIENT_EMAIL);
  console.log('PRIVATE_KEY exists:', !!process.env.FIREBASE_PRIVATE_KEY);
  
  if (process.env.FIREBASE_PRIVATE_KEY) {
    console.log('Private key starts with:', process.env.FIREBASE_PRIVATE_KEY.substring(0, 50));
  }
  
  // Try to initialize Firebase with proper error handling
  if (!admin.apps.length) {
    const credentials = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: JSON.parse(`"${process.env.FIREBASE_PRIVATE_KEY}"`), // Parse escaped string
    };
    
    admin.initializeApp({
      credential: admin.credential.cert(credentials),
    });
    
    console.log('Firebase initialized successfully!');
    
    // Test database connection
    const db = admin.firestore();
    const testDoc = await db.collection('test').doc('connection').set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      message: 'Firebase connection test successful'
    });
    
    console.log('Database connection test successful!');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  console.error('Error details:', (error as any)?.errorInfo);
}