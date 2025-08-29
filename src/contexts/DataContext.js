import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  getUserReflections,
  getUserGoals,
  getUserMeetings,
  getAllImportantDates,
  createReflection,
  updateReflection,
  createGoal,
  updateGoal,
  deleteGoal,
  createMeeting,
  updateMeeting,
  createImportantDate,
  updateImportantDate,
  deleteImportantDate,
  getAllUsers,
  getAllMeetings,
  getAllReflections,
  getAllGoals
} from '../services/firebase';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [reflections, setReflections] = useState([]);
  const [goals, setGoals] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [importantDates, setImportantDates] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Student data functions
  const fetchUserReflections = useCallback(async (userId) => {
    try {
      setLoading(true);
      const userReflections = await getUserReflections(userId);
      setReflections(userReflections);
      return userReflections;
    } catch (error) {
      console.error('Error fetching reflections:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserGoals = useCallback(async (userId) => {
    try {
      setLoading(true);
      const userGoals = await getUserGoals(userId);
      setGoals(userGoals);
      return userGoals;
    } catch (error) {
      console.error('Error fetching goals:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserMeetings = useCallback(async (userId) => {
    try {
      setLoading(true);
      const userMeetings = await getUserMeetings(userId);
      setMeetings(userMeetings);
      return userMeetings;
    } catch (error) {
      console.error('Error fetching meetings:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchImportantDates = useCallback(async () => {
    try {
      setLoading(true);
      const dates = await getAllImportantDates();
      setImportantDates(dates);
      return dates;
    } catch (error) {
      console.error('Error fetching important dates:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Admin data functions
  const fetchAllUsers = useCallback(async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      setUsers(allUsers);
      return allUsers;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllMeetings = useCallback(async () => {
    try {
      setLoading(true);
      const allMeetings = await getAllMeetings();
      setMeetings(allMeetings);
      return allMeetings;
    } catch (error) {
      console.error('Error fetching all meetings:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllReflections = useCallback(async () => {
    try {
      setLoading(true);
      const allReflections = await getAllReflections();
      setReflections(allReflections);
      return allReflections;
    } catch (error) {
      console.error('Error fetching all reflections:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllGoals = useCallback(async () => {
    try {
      setLoading(true);
      const allGoals = await getAllGoals();
      setGoals(allGoals);
      return allGoals;
    } catch (error) {
      console.error('Error fetching all goals:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // CRUD operations
  const addReflection = async (userId, reflectionData) => {
    try {
      const id = await createReflection(userId, reflectionData);
      await fetchUserReflections(userId);
      return id;
    } catch (error) {
      console.error('Error adding reflection:', error);
      throw error;
    }
  };

  const editReflection = async (reflectionId, data, userId) => {
    try {
      await updateReflection(reflectionId, data);
      await fetchUserReflections(userId);
    } catch (error) {
      console.error('Error updating reflection:', error);
      throw error;
    }
  };

  const addGoal = async (userId, goalData) => {
    try {
      const id = await createGoal(userId, goalData);
      await fetchUserGoals(userId);
      return id;
    } catch (error) {
      console.error('Error adding goal:', error);
      throw error;
    }
  };

  const editGoal = async (goalId, data, userId) => {
    try {
      await updateGoal(goalId, data);
      await fetchUserGoals(userId);
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  };

  const removeGoal = async (goalId, userId) => {
    try {
      await deleteGoal(goalId);
      await fetchUserGoals(userId);
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  };

  const addMeeting = async (meetingData) => {
    try {
      const id = await createMeeting(meetingData);
      if (meetingData.studentId) {
        await fetchUserMeetings(meetingData.studentId);
      }
      return id;
    } catch (error) {
      console.error('Error adding meeting:', error);
      throw error;
    }
  };

  const editMeeting = async (meetingId, data, studentId) => {
    try {
      await updateMeeting(meetingId, data);
      if (studentId) {
        await fetchUserMeetings(studentId);
      }
    } catch (error) {
      console.error('Error updating meeting:', error);
      throw error;
    }
  };

  const addImportantDate = async (dateData) => {
    try {
      const id = await createImportantDate(dateData);
      await fetchImportantDates();
      return id;
    } catch (error) {
      console.error('Error adding important date:', error);
      throw error;
    }
  };

  const editImportantDate = async (dateId, data) => {
    try {
      await updateImportantDate(dateId, data);
      await fetchImportantDates();
    } catch (error) {
      console.error('Error updating important date:', error);
      throw error;
    }
  };

  const removeImportantDate = async (dateId) => {
    try {
      await deleteImportantDate(dateId);
      await fetchImportantDates();
    } catch (error) {
      console.error('Error deleting important date:', error);
      throw error;
    }
  };

  const value = {
    // Data
    reflections,
    goals,
    meetings,
    importantDates,
    users,
    loading,
    
    // Student functions
    fetchUserReflections,
    fetchUserGoals,
    fetchUserMeetings,
    fetchImportantDates,
    
    // Admin functions
    fetchAllUsers,
    fetchAllMeetings,
    fetchAllReflections,
    fetchAllGoals,
    
    // CRUD operations
    addReflection,
    editReflection,
    addGoal,
    editGoal,
    removeGoal,
    addMeeting,
    editMeeting,
    addImportantDate,
    editImportantDate,
    removeImportantDate
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};