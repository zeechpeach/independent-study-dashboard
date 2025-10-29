import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const requiredVars = [
    'REACT_APP_FIREBASE_API_KEY',
    'REACT_APP_FIREBASE_AUTH_DOMAIN',
    'REACT_APP_FIREBASE_PROJECT_ID',
    'REACT_APP_FIREBASE_STORAGE_BUCKET',
    'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
    'REACT_APP_FIREBASE_APP_ID'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('Missing required Firebase environment variables:', missing);
    throw new Error(`Firebase configuration incomplete. Missing: ${missing.join(', ')}`);
  }
};

// Validate configuration before initializing
validateFirebaseConfig();

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

/**
 * Helper function to handle Firebase errors consistently
 * @param {Error} error - The original error
 * @param {string} operation - Description of the operation that failed
 * @returns {Error} - Enhanced error with better message
 */
const enhanceFirebaseError = (error, operation) => {
  let message = `Failed to ${operation}`;
  
  if (error.code === 'permission-denied') {
    message = `Permission denied for ${operation}. This may be due to missing user profile data or insufficient permissions. Please ensure you are signed in with a @bwscampus.com email address and your profile is complete.`;
  } else if (error.code === 'unavailable') {
    message = `Service temporarily unavailable for ${operation}. Please check your internet connection and try again.`;
  } else if (error.code === 'not-found') {
    message = `Resource not found for ${operation}. This might be due to permission restrictions.`;
  } else if (error.code === 'already-exists') {
    message = `Resource already exists for ${operation}.`;
  } else if (error.code === 'invalid-argument') {
    message = `Invalid data provided for ${operation}.`;
  } else if (error.code === 'unauthenticated') {
    message = `Authentication required for ${operation}. Please sign in and try again.`;
  } else if (error.message) {
    message = error.message;
  }
  
  const enhancedError = new Error(message);
  enhancedError.originalError = error;
  enhancedError.operation = operation;
  return enhancedError;
};

// Auth functions
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Validate user data
    if (!user || !user.email) {
      throw new Error('Invalid user data received from Google authentication');
    }
    
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
      // Validate admin email configuration
      const isAdmin = user.email === process.env.REACT_APP_ADMIN_EMAIL;
      
      // Auto-assign advisor role to zeechpeach user
      const isZeechpeachUser = user.email === 'zchien@bwscampus.com';
      
      // New user, create complete profile to avoid missing field errors
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        name: user.displayName || user.email.split('@')[0], // Fallback to email prefix if no displayName
        photoURL: user.photoURL || null,
        isAdmin: isAdmin,
        // Auto-assign advisor role to zeechpeach user, all others default to student
        userType: isZeechpeachUser ? 'advisor' : 'student',
        onboardingComplete: isZeechpeachUser, // zeechpeach skips onboarding, others need it
        // Ensure all required fields are present to prevent permission errors
        advisor: isZeechpeachUser ? null : 'zchien@bwscampus.com',
        projectDescription: isZeechpeachUser ? 'Advisor account' : null,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      });
    }
    
    return user;
  } catch (error) {
    // Enhanced error handling with specific messages
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in was cancelled. Please try again.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Pop-up was blocked. Please enable pop-ups and try again.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your internet connection and try again.');
    } else if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please contact an administrator.');
    } else if (error.message.includes('Access denied')) {
      // Re-throw our custom domain validation error
      throw error;
    }
    
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
    if (!uid) {
      throw new Error('User ID is required');
    }
    
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const userData = docSnap.data();
      
      // Ensure required fields are present to prevent permission errors
      return {
        userType: 'student', // Default fallback
        isAdmin: false, // Default fallback  
        onboardingComplete: false, // Default fallback
        ...userData, // Override with actual data
        id: uid, // Ensure id is always present
        uid: uid // Ensure uid is always present for compatibility
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    
    // Provide better error messages for permission issues
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied when accessing user profile. Please ensure you are properly signed in and have the necessary permissions.');
    }
    
    throw enhanceFirebaseError(error, 'get user profile');
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
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    if (!onboardingData) {
      throw new Error('Onboarding data is required');
    }
    
    // Get user profile to check if they're zeechpeach
    const userProfile = await getUserProfile(userId);
    const isZeechpeachUser = userProfile?.email === 'zchien@bwscampus.com';
    
    // For zeechpeach user, skip onboarding as they're auto-assigned as advisor
    if (isZeechpeachUser) {
      return;
    }
    
    // For all other users (students), ensure all required fields are present
    // Auto-assign zeechpeach as their advisor
    const studentOnboardingData = {
      userType: 'student', // Always assign student role
      advisor: 'zchien@bwscampus.com', // Auto-assign zeechpeach as advisor
      projectDescription: onboardingData.projectDescription || 'Not specified',
      onboardingComplete: true,
      // Ensure all required fields that might be checked by security rules
      isAdmin: false,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(doc(db, 'users', userId), studentOnboardingData);
  } catch (error) {
    console.error('Error saving onboarding:', error);
    throw enhanceFirebaseError(error, 'save onboarding data');
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
      loggedBy: meetingData.loggedBy || 'student', // Default to student if not specified
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

export const deleteMeeting = async (meetingId) => {
  try {
    await deleteDoc(doc(db, 'meetings', meetingId));
  } catch (error) {
    console.error('Error deleting meeting:', error);
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

/**
 * Create a meeting log on behalf of a student (advisor function)
 * Checks for existing student meetings on the same date and marks them as overridden
 * @param {Object} meetingData - Meeting data including studentId, scheduledDate, etc.
 * @param {string} advisorId - ID of the advisor creating the log
 * @returns {string} - ID of the created meeting
 */
export const createAdvisorMeetingLog = async (meetingData, advisorId) => {
  try {
    const { studentId, scheduledDate } = meetingData;
    
    // Get the date at midnight for comparison (day-level precision)
    const meetingDateObj = new Date(scheduledDate);
    meetingDateObj.setHours(0, 0, 0, 0);
    const startOfDay = meetingDateObj.toISOString();
    
    // Calculate end of day
    const endDateObj = new Date(meetingDateObj);
    endDateObj.setHours(23, 59, 59, 999);
    const endOfDay = endDateObj.toISOString();
    
    // Check for existing student meetings on the same date
    const q = query(
      collection(db, 'meetings'),
      where('studentId', '==', studentId),
      where('scheduledDate', '>=', startOfDay),
      where('scheduledDate', '<=', endOfDay),
      where('loggedBy', '==', 'student')
    );
    
    const querySnapshot = await getDocs(q);
    
    // Mark any existing student meetings as overridden
    const updatePromises = querySnapshot.docs.map(doc => 
      updateDoc(doc.ref, {
        overriddenBy: advisorId,
        overriddenAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    );
    
    await Promise.all(updatePromises);
    
    // Create the advisor's meeting log
    const docRef = await addDoc(collection(db, 'meetings'), {
      ...meetingData,
      loggedBy: 'advisor',
      advisorId: advisorId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating advisor meeting log:', error);
    throw error;
  }
};

// Important dates functions
export const createImportantDate = async (dateData, advisorId = null) => {
  try {
    const docRef = await addDoc(collection(db, 'importantDates'), {
      ...dateData,
      advisorId: advisorId,
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

/**
 * Get all important dates for a specific advisor
 * @param {string} advisorId - The advisor's user ID
 * @returns {Promise<Array>} Array of important dates
 */
export const getAdvisorImportantDates = async (advisorId) => {
  try {
    const q = query(
      collection(db, 'importantDates'),
      where('advisorId', '==', advisorId),
      orderBy('date', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting advisor important dates:', error);
    throw error;
  }
};

/**
 * Get important dates for multiple advisors with batching and global dates
 * @param {Array<string>} advisorIds - Array of advisor IDs
 * @returns {Promise<Array>} Array of important dates (advisor-specific + global)
 */
export const getImportantDatesForAdvisors = async (advisorIds) => {
  try {
    if (!advisorIds || advisorIds.length === 0) {
      // Return only global dates if no advisors specified
      const q = query(
        collection(db, 'importantDates'),
        where('advisorId', '==', null),
        orderBy('date', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }

    const allDates = new Map(); // Use Map to handle duplicates by ID
    
    // Always get global dates (advisorId === null)
    const globalQuery = query(
      collection(db, 'importantDates'),
      where('advisorId', '==', null),
      orderBy('date', 'asc')
    );
    const globalSnapshot = await getDocs(globalQuery);
    globalSnapshot.docs.forEach(doc => {
      allDates.set(doc.id, { id: doc.id, ...doc.data() });
    });

    // Batch advisor queries due to Firestore 'in' limit of 10
    const batchSize = 10;
    for (let i = 0; i < advisorIds.length; i += batchSize) {
      const batch = advisorIds.slice(i, i + batchSize);
      
      const q = query(
        collection(db, 'importantDates'),
        where('advisorId', 'in', batch),
        orderBy('date', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      querySnapshot.docs.forEach(doc => {
        allDates.set(doc.id, { id: doc.id, ...doc.data() });
      });
    }

    // Convert Map values to array, filter out student-created dates, and sort by date
    const sortedDates = Array.from(allDates.values())
      .filter(date => {
        // Exclude dates created by students (marked with scope='student' or createdBy without advisorId)
        if (date.scope === 'student') return false;
        if (date.createdBy && !date.advisorId) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.date < b.date) return -1;
        if (a.date > b.date) return 1;
        return 0;
      });

    return sortedDates;
  } catch (error) {
    console.error('Error getting important dates for advisors:', error);
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

// Advisor-specific functions for Phase 3B
/**
 * Get students assigned to a specific advisor
 * @param {string} advisorEmail - Email of the advisor (students are assigned by advisor email)
 * @returns {Promise<Array>} Array of student profiles assigned to the advisor
 */
export const getStudentsByAdvisor = async (advisorEmail) => {
  try {
    const q = query(
      collection(db, 'users'),
      where('advisor', '==', advisorEmail),
      where('userType', '==', 'student'),
      where('onboardingComplete', '==', true)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting students by advisor:', error);
    throw error;
  }
};

/**
 * Get aggregated dashboard data for an advisor
 * @param {string} advisorEmail - Email of the advisor
 * @returns {Promise<Object>} Aggregated statistics for advisor dashboard
 */
export const getAdvisorDashboardData = async (advisorEmail) => {
  try {
    // Get all students assigned to this advisor
    const students = await getStudentsByAdvisor(advisorEmail);
    const studentIds = students.map(student => student.id);
    
    if (studentIds.length === 0) {
      return {
        totalStudents: 0,
        activeStudents: 0,
        pendingReflections: 0,
        activeGoals: 0,
        overdueItems: 0,
        weeklyMeetings: 0
      };
    }

    // Get goals for all students
    const goalsPromises = studentIds.map(studentId => getUserGoals(studentId));
    const allGoalsArrays = await Promise.all(goalsPromises);
    const allGoals = allGoalsArrays.flat();

    // Get reflections for all students (recent ones)
    const reflectionsPromises = studentIds.map(studentId => getUserReflections(studentId));
    const allReflectionsArrays = await Promise.all(reflectionsPromises);
    const allReflections = allReflectionsArrays.flat();

    // Get meetings for all students
    const meetingsPromises = studentIds.map(studentId => getUserMeetings(studentId));
    const allMeetingsArrays = await Promise.all(meetingsPromises);
    const allMeetings = allMeetingsArrays.flat();

    // Calculate statistics
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const activeGoals = allGoals.filter(goal => goal.status !== 'completed').length;
    const overdueGoals = allGoals.filter(goal => {
      if (goal.status === 'completed') return false;
      const targetDate = goal.targetDate?.toDate?.() || new Date(goal.targetDate);
      return targetDate < now;
    }).length;

    const weeklyMeetings = allMeetings.filter(meeting => {
      const meetingDate = meeting.scheduledDate?.toDate?.() || new Date(meeting.scheduledDate);
      return meetingDate >= weekAgo && meetingDate <= now;
    }).length;

    // Count total completed meetings across all students
    const totalCompletedMeetings = allMeetings.filter(meeting => {
      return meeting.status === 'completed' || meeting.status === 'attended' || meeting.attendanceMarked;
    }).length;

    const recentReflections = allReflections.filter(reflection => {
      const reflectionDate = reflection.createdAt?.toDate?.() || new Date(reflection.createdAt);
      return reflectionDate >= weekAgo;
    });

    // Students who have been active in the last week (goals, reflections, or meetings)
    const activeStudentIds = new Set();
    recentReflections.forEach(r => activeStudentIds.add(r.userId));
    allMeetings.filter(m => {
      const meetingDate = m.scheduledDate?.toDate?.() || new Date(m.scheduledDate);
      return meetingDate >= weekAgo;
    }).forEach(m => activeStudentIds.add(m.studentId));

    return {
      totalStudents: students.length,
      activeStudents: activeStudentIds.size,
      pendingReflections: students.length - recentReflections.length, // Students without recent reflections
      activeGoals,
      overdueItems: overdueGoals,
      weeklyMeetings,
      totalCompletedMeetings
    };
  } catch (error) {
    console.error('Error getting advisor dashboard data:', error);
    throw error;
  }
};

/**
 * Get recent reflections from all students assigned to an advisor
 * @param {string} advisorEmail - Email of the advisor
 * @param {number} limit - Maximum number of reflections to return (default: 10)
 * @returns {Promise<Array>} Array of recent reflections with student info
 */
export const getRecentReflectionsByAdvisor = async (advisorEmail, limit = 10) => {
  try {
    // Get all students assigned to this advisor
    const students = await getStudentsByAdvisor(advisorEmail);
    const studentIds = students.map(student => student.id);
    
    if (studentIds.length === 0) {
      return [];
    }

    // Get reflections for all students
    const reflectionsPromises = studentIds.map(studentId => getUserReflections(studentId));
    const allReflectionsArrays = await Promise.all(reflectionsPromises);
    const allReflections = allReflectionsArrays.flat();

    // Add student info to reflections and sort by date
    const reflectionsWithStudentInfo = allReflections.map(reflection => {
      const student = students.find(s => s.id === reflection.userId);
      return {
        ...reflection,
        studentName: student?.name || 'Unknown Student',
        studentEmail: student?.email || '',
        pathway: student?.pathway || ''
      };
    });

    // Sort by creation date (most recent first) and limit results
    reflectionsWithStudentInfo.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
      return dateB - dateA;
    });

    return reflectionsWithStudentInfo.slice(0, limit);
  } catch (error) {
    console.error('Error getting recent reflections by advisor:', error);
    throw error;
  }
};

/**
 * Get students who need attention based on:
 * 1. Have not completed a meeting in the past 2 weeks (14 days)
 * 2. Have open/incomplete action items where student has requested help
 * @param {string} advisorEmail - Email of the advisor
 * @returns {Promise<Array>} Array of students who need attention with reasons
 */
export const getStudentsNeedingAttention = async (advisorEmail) => {
  try {
    // Get all students assigned to this advisor
    const students = await getStudentsByAdvisor(advisorEmail);
    const studentsNeedingAttention = [];
    
    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    for (const student of students) {
      const reasons = [];
      let needsAttention = false;
      let daysSinceLastMeeting = 0;
      
      // Criterion 1: Check for completed meetings in last 14 days
      const meetings = await getUserMeetings(student.id);
      const recentCompletedMeetings = meetings.filter(meeting => {
        // Check if meeting is completed/attended
        const isCompleted = meeting.status === 'completed' || meeting.status === 'attended' || meeting.attendanceMarked;
        if (!isCompleted) return false;
        
        const meetingDate = meeting.scheduledDate?.toDate?.() || new Date(meeting.scheduledDate);
        return meetingDate >= fourteenDaysAgo;
      });

      if (recentCompletedMeetings.length === 0) {
        needsAttention = true;
        
        // Calculate days since last completed meeting
        const completedMeetings = meetings.filter(m => 
          m.status === 'completed' || m.status === 'attended' || m.attendanceMarked
        );
        
        if (completedMeetings.length > 0) {
          const sortedMeetings = completedMeetings.sort((a, b) => {
            const dateA = a.scheduledDate?.toDate?.() || new Date(a.scheduledDate);
            const dateB = b.scheduledDate?.toDate?.() || new Date(b.scheduledDate);
            return dateB - dateA;
          });
          const lastMeeting = sortedMeetings[0];
          const lastMeetingDate = lastMeeting.scheduledDate?.toDate?.() || new Date(lastMeeting.scheduledDate);
          daysSinceLastMeeting = Math.floor((now - lastMeetingDate) / (1000 * 60 * 60 * 24));
          reasons.push(`No completed meeting in ${daysSinceLastMeeting} days`);
        } else {
          daysSinceLastMeeting = 999; // No meetings ever
          reasons.push('No completed meetings on record');
        }
      }

      // Criterion 2: Check for open action items with help requests
      const actionItems = await getUserActionItems(student.id);
      const helpRequestedItems = actionItems.filter(item => {
        const isOpen = item.status !== 'completed' && item.status !== 'done';
        const needsHelp = item.needsHelp === true || item.helpRequested === true || item.flaggedForHelp === true;
        return isOpen && needsHelp;
      });

      if (helpRequestedItems.length > 0) {
        needsAttention = true;
        reasons.push(`${helpRequestedItems.length} action item${helpRequestedItems.length > 1 ? 's' : ''} flagged for help`);
      }

      // Add student to attention list if they meet ANY criterion
      if (needsAttention) {
        studentsNeedingAttention.push({
          ...student,
          attentionReasons: reasons,
          daysSinceLastMeeting: daysSinceLastMeeting,
          helpRequestedItems: helpRequestedItems.length
        });
      }
    }

    return studentsNeedingAttention;
  } catch (error) {
    console.error('Error getting students needing attention:', error);
    throw error;
  }
};

// ============================================================================
// Multi-Pathway Support Functions (Phase 2.1)
// ============================================================================

/**
 * Add a pathway to an advisor's pathway list
 * @param {string} advisorId - The advisor's user ID
 * @param {string} pathway - The pathway to add
 * @returns {Promise<void>}
 */
export const addAdvisorPathway = async (advisorId, pathway) => {
  try {
    await addDoc(collection(db, 'advisor_pathways'), {
      advisor_id: advisorId,
      pathway: pathway,
      created_at: serverTimestamp()
    });
  } catch (error) {
    console.error('Error adding advisor pathway:', error);
    throw error;
  }
};

/**
 * Remove a pathway from an advisor's pathway list
 * @param {string} advisorId - The advisor's user ID
 * @param {string} pathway - The pathway to remove
 * @returns {Promise<void>}
 */
export const removeAdvisorPathway = async (advisorId, pathway) => {
  try {
    const q = query(
      collection(db, 'advisor_pathways'),
      where('advisor_id', '==', advisorId),
      where('pathway', '==', pathway)
    );
    const querySnapshot = await getDocs(q);
    
    // Delete all matching documents (should be only one due to unique constraint)
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error removing advisor pathway:', error);
    throw error;
  }
};

/**
 * Get all pathways for a specific advisor
 * @param {string} advisorId - The advisor's user ID
 * @returns {Promise<Array<string>>} Array of pathway names
 */
export const getAdvisorPathways = async (advisorId) => {
  try {
    const q = query(
      collection(db, 'advisor_pathways'),
      where('advisor_id', '==', advisorId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data().pathway);
  } catch (error) {
    console.error('Error getting advisor pathways:', error);
    throw error;
  }
};

/**
 * Set all pathways for an advisor (replaces existing pathways)
 * @param {string} advisorId - The advisor's user ID
 * @param {Array<string>} pathways - Array of pathway names
 * @returns {Promise<void>}
 */
export const setAdvisorPathways = async (advisorId, pathways) => {
  try {
    // First remove all existing pathways
    const existingPathways = await getAdvisorPathways(advisorId);
    const removePromises = existingPathways.map(pathway => 
      removeAdvisorPathway(advisorId, pathway)
    );
    await Promise.all(removePromises);
    
    // Then add all new pathways
    const addPromises = pathways.map(pathway => 
      addAdvisorPathway(advisorId, pathway)
    );
    await Promise.all(addPromises);
  } catch (error) {
    console.error('Error setting advisor pathways:', error);
    throw error;
  }
};

/**
 * Get advisors by pathways with ANY overlap logic
 * @param {Array<string>} studentPathways - Array of student's pathways
 * @returns {Promise<Array>} Array of advisors with overlap count and pathway info
 */
export const getAdvisorsByPathwaysWithOverlap = async (studentPathways) => {
  try {
    if (!studentPathways || studentPathways.length === 0) {
      return [];
    }

    // Get all advisor-pathway relationships
    const q = query(
      collection(db, 'advisor_pathways'),
      where('pathway', 'in', studentPathways)
    );
    const querySnapshot = await getDocs(q);
    
    // Group by advisor ID and count overlaps
    const advisorOverlaps = {};
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      const advisorId = data.advisor_id;
      
      if (!advisorOverlaps[advisorId]) {
        advisorOverlaps[advisorId] = {
          pathways: [],
          overlapCount: 0
        };
      }
      
      advisorOverlaps[advisorId].pathways.push(data.pathway);
      advisorOverlaps[advisorId].overlapCount++;
    });

    // Get advisor details for all matching advisors
    const advisorIds = Object.keys(advisorOverlaps);
    if (advisorIds.length === 0) {
      return [];
    }

    const advisorPromises = advisorIds.map(advisorId => getUserProfile(advisorId));
    const advisorProfiles = await Promise.all(advisorPromises);
    
    // Filter out non-advisor users and combine with overlap data
    const advisorsWithOverlap = advisorProfiles
      .filter(advisor => advisor && advisor.userType === 'advisor' && advisor.isAdmin === true)
      .map(advisor => ({
        ...advisor,
        pathways: advisorOverlaps[advisor.id].pathways,
        overlapCount: advisorOverlaps[advisor.id].overlapCount
      }))
      .sort((a, b) => b.overlapCount - a.overlapCount); // Sort by overlap count descending

    return advisorsWithOverlap;
  } catch (error) {
    console.error('Error getting advisors by pathways with overlap:', error);
    throw error;
  }
};

/**
 * Migrate existing single pathway data to multi-pathway join table
 * @returns {Promise<{migrated: number, skipped: number}>} Migration results
 */
export const migrateAdvisorPathwaysData = async () => {
  try {
    const results = { migrated: 0, skipped: 0 };
    
    // Get all advisor users with a pathway
    const q = query(
      collection(db, 'users'),
      where('userType', '==', 'advisor')
    );
    const querySnapshot = await getDocs(q);
    
    for (const doc of querySnapshot.docs) {
      const advisor = doc.data();
      const advisorId = doc.id;
      
      // Skip if no pathway or pathway is empty
      if (!advisor.pathway || advisor.pathway.trim() === '') {
        results.skipped++;
        continue;
      }
      
      // Check if already migrated
      const existing = await getAdvisorPathways(advisorId);
      if (existing.length > 0) {
        results.skipped++;
        continue;
      }
      
      // Migrate the single pathway
      await addAdvisorPathway(advisorId, advisor.pathway);
      results.migrated++;
    }
    
    return results;
  } catch (error) {
    console.error('Error migrating advisor pathways data:', error);
    throw error;
  }
};

// ============================================================================
// Calendly Integration Functions
// ============================================================================

/**
 * Get Calendly events for a specific user
 * @param {string} userId - User ID to get events for
 * @returns {Promise<Array>} Array of Calendly events
 */
export const getUserCalendlyEvents = async (userId) => {
  try {
    const q = query(
      collection(db, 'calendly_events'),
      where('payload.studentId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot || !querySnapshot.docs) {
      console.warn('No querySnapshot or docs found for getUserCalendlyEvents');
      return [];
    }
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user Calendly events:', error);
    throw error;
  }
};

/**
 * Get all Calendly events (admin function)
 * @returns {Promise<Array>} Array of all Calendly events
 */
export const getAllCalendlyEvents = async () => {
  try {
    const q = query(
      collection(db, 'calendly_events'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot || !querySnapshot.docs) {
      console.warn('No querySnapshot or docs found for getAllCalendlyEvents');
      return [];
    }
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all Calendly events:', error);
    throw error;
  }
};

/**
 * Get meetings that originated from Calendly
 * @param {string} userId - Optional user ID to filter by
 * @returns {Promise<Array>} Array of Calendly-sourced meetings
 */
export const getCalendlyMeetings = async (userId = null) => {
  try {
    let q = query(
      collection(db, 'meetings'),
      where('source', '==', 'calendly'),
      orderBy('scheduledDate', 'desc')
    );

    if (userId) {
      q = query(
        collection(db, 'meetings'),
        where('source', '==', 'calendly'),
        where('studentId', '==', userId),
        orderBy('scheduledDate', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    if (!querySnapshot || !querySnapshot.docs) {
      console.warn('No querySnapshot or docs found for getCalendlyMeetings');
      return [];
    }
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting Calendly meetings:', error);
    throw error;
  }
};

/**
 * Update a meeting's Calendly synchronization status
 * @param {string} meetingId - Meeting document ID
 * @param {Object} syncData - Sync status data
 */
export const updateMeetingCalendlySync = async (meetingId, syncData) => {
  try {
    await updateDoc(doc(db, 'meetings', meetingId), {
      ...syncData,
      lastSyncAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating meeting Calendly sync:', error);
    throw error;
  }
};

// Action Plan functions
export const createActionItem = async (userId, itemData) => {
  try {
    const docRef = await addDoc(collection(db, 'actionItems'), {
      userId,
      ...itemData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating action item:', error);
    throw error;
  }
};

export const updateActionItem = async (itemId, data) => {
  try {
    await updateDoc(doc(db, 'actionItems', itemId), {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating action item:', error);
    throw error;
  }
};

export const deleteActionItem = async (itemId) => {
  try {
    await deleteDoc(doc(db, 'actionItems', itemId));
  } catch (error) {
    console.error('Error deleting action item:', error);
    throw error;
  }
};

export const getUserActionItems = async (userId) => {
  try {
    const q = query(
      collection(db, 'actionItems'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user action items:', error);
    throw error;
  }
};

/**
 * Note Management Functions
 */

export const createNote = async (userId, noteData) => {
  try {
    const noteRef = await addDoc(collection(db, 'notes'), {
      userId,
      title: noteData.title || 'Untitled Note',
      content: noteData.content || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return noteRef.id;
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
};

export const updateNote = async (noteId, noteData) => {
  try {
    const noteRef = doc(db, 'notes', noteId);
    await updateDoc(noteRef, {
      ...noteData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
};

export const deleteNote = async (noteId) => {
  try {
    await deleteDoc(doc(db, 'notes', noteId));
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
};

export const getUserNotes = async (userId) => {
  try {
    const q = query(
      collection(db, 'notes'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user notes:', error);
    throw error;
  }
};

/**
 * Advisor Note Management Functions
 * Notes created by advisors and tagged to specific students
 */

export const createAdvisorNote = async (advisorId, noteData) => {
  try {
    const noteRef = await addDoc(collection(db, 'advisorNotes'), {
      advisorId,
      studentId: noteData.studentId,
      studentName: noteData.studentName || '',
      // Support for multiple students/teams
      studentIds: noteData.studentIds || (noteData.studentId ? [noteData.studentId] : []),
      studentNames: noteData.studentNames || (noteData.studentName ? [noteData.studentName] : []),
      teamId: noteData.teamId || null,
      teamName: noteData.teamName || null,
      title: noteData.title || 'Untitled Note',
      content: noteData.content || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return noteRef.id;
  } catch (error) {
    console.error('Error creating advisor note:', error);
    throw error;
  }
};

export const updateAdvisorNote = async (noteId, noteData) => {
  try {
    const noteRef = doc(db, 'advisorNotes', noteId);
    const updateData = {
      ...noteData,
      updatedAt: serverTimestamp()
    };
    
    // Ensure arrays are updated if provided
    if (noteData.studentIds) {
      updateData.studentIds = noteData.studentIds;
      updateData.studentNames = noteData.studentNames || [];
    } else if (noteData.studentId) {
      // Backward compatibility: single student
      updateData.studentIds = [noteData.studentId];
      updateData.studentNames = noteData.studentName ? [noteData.studentName] : [];
    }
    
    await updateDoc(noteRef, updateData);
  } catch (error) {
    console.error('Error updating advisor note:', error);
    throw error;
  }
};

export const deleteAdvisorNote = async (noteId) => {
  try {
    await deleteDoc(doc(db, 'advisorNotes', noteId));
  } catch (error) {
    console.error('Error deleting advisor note:', error);
    throw error;
  }
};

export const getAdvisorNotes = async (advisorId, studentId = null) => {
  try {
    let q;
    if (studentId) {
      // Get notes for a specific student
      q = query(
        collection(db, 'advisorNotes'),
        where('advisorId', '==', advisorId),
        where('studentId', '==', studentId),
        orderBy('updatedAt', 'desc')
      );
    } else {
      // Get all notes for this advisor
      q = query(
        collection(db, 'advisorNotes'),
        where('advisorId', '==', advisorId),
        orderBy('updatedAt', 'desc')
      );
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting advisor notes:', error);
    throw error;
  }
};

// Advisor Todo functions
export const createAdvisorTodo = async (todoData) => {
  try {
    const docRef = await addDoc(collection(db, 'advisor_todos'), {
      ...todoData,
      // Support for multiple students/teams
      studentIds: todoData.studentIds || (todoData.studentId ? [todoData.studentId] : []),
      studentNames: todoData.studentNames || [],
      teamId: todoData.teamId || null,
      teamName: todoData.teamName || null,
      dueDate: todoData.dueDate || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating advisor todo:', error);
    throw error;
  }
};

export const updateAdvisorTodo = async (todoId, data) => {
  try {
    await updateDoc(doc(db, 'advisor_todos', todoId), {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating advisor todo:', error);
    throw error;
  }
};

export const deleteAdvisorTodo = async (todoId) => {
  try {
    await deleteDoc(doc(db, 'advisor_todos', todoId));
  } catch (error) {
    console.error('Error deleting advisor todo:', error);
    throw error;
  }
};

export const getAdvisorTodos = async (advisorId) => {
  try {
    const q = query(
      collection(db, 'advisor_todos'),
      where('advisorId', '==', advisorId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting advisor todos:', error);
    throw error;
  }
};

// ============================================================================
// Project Group Management Functions
// ============================================================================

/**
 * Create a new project group
 * @param {Object} groupData - Project group data including name, advisorId, and studentIds
 * @returns {Promise<string>} - ID of the created project group
 */
export const createProjectGroup = async (groupData) => {
  try {
    const docRef = await addDoc(collection(db, 'projectGroups'), {
      name: groupData.name,
      description: groupData.description || '',
      advisorId: groupData.advisorId,
      studentIds: groupData.studentIds || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating project group:', error);
    throw enhanceFirebaseError(error, 'create project group');
  }
};

/**
 * Update an existing project group
 * @param {string} groupId - ID of the project group
 * @param {Object} updates - Fields to update
 */
export const updateProjectGroup = async (groupId, updates) => {
  try {
    await updateDoc(doc(db, 'projectGroups', groupId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating project group:', error);
    throw enhanceFirebaseError(error, 'update project group');
  }
};

/**
 * Delete a project group
 * @param {string} groupId - ID of the project group
 */
export const deleteProjectGroup = async (groupId) => {
  try {
    await deleteDoc(doc(db, 'projectGroups', groupId));
  } catch (error) {
    console.error('Error deleting project group:', error);
    throw enhanceFirebaseError(error, 'delete project group');
  }
};

/**
 * Get all project groups for an advisor
 * @param {string} advisorId - ID of the advisor
 * @returns {Promise<Array>} Array of project groups
 */
export const getProjectGroupsByAdvisor = async (advisorId) => {
  try {
    const q = query(
      collection(db, 'projectGroups'),
      where('advisorId', '==', advisorId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting project groups:', error);
    throw enhanceFirebaseError(error, 'get project groups');
  }
};

/**
 * Get a specific project group by ID
 * @param {string} groupId - ID of the project group
 * @returns {Promise<Object>} Project group data
 */
export const getProjectGroup = async (groupId) => {
  try {
    const docSnap = await getDoc(doc(db, 'projectGroups', groupId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting project group:', error);
    throw enhanceFirebaseError(error, 'get project group');
  }
};

/**
 * Create a meeting for multiple students (project group or multi-select)
 * @param {Object} meetingData - Meeting data
 * @param {Array<string>} studentIds - Array of student IDs
 * @param {string} advisorId - ID of the advisor creating the meeting
 * @returns {Promise<string>} - ID of the created meeting
 */
export const createGroupMeeting = async (meetingData, studentIds, advisorId) => {
  try {
    const docRef = await addDoc(collection(db, 'meetings'), {
      ...meetingData,
      studentIds: studentIds,
      studentId: studentIds[0], // Keep for backward compatibility
      isGroupMeeting: studentIds.length > 1,
      loggedBy: 'advisor',
      advisorId: advisorId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating group meeting:', error);
    throw enhanceFirebaseError(error, 'create group meeting');
  }
};

/**
 * Create action items for a group meeting with flexible assignment
 * @param {Object} actionItemData - Action item data
 * @param {Array<string>} studentIds - Array of student IDs to assign to
 * @param {string} meetingId - Optional meeting ID to link to
 * @returns {Promise<Array<string>>} - Array of created action item IDs
 */
export const createGroupActionItems = async (actionItemData, studentIds, meetingId = null) => {
  try {
    const actionItemIds = [];
    
    for (const studentId of studentIds) {
      const docRef = await addDoc(collection(db, 'actionItems'), {
        userId: studentId,
        ...actionItemData,
        meetingId: meetingId,
        isGroupItem: studentIds.length > 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      actionItemIds.push(docRef.id);
    }
    
    return actionItemIds;
  } catch (error) {
    console.error('Error creating group action items:', error);
    throw enhanceFirebaseError(error, 'create group action items');
  }
};;