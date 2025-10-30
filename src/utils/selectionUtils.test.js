/**
 * Tests for selectionUtils
 */
import { processSelectionMode, getStudentNameById } from './selectionUtils';

describe('processSelectionMode', () => {
  const mockStudents = [
    { id: 'student1', name: 'Alice Johnson' },
    { id: 'student2', name: 'Bob Smith' },
    { id: 'student3', name: 'Carol Davis' }
  ];

  const mockTeams = [
    { id: 'team1', name: 'Team Alpha', studentIds: ['student1', 'student2'] },
    { id: 'team2', name: 'Team Beta', studentIds: ['student3'] }
  ];

  describe('single mode', () => {
    it('should return one student when mode is single', () => {
      const result = processSelectionMode('single', ['student1'], '', mockStudents, mockTeams);
      
      expect(result.studentIds).toEqual(['student1']);
      expect(result.studentNames).toEqual(['Alice Johnson']);
      expect(result.teamId).toBeNull();
      expect(result.teamName).toBeNull();
    });

    it('should return only first student when mode is single with multiple selected', () => {
      const result = processSelectionMode('single', ['student1', 'student2'], '', mockStudents, mockTeams);
      
      expect(result.studentIds).toEqual(['student1']);
      expect(result.studentNames).toEqual(['Alice Johnson']);
    });

    it('should return empty arrays when no student selected in single mode', () => {
      const result = processSelectionMode('single', [], '', mockStudents, mockTeams);
      
      expect(result.studentIds).toEqual([]);
      expect(result.studentNames).toEqual([]);
      expect(result.teamId).toBeNull();
      expect(result.teamName).toBeNull();
    });
  });

  describe('multiple mode', () => {
    it('should return multiple students when mode is multiple', () => {
      const result = processSelectionMode('multiple', ['student1', 'student2'], '', mockStudents, mockTeams);
      
      expect(result.studentIds).toEqual(['student1', 'student2']);
      expect(result.studentNames).toEqual(['Alice Johnson', 'Bob Smith']);
      expect(result.teamId).toBeNull();
      expect(result.teamName).toBeNull();
    });

    it('should return all selected students in multiple mode', () => {
      const result = processSelectionMode('multiple', ['student1', 'student2', 'student3'], '', mockStudents, mockTeams);
      
      expect(result.studentIds).toEqual(['student1', 'student2', 'student3']);
      expect(result.studentNames).toEqual(['Alice Johnson', 'Bob Smith', 'Carol Davis']);
    });

    it('should return empty arrays when no students selected in multiple mode', () => {
      const result = processSelectionMode('multiple', [], '', mockStudents, mockTeams);
      
      expect(result.studentIds).toEqual([]);
      expect(result.studentNames).toEqual([]);
      expect(result.teamId).toBeNull();
      expect(result.teamName).toBeNull();
    });
  });

  describe('team mode', () => {
    it('should return team students when mode is team', () => {
      const result = processSelectionMode('team', [], 'team1', mockStudents, mockTeams);
      
      expect(result.studentIds).toEqual(['student1', 'student2']);
      expect(result.studentNames).toEqual(['Alice Johnson', 'Bob Smith']);
      expect(result.teamId).toBe('team1');
      expect(result.teamName).toBe('Team Alpha');
    });

    it('should return empty arrays when no team selected in team mode', () => {
      const result = processSelectionMode('team', [], '', mockStudents, mockTeams);
      
      expect(result.studentIds).toEqual([]);
      expect(result.studentNames).toEqual([]);
      expect(result.teamId).toBeNull();
      expect(result.teamName).toBeNull();
    });

    it('should handle team with unknown students gracefully', () => {
      const teamWithUnknownStudents = [
        { id: 'team3', name: 'Team Gamma', studentIds: ['unknown1', 'student1'] }
      ];
      const result = processSelectionMode('team', [], 'team3', mockStudents, teamWithUnknownStudents);
      
      expect(result.studentIds).toEqual(['unknown1', 'student1']);
      expect(result.studentNames).toEqual(['Unknown', 'Alice Johnson']);
      expect(result.teamId).toBe('team3');
      expect(result.teamName).toBe('Team Gamma');
    });
  });

  describe('unrecognized modes', () => {
    it('should return empty arrays for unrecognized mode like "students"', () => {
      const result = processSelectionMode('students', ['student1', 'student2'], '', mockStudents, mockTeams);
      
      expect(result.studentIds).toEqual([]);
      expect(result.studentNames).toEqual([]);
      expect(result.teamId).toBeNull();
      expect(result.teamName).toBeNull();
    });

    it('should return empty arrays for any invalid mode', () => {
      const result = processSelectionMode('invalid', ['student1'], '', mockStudents, mockTeams);
      
      expect(result.studentIds).toEqual([]);
      expect(result.studentNames).toEqual([]);
      expect(result.teamId).toBeNull();
      expect(result.teamName).toBeNull();
    });
  });
});

describe('getStudentNameById', () => {
  const mockStudents = [
    { id: 'student1', name: 'Alice Johnson' },
    { id: 'student2', name: 'Bob Smith' }
  ];

  it('should return student name when student exists', () => {
    expect(getStudentNameById('student1', mockStudents)).toBe('Alice Johnson');
    expect(getStudentNameById('student2', mockStudents)).toBe('Bob Smith');
  });

  it('should return Unknown when student not found', () => {
    expect(getStudentNameById('nonexistent', mockStudents)).toBe('Unknown');
  });

  it('should return Unknown when studentId is null', () => {
    expect(getStudentNameById(null, mockStudents)).toBe('Unknown');
  });

  it('should return Unknown when students array is empty', () => {
    expect(getStudentNameById('student1', [])).toBe('Unknown');
  });
});
