import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth functions
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if email domain is allowed
    if (!user.email.endsWith('@bwscampus.com')) {
      await signOut(auth);
      throw new Error('Access denied. Please use your @bwscampus.com email address.');
    }
    
    // Check if user already exists (prevent duplicates)
    const existingUser = await getUserProfile(user.uid);
    
    if (existingUser) {
      // User exists, just update login time
      await updateDoc(doc(db, 'users', user.uid), {
        lastLoginAt: serverTimestamp()
      });
    } else {
      // New user, create basic profile (onboarding will complete it)
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL,
        isAdmin: user.email === process.env.REACT_APP_ADMIN_EMAIL,
        onboardingComplete: false, // Explicitly set to false for new users
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      });
    }
    
    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// User functions
export const getUserProfile = async (uid) => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (uid, data) => {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Onboarding functions
export const saveUserOnboarding = async (userId, onboardingData) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      ...onboardingData,
      onboardingComplete: true,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error saving onboarding:', error);
    throw error;
  }
};

export const getAdvisorsByPathway = async (pathway) => {
  try {
    const q = query(
      collection(db, 'users'),
      where('userType', '==', 'advisor'),
      where('pathway', '==', pathway),
      where('isAdmin', '==', true) // Only approved advisors
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      email: doc.data().email,
      schedulingTool: doc.data().schedulingTool,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting advisors by pathway:', error);
    throw error;
  }
};

export const getAdvisorByName = async (advisorName) => {
  try {
    const q = query(
      collection(db, 'users'),
      where('name', '==', advisorName),
      where('userType', '==', 'advisor')
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const advisorDoc = querySnapshot.docs[0];
      return {
        id: advisorDoc.id,
        ...advisorDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting advisor by name:', error);
    return null;
  }
};

// Reflection functions
export const createReflection = async (userId, reflectionData) => {
  try {
    const docRef = await addDoc(collection(db, 'reflections'), {
      userId,
      ...reflectionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating reflection:', error);
    throw error;
  }
};

export const updateReflection = async (reflectionId, data) => {
  try {
    await updateDoc(doc(db, 'reflections', reflectionId), {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating reflection:', error);
    throw error;
  }
};

export const getUserReflections = async (userId) => {
  try {
    const q = query(
      collection(db, 'reflections'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user reflections:', error);
    throw error;
  }
};

// Goal functions
export const createGoal = async (userId, goalData) => {
  try {
    const docRef = await addDoc(collection(db, 'goals'), {
      userId,
      ...goalData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating goal:', error);
    throw error;
  }
};

export const updateGoal = async (goalId, data) => {
  try {
    await updateDoc(doc(db, 'goals', goalId), {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    throw error;
  }
};

export const deleteGoal = async (goalId) => {
  try {
    await deleteDoc(doc(db, 'goals', goalId));
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
};

export const getUserGoals = async (userId) => {
  try {
    const q = query(
      collection(db, 'goals'),
      where('userId', '==', userId),
      orderBy('targetDate', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user goals:', error);
    throw error;
  }
};

// Meeting functions
export const createMeeting = async (meetingData) => {
  try {
    const docRef = await addDoc(collection(db, 'meetings'), {
      ...meetingData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw error;
  }
};

export const updateMeeting = async (meetingId, data) => {
  try {
    await updateDoc(doc(db, 'meetings', meetingId), {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating meeting:', error);
    throw error;
  }
};

export const getUserMeetings = async (userId) => {
  try {
    const q = query(
      collection(db, 'meetings'),
      where('studentId', '==', userId),
      orderBy('scheduledDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user meetings:', error);
    throw error;
  }
};

// Important dates functions
export const createImportantDate = async (dateData) => {
  try {
    const docRef = await addDoc(collection(db, 'importantDates'), {
      ...dateData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating important date:', error);
    throw error;
  }
};

export const updateImportantDate = async (dateId, data) => {
  try {
    await updateDoc(doc(db, 'importantDates', dateId), {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating important date:', error);
    throw error;
  }
};

export const deleteImportantDate = async (dateId) => {
  try {
    await deleteDoc(doc(db, 'importantDates', dateId));
  } catch (error) {
    console.error('Error deleting important date:', error);
    throw error;
  }
};

export const getAllImportantDates = async () => {
  try {
    const q = query(
      collection(db, 'importantDates'),
      orderBy('date', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting important dates:', error);
    throw error;
  }
};

// Admin functions
export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

export const getAllMeetings = async () => {
  try {
    const q = query(
      collection(db, 'meetings'),
      orderBy('scheduledDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all meetings:', error);
    throw error;
  }
};

export const getAllReflections = async () => {
  try {
    const q = query(
      collection(db, 'reflections'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all reflections:', error);
    throw error;
  }
};

export const getAllGoals = async () => {
  try {
    const q = query(
      collection(db, 'goals'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all goals:', error);
    throw error;
  }
};