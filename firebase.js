// Firebase configuration and functions module
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { firebaseConfig } from './config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Firebase operations class
class FirebaseService {
    constructor() {
        this.db = db;
        this.familyId = null;
    }

    // Connect to a family
    setFamilyId(familyId) {
        this.familyId = familyId;
    }

    // Get document reference for current family
    getFamilyDocRef() {
        if (!this.familyId) {
            throw new Error('Family ID not set');
        }
        return doc(this.db, 'families', this.familyId);
    }

    // Initialize Firestore data
    async initializeData() {
        if (!this.familyId) return null;
        
        console.log('Initializing Firestore data for family:', this.familyId);
        
        try {
            const docRef = this.getFamilyDocRef();
            console.log('Getting document...');
            const docSnap = await getDoc(docRef);
            
            if (!docSnap.exists()) {
                console.log('Document does not exist, creating new one...');
                // Create new family document
                const initialData = {
                    Dad: {},
                    Son: {},
                    lastUpdated: new Date().toISOString()
                };
                await setDoc(docRef, initialData);
                console.log('New document created successfully');
                return { Dad: {}, Son: {} };
            } else {
                console.log('Loading existing document...');
                // Load existing data
                const data = docSnap.data();
                const workoutData = {
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

    // Save data to Firestore
    async saveData(workoutData) {
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

    // Set up real-time listener
    setupRealtimeListener(callback) {
        if (!this.familyId) return;
        
        const docRef = this.getFamilyDocRef();
        return onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const workoutData = {
                    Dad: data.Dad || {},
                    Son: data.Son || {}
                };
                callback(workoutData);
            }
        });
    }
}

// Export the service instance
export const firebaseService = new FirebaseService();