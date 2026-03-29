
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update, push, get, child } from "firebase/database";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyABuL6uoOQkst95P8mHHVoF7j-IqkFz-JE",
  authDomain: "wedding-5db69.firebaseapp.com",
  databaseURL: "https://wedding-5db69-default-rtdb.firebaseio.com",
  projectId: "wedding-5db69",
  storageBucket: "wedding-5db69.firebasestorage.app",
  messagingSenderId: "559613549017",
  appId: "1:559613549017:web:e728eca13209b9b749a1c8",
  measurementId: "G-CL2EM254G8"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging: any = null;
try {
  messaging = getMessaging(app);
} catch (e) {
  console.warn("Firebase Messaging is not supported in this environment", e);
}

export const requestNotificationPermission = async (userId: string) => {
  if (!messaging) return;
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { vapidKey: 'YOUR_PUBLIC_VAPID_KEY_HERE' });
      if (token) {
        await update(ref(db, `users/${userId}`), { fcmToken: token });
      }
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
  }
};

export const sendFCMPushNotification = async (targetToken: string, title: string, body: string, data?: any) => {
  if (!targetToken) return false;
  
  try {
    // Note: In a real production app, this should be done via a Cloud Function or backend server
    // using the Firebase Admin SDK. Calling the FCM HTTP API directly from the client requires
    // exposing the server key, which is a security risk.
    // We use a placeholder here as requested by the system architecture.
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'key=YOUR_SERVER_KEY_HERE' // Replace with actual server key
      },
      body: JSON.stringify({
        to: targetToken,
        notification: {
          title,
          body,
          sound: 'default'
        },
        data: data || {}
      })
    });
    return response.ok;
  } catch (error) {
    console.error('Error sending FCM push notification:', error);
    return false;
  }
};

// Helper para operaciones comunes
export const fbSync = {
  // Guardar o actualizar un registro
  save: async (table: string, id: string, data: any) => {
    const dbRef = ref(db, `${table}/${id}`);
    // Aseguramos que el dato sea un objeto si viene de CREATE/UPDATE simple
    const payload = typeof data === 'string' ? { id, name: data } : data;
    await set(dbRef, { 
      ...payload, 
      deletedAt: null, // Reset deletion if we are re-saving
      updatedAt: new Date().toISOString() 
    });
  },
  
  // Eliminar (Soft Delete)
  delete: async (table: string, id: string) => {
    const dbRef = ref(db, `${table}/${id}`);
    const snapshot = await get(dbRef);
    
    if (snapshot.exists()) {
      const currentData = snapshot.val();
      if (typeof currentData === 'object' && currentData !== null) {
        await update(dbRef, { deletedAt: new Date().toISOString() });
      } else {
        // If it's a legacy string, we must convert it to object to support soft-delete
        await set(dbRef, { 
          id, 
          name: currentData, 
          deletedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }
  },

  // Obtener una vez
  getOnce: async (table: string) => {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, table));
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.values(data);
    }
    return [];
  }
};
