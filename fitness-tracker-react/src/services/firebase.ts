import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  Unsubscribe 
} from 'firebase/firestore';
import { WorkoutData } from '../types';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCEqCtIKf6jBd0-bamD3zf8Jze4G_AV7Z4",
  authDomain: "dad-v-son-fitness-challenge.firebaseapp.com",
  projectId: "dad-v-son-fitness-challenge",
  storageBucket: "dad-v-son-fitness-challenge.firebasestorage.app",
  messagingSenderId: "1007734733222",
  appId: "1:1007734733222:web:96698a7aa2303425033767",
  measurementId: "G-Z55FT3W2VC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export class FirebaseService {
  private familyId: string | null = null;

  setFamilyId(familyId: string): void {
    this.familyId = familyId;
  }

  private getFamilyDocRef() {
    if (!this.familyId) {
      throw new Error('Family ID not set');
    }
    return doc(db, 'families', this.familyId);
  }

  async initializeData(): Promise<WorkoutData | null> {
    if (!this.familyId) return null;
    
    console.log('Initializing Firestore data for family:', this.familyId);
    
    try {
      const docRef = this.getFamilyDocRef();
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.log('Document does not exist, creating new one...');
        const initialData: WorkoutData = {
          Dad: {},
          Son: {},
          lastUpdated: new Date().toISOString()
        };
        await setDoc(docRef, initialData);
        console.log('New document created successfully');
        return { Dad: {}, Son: {} };
      } else {
        console.log('Loading existing document...');
        const data = docSnap.data() as WorkoutData;
        const workoutData: WorkoutData = {
          Dad: data.Dad || {},
          Son: data.Son || {}
        };
        console.log('Existing data loaded successfully');
        return workoutData;
      }
    } catch (error) {
      console.error('Error in initializeData:', error);
      throw error;
    }
  }

  async saveData(workoutData: WorkoutData): Promise<void> {
    if (!this.familyId) return;
    
    try {
      const docRef = this.getFamilyDocRef();
      await setDoc(docRef, {
        Dad: workoutData.Dad,
        Son: workoutData.Son,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving data:', error);
      throw error;
    }
  }

  setupRealtimeListener(callback: (data: WorkoutData) => void): Unsubscribe | undefined {
    if (!this.familyId) return;
    
    const docRef = this.getFamilyDocRef();
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as WorkoutData;
        const workoutData: WorkoutData = {
          Dad: data.Dad || {},
          Son: data.Son || {}
        };
        callback(workoutData);
      }
    });
  }
}

export const firebaseService = new FirebaseService();