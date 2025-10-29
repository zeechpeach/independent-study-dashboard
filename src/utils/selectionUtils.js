/**
 * Utility functions for handling student/team selection in advisor components
 */

/**
 * Process selection mode to get student IDs and names
 * @param {string} selectionMode - 'single', 'multiple', or 'team'
 * @param {Array} selectedStudentIds - Array of selected student IDs
 * @param {string} selectedTeamId - Selected team ID
 * @param {Array} students - Array of all students
 * @param {Array} teams - Array of all teams
 * @returns {Object} Object with studentIds, studentNames, teamId, teamName
 */
export const processSelectionMode = (selectionMode, selectedStudentIds, selectedTeamId, students, teams) => {
  let studentIds = [];
  let studentNames = [];
  let teamId = null;
  let teamName = null;

  if (selectionMode === 'team' && selectedTeamId) {
    const team = teams.find(t => t.id === selectedTeamId);
    if (team) {
      teamId = team.id;
      teamName = team.name;
      studentIds = team.studentIds || [];
      studentNames = team.studentIds.map(sid => {
        const student = students.find(s => s.id === sid);
        return student ? student.name : 'Unknown';
      });
    }
  } else if (selectionMode === 'multiple' && selectedStudentIds.length > 0) {
    studentIds = selectedStudentIds;
    studentNames = selectedStudentIds.map(sid => {
      const student = students.find(s => s.id === sid);
      return student ? student.name : 'Unknown';
    });
  } else if (selectionMode === 'single' && selectedStudentIds.length > 0) {
    const studentId = selectedStudentIds[0];
    const student = students.find(s => s.id === studentId);
    studentIds = [studentId];
    studentNames = student ? [student.name] : [];
  }

  return { studentIds, studentNames, teamId, teamName };
};

/**
 * Get student name by ID
 * @param {string} studentId - Student ID
 * @param {Array} students - Array of all students
 * @returns {string} Student name or 'Unknown'
 */
export const getStudentNameById = (studentId, students) => {
  const student = students.find(s => s.id === studentId);
  return student?.name || 'Unknown';
};
