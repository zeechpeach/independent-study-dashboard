# Meeting Attendance Tracking Changes

## Overview
This document describes the improvements made to the meeting attendance tracking system to address issues where student-logged meetings were being automatically marked as "missed" before advisor review.

## Problem Statement
Previously, the system had the following issues:
1. Student-logged past meetings were automatically marked as "missed" without advisor review
2. No way for advisors to review and correct attendance for historical meetings
3. "Needs Attention" tab only showed past meetings, not all student-logged meetings requiring review

## Solution

### 1. New Status Workflow

#### Previous Status Flow
```
Student logs meeting → status: 'scheduled'
→ (if past date) → auto-marked as 'missed'
```

#### New Status Flow
```
Student logs meeting → status: 'pending-review'
→ Appears in advisor's "Needs Attention" tab (regardless of date)
→ Advisor reviews → status: 'attended' or 'missed'
```

### 2. Status Values

#### New Primary Statuses
- **`pending-review`**: Student-logged meeting awaiting advisor confirmation
- **`attended`**: Meeting confirmed as attended by advisor
- **`missed`**: Meeting confirmed as missed/no-show by advisor
- **`scheduled`**: Future meetings scheduled through external systems
- **`cancelled`**: Cancelled meetings

#### Legacy Statuses (Backward Compatible)
- **`completed`**: Treated as 'attended' (legacy)
- **`no-show`**: Treated as 'missed' (legacy)

### 3. Key Features

#### A. Fixed "Needs Attention" Tab
- Shows **ALL** student-logged meetings with `pending-review` status
- Works regardless of whether meeting is past, present, or future
- No automatic status changes before advisor review
- Clear indicators showing meetings were logged by students

#### B. Meeting History Panel
New comprehensive view for reviewing past meetings:
- **Filters**: Student, attendance status, date range
- **Inline Editing**: Change attendance status for any historical meeting
- **Source Indicators**: Visual badges showing whether meeting was logged by student or advisor
- **Date Sorting**: Most recent meetings shown first
- **Full Details**: View notes, feedback, and meeting details

Access via:
- "Meeting History" button in Quick Actions
- "View Full Meeting History" link from "Past" tab in Meeting Management

#### C. Removed Auto-Missed Logic
- Deprecated `markOverdueMeetingsAsMissed()` function
- Removed automatic status changes from `useMeetings` hook
- All attendance status changes now require explicit advisor action

### 4. Database Schema

#### Meeting Document Fields
```javascript
{
  status: string,              // 'pending-review' | 'attended' | 'missed' | 'scheduled' | 'cancelled'
  attendanceMarked: boolean,   // true after advisor confirms attendance
  studentSelfReported: boolean, // true if logged by student
  source: string,              // 'manual' | 'advisor-manual' | 'calendly'
  attendanceMarkedAt: timestamp, // when advisor confirmed
  attendanceNotes: string,     // advisor notes about attendance
  overriddenBy: string,        // if advisor logged meeting for same date
  // ... other fields
}
```

### 5. User Experience Changes

#### For Students
- Log meetings with simple date picker
- Meetings appear in "Pending Review" state
- Can see when advisor has confirmed attendance
- No more automatic "missed" status on past meetings

#### For Advisors
- **Needs Attention Tab**: All student-logged meetings requiring review
- **Past Tab**: Only confirmed meetings (attendanceMarked=true)
- **Meeting History**: Full historical view with powerful filtering
- **Inline Editing**: Quick status updates for any past meeting
- **Clear Indicators**: 
  - "Student Logged" badge for student entries
  - "Advisor Logged" badge for advisor entries
  - "Pending Review" status for unconfirmed meetings

### 6. Migration Notes

#### Backward Compatibility
The system maintains full backward compatibility:
- Existing 'completed' meetings display as "Attended"
- Existing 'no-show' meetings display as "Missed"
- Legacy 'scheduled' meetings with `studentSelfReported=true` appear in "Needs Attention"

#### Data Migration (Optional)
If you want to update existing data to use new statuses:
```javascript
// Convert old statuses to new ones
completed → attended
no-show → missed
scheduled (with studentSelfReported=true) → pending-review
```

### 7. Testing

All changes are covered by unit tests in `meetingsService.test.js`:
- ✅ getMeetingsNeedingAttention shows all pending-review meetings
- ✅ No automatic status changes (markOverdueMeetingsAsMissed deprecated)
- ✅ Attendance counts work with new statuses
- ✅ Legacy statuses handled correctly
- ✅ Advisor meeting logging uses new 'attended' status

Build and tests pass successfully.

### 8. Files Changed

#### Core Services
- `src/services/meetingsService.js` - Updated status logic and workflow
- `src/services/meetingsService.test.js` - Updated tests for new behavior
- `src/hooks/useMeetings.js` - Removed auto-missed logic

#### Components
- `src/components/student/MeetingCreateModal.jsx` - Use 'pending-review' status
- `src/components/advisor/AdvisorMeetingsPanel.jsx` - Updated status display and filtering
- `src/components/advisor/MeetingHistoryPanel.jsx` - NEW: Comprehensive history view
- `src/pages/AdvisorDashboard.js` - Integrated Meeting History panel

### 9. Future Enhancements

Potential improvements for future versions:
1. Email notifications to advisors when students log meetings
2. Bulk attendance marking for multiple meetings
3. Meeting attendance reports and analytics
4. Calendar integration for automatic meeting detection
5. Student notifications when attendance is confirmed

## Support

For issues or questions about the new attendance tracking system, please refer to:
- This documentation
- Unit tests in `meetingsService.test.js`
- Inline code comments in the affected files
