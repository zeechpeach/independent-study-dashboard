# Advisor Dashboard Enhancements

This document describes the comprehensive improvements made to the Advisor Dashboard to support enhanced student management, project-based grouping, and multi-student meeting logging.

## Overview

The enhancements address five key areas:
1. Refined "Needs Attention" tab logic
2. Global meeting counter
3. Project-based student grouping
4. Enhanced meeting and action item creation
5. Updated database schema

## 1. Refined "Needs Attention" Tab Logic

### Previous Behavior
- Students appeared if they had no activity (meetings or reflections) in the past 10 days
- Based on general activity rather than specific criteria

### New Behavior
Students now appear in the "Needs Attention" tab if they meet **ANY** of these criteria:
- Have not completed a meeting in the past **14 days** (2 weeks)
- Have open/incomplete action items where the student has requested help or flagged as needing assistance

### Implementation Details
- Updated `getStudentsNeedingAttention()` in `src/services/firebase.js`
- Changed timeframe from 10 days to 14 days for meeting checks
- Added check for action items with `needsHelp`, `helpRequested`, or `flaggedForHelp` flags
- Updated `NeedsAttentionPanel.jsx` to display new metrics (days since last meeting, help-requested items)

### Code Location
- Function: `src/services/firebase.js:854-935` (getStudentsNeedingAttention)
- Component: `src/components/advisor/NeedsAttentionPanel.jsx`

## 2. Global Meeting Counter

### Feature Description
A prominent counter displays the total number of completed meetings across ALL students combined.

### Implementation
- Added to the top of the advisor dashboard in a green gradient card
- Updates dynamically when new meetings are logged
- Counts meetings with status: 'completed', 'attended', or where attendanceMarked is true

### Display Location
- Positioned at the top of the dashboard alongside the "Total Students" card
- Uses a distinctive green gradient background for visibility
- Shows count with "Across all students" subtitle

### Code Location
- Data calculation: `src/services/firebase.js:776-778` (totalCompletedMeetings)
- Display: `src/pages/AdvisorDashboard.js:218-240`

## 3. Project-Based Student Grouping

### Feature Description
Advisors can create project groups/teams to organize students working on the same project.

### Capabilities
- **Create** project teams with name and description
- **Assign** multiple students to each team
- **Edit** team membership and details
- **Delete** teams when no longer needed
- **View** all team members with their details

### Database Schema

#### Collection: `projectGroups`
```javascript
{
  id: string,              // Auto-generated document ID
  name: string,            // Team name (e.g., "AI Research Team")
  description: string,     // Optional project description
  advisorId: string,       // ID of the advisor who owns this team
  studentIds: string[],    // Array of student user IDs
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### API Functions
Located in `src/services/firebase.js`:
- `createProjectGroup(groupData)` - Create a new team
- `updateProjectGroup(groupId, updates)` - Update team details
- `deleteProjectGroup(groupId)` - Delete a team
- `getProjectGroupsByAdvisor(advisorId)` - Get all teams for an advisor
- `getProjectGroup(groupId)` - Get a specific team

### UI Component
- Location: `src/components/advisor/ProjectGroupManagement.jsx`
- Access: From main dashboard via "Project Teams" button in Quick Actions
- Features:
  - Card-based team display with member lists
  - Modal for creating/editing teams
  - Multi-select interface for assigning students
  - Inline edit and delete actions

## 4. Enhanced Meeting and Action Item Creation

### Meeting Log Modal Enhancements

The advisor meeting log modal now supports three selection modes:

#### Mode 1: Single Student
- Traditional one-student-at-a-time selection
- Uses dropdown to select a specific student
- Compatible with pre-selected student from detail view

#### Mode 2: Multiple Students
- Multi-select checkbox interface
- Select any combination of students
- Shows count of selected students
- Useful for ad-hoc group meetings

#### Mode 3: Project Team
- Select an entire project team at once
- Automatically includes all team members
- Shows team size in dropdown
- Streamlines logging for recurring team meetings

### Visual Feedback
- Tabbed interface to switch between selection modes
- Real-time display of all selected students before saving
- Clear confirmation of which students will receive the meeting log
- Shows selected students' names in a summary card

### Implementation Details
- Updated `AdvisorMeetingLogModal.jsx` with three selection modes
- Added project group fetching on modal open
- Enhanced form validation for each mode
- Loops through selected students to log meetings individually

### Code Location
- Component: `src/components/advisor/AdvisorMeetingLogModal.jsx`
- Helper functions: `src/services/firebase.js:1515-1644`

## 5. Database Schema Updates

### New Collection: `projectGroups`
As described in section 3 above.

### Enhanced `meetings` Collection
While maintaining backward compatibility with single-student meetings, the schema now supports:
```javascript
{
  // Existing fields...
  studentId: string,           // Primary student (for backward compatibility)
  studentIds: string[],        // Array of all students (for group meetings)
  isGroupMeeting: boolean,     // True if logged for multiple students
  // ...other fields
}
```

### Enhanced `actionItems` Collection
Action items can now be created for multiple students:
```javascript
{
  // Existing fields...
  userId: string,              // Student this item is assigned to
  isGroupItem: boolean,        // True if created as part of group assignment
  meetingId: string,           // Optional link to related meeting
  // ...other fields
}
```

### Firestore Security Rules
Added rules for project groups collection:
```
match /projectGroups/{groupId} {
  allow read: if isSignedIn();
  allow create, update, delete: if isZeechAdvisor();
}
```

## Usage Workflows

### Workflow 1: Creating a Project Team
1. Click "Project Teams" button in Quick Actions
2. Click "Create Team" button
3. Enter team name (e.g., "Machine Learning Project")
4. Optionally add description
5. Select students using checkboxes
6. Click "Create Team"

### Workflow 2: Logging a Team Meeting
1. Click "Log Meeting" in Meeting Management panel
2. Switch to "Project Team" tab
3. Select the project team from dropdown
4. Choose meeting date
5. Mark attendance status
6. Click "Log Meeting"
7. Meeting is logged for all team members automatically

### Workflow 3: Logging a Multi-Student Meeting (Ad-hoc)
1. Click "Log Meeting" in Meeting Management panel
2. Switch to "Multiple Students" tab
3. Check boxes for students who attended
4. Choose meeting date
5. Mark attendance status
6. Click "Log Meeting"
7. Meeting is logged for each selected student

### Workflow 4: Monitoring Student Attention Needs
1. View "Students Needing Attention" panel in sidebar
2. Students appear if:
   - No completed meeting in 14+ days, OR
   - Have action items flagged for help
3. Click "View" to see student details
4. Take appropriate action (schedule meeting, provide help, etc.)

## Testing Recommendations

### Manual Testing Checklist
- [ ] Create a project team with multiple students
- [ ] Log a meeting for the entire team
- [ ] Verify all team members show the meeting in their records
- [ ] Log a meeting for multiple students (not a team)
- [ ] Check "Needs Attention" panel after 14 days without meetings
- [ ] Flag an action item for help and verify student appears in panel
- [ ] Verify global meeting counter increases when meetings are logged
- [ ] Edit a project team (add/remove students)
- [ ] Delete a project team
- [ ] Switch between single/multiple/project selection modes

### Data Validation
- Ensure existing student data is preserved
- Verify backward compatibility with single-student meetings
- Check that meeting counter accurately reflects completed meetings
- Validate that attention logic works with different scenarios

## Migration Notes

### No Migration Required
All changes are backward compatible. Existing data structures are maintained:
- Single-student meetings continue to work as before
- The `studentId` field is still populated for all meetings
- New multi-student features are additive, not destructive

### Future Considerations
- Consider adding project-level statistics dashboard
- Potential for project-specific action items (shared across team)
- Team-level progress tracking and reporting
- Meeting notes shared across project team members

## Technical Notes

### Performance Considerations
- Project group queries are scoped to specific advisor (efficient)
- Meeting counter calculation happens once on dashboard load
- Attention logic runs asynchronously per student
- All queries use proper Firestore indexes

### Error Handling
- All Firebase operations wrapped in try-catch blocks
- User-friendly error messages in UI
- Graceful degradation if project groups fail to load
- Form validation prevents invalid data submission

### Code Quality
- Build: ✅ Compiles successfully
- Tests: ✅ Existing tests pass (some pre-existing failures unrelated to changes)
- Linting: ✅ No linting errors
- Security: ✅ No CodeQL alerts
- Code Review: ✅ No review comments

## Summary

These enhancements provide advisors with powerful tools for managing students efficiently:
- **Better attention management** with clear 14-day criteria
- **Visibility** into total meeting activity across all students
- **Efficiency** through project-based grouping and bulk operations
- **Flexibility** with single, multiple, or team meeting logging

All features integrate seamlessly with the existing dashboard while maintaining backward compatibility and data integrity.
