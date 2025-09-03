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

// Advisor-specific functions for Phase 3B
/**
 * Get students assigned to a specific advisor
 * @param {string} advisorName - Name of the advisor
 * @returns {Promise<Array>} Array of student profiles assigned to the advisor
 */
export const getStudentsByAdvisor = async (advisorName) => {
  try {
    const q = query(
      collection(db, 'users'),
      where('advisor', '==', advisorName),
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
 * @param {string} advisorName - Name of the advisor
 * @returns {Promise<Object>} Aggregated statistics for advisor dashboard
 */
export const getAdvisorDashboardData = async (advisorName) => {
  try {
    // Get all students assigned to this advisor
    const students = await getStudentsByAdvisor(advisorName);
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
      weeklyMeetings
    };
  } catch (error) {
    console.error('Error getting advisor dashboard data:', error);
    throw error;
  }
};

/**
 * Get recent reflections from all students assigned to an advisor
 * @param {string} advisorName - Name of the advisor
 * @param {number} limit - Maximum number of reflections to return (default: 10)
 * @returns {Promise<Array>} Array of recent reflections with student info
 */
export const getRecentReflectionsByAdvisor = async (advisorName, limit = 10) => {
  try {
    // Get all students assigned to this advisor
    const students = await getStudentsByAdvisor(advisorName);
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
 * Get students who need attention (haven't submitted reflections recently, overdue goals, etc.)
 * @param {string} advisorName - Name of the advisor
 * @returns {Promise<Array>} Array of students who need attention with reasons
 */
export const getStudentsNeedingAttention = async (advisorName) => {
  try {
    // Get all students assigned to this advisor
    const students = await getStudentsByAdvisor(advisorName);
    const studentsNeedingAttention = [];
    
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    for (const student of students) {
      const reasons = [];
      
      // Check for recent reflections
      const reflections = await getUserReflections(student.id);
      const recentReflections = reflections.filter(reflection => {
        const reflectionDate = reflection.createdAt?.toDate?.() || new Date(reflection.createdAt);
        return reflectionDate >= weekAgo;
      });

      if (recentReflections.length === 0) {
        reasons.push('No recent reflections (7+ days)');
      }

      // Check for overdue goals
      const goals = await getUserGoals(student.id);
      const overdueGoals = goals.filter(goal => {
        if (goal.status === 'completed') return false;
        const targetDate = goal.targetDate?.toDate?.() || new Date(goal.targetDate);
        return targetDate < now;
      });

      if (overdueGoals.length > 0) {
        reasons.push(`${overdueGoals.length} overdue goal${overdueGoals.length > 1 ? 's' : ''}`);
      }

      // Check for missed meetings
      const meetings = await getUserMeetings(student.id);
      const missedMeetings = meetings.filter(meeting => {
        if (meeting.status === 'completed') return false;
        const meetingDate = meeting.scheduledDate?.toDate?.() || new Date(meeting.scheduledDate);
        return meetingDate < now && meeting.status !== 'cancelled';
      });

      if (missedMeetings.length > 0) {
        reasons.push(`${missedMeetings.length} missed meeting${missedMeetings.length > 1 ? 's' : ''}`);
      }

      if (reasons.length > 0) {
        studentsNeedingAttention.push({
          ...student,
          attentionReasons: reasons,
          overdueGoals: overdueGoals.length,
          daysSinceLastReflection: recentReflections.length === 0 ? 
            Math.floor((now - (reflections[0]?.createdAt?.toDate?.() || now)) / (1000 * 60 * 60 * 24)) : 0
        });
      }
    }

    return studentsNeedingAttention;
  } catch (error) {
    console.error('Error getting students needing attention:', error);
    throw error;
  }
};