# Important Dates Advisor Scope Implementation

## Overview

This document describes the implementation of advisor-scoped important dates with backward compatibility for existing global dates.

## Data Model

### Important Dates Collection

The `importantDates` collection now supports both global and advisor-specific dates through an optional `advisorId` field:

```javascript
{
  id: "doc_id",
  title: "Event Title",
  description: "Optional description",
  date: "2025-03-15", // YYYY-MM-DD format
  location: "Optional location",
  advisorId: "advisor_user_id" | null, // null = global date
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Backward Compatibility

- **Legacy Documents**: Existing documents without `advisorId` field are treated as global dates
- **Global Dates**: Documents with `advisorId: null` are visible to all students
- **Advisor-Specific Dates**: Documents with `advisorId: "user_id"` are visible only to students assigned to that advisor

## Access Control

### Firestore Security Rules

```javascript
// Important dates access control
match /importantDates/{dateId} {
  allow read: if isSignedIn() && (isAdmin() || hasAdvisor(resource.data.advisorId));
  allow create: if isAdmin() || (isAdvisor() && request.resource.data.advisorId == request.auth.uid);
  allow update, delete: if isAdmin() || (isAdvisor() && resource.data.advisorId == request.auth.uid);
}
```

### Permission Matrix

| Role | Global Dates | Own Advisor Dates | Other Advisor Dates |
|------|-------------|------------------|-------------------|
| **Admin** | Full CRUD | Full CRUD | Full CRUD |
| **Advisor** | Read only | Full CRUD | No access |
| **Student** | Read only | Read only (if assigned) | No access |

## API Functions

### Core Functions

#### `createImportantDate(dateData, advisorId = null)`
Creates a new important date with optional advisor scope.

```javascript
// Create global date (admin)
await createImportantDate({
  title: "Final Presentations",
  description: "All students present projects",
  date: "2025-05-15"
}, null);

// Create advisor-specific date
await createImportantDate({
  title: "Entrepreneurship Workshop",
  description: "For entrepreneurship track students",
  date: "2025-04-10"
}, "advisor_user_id");
```

#### `getAdvisorImportantDates(advisorId)`
Gets all important dates for a specific advisor.

```javascript
const dates = await getAdvisorImportantDates("advisor_user_id");
// Returns dates where advisorId === "advisor_user_id"
```

#### `getImportantDatesForAdvisors(advisorIds[])`
Gets important dates for multiple advisors plus global dates, with automatic batching for Firestore 'in' limit.

```javascript
const dates = await getImportantDatesForAdvisors(["advisor1", "advisor2"]);
// Returns:
// - All dates where advisorId === "advisor1"
// - All dates where advisorId === "advisor2" 
// - All global dates (advisorId === null)
// - Automatically handles >10 advisor batching
// - Sorted by date, no duplicates
```

#### `getAllImportantDates()` (Admin only)
Gets all important dates regardless of scope.

## UI Components

### Reusable Manager Component

`src/components/dates/ImportantDatesManager.js` provides shared functionality:

- **Admin Mode**: Shows all dates with scope indicators (global vs advisor-specific)
- **Advisor Mode**: Shows only advisor's own dates and global dates
- **Inline Form**: Create/edit dates with appropriate scope controls

### Advisor UI

`src/components/advisor/AdvisorImportantDates.js`:
- Uses ImportantDatesManager in 'advisor' mode
- Automatically sets advisorId to current user for new dates
- Shows only dates created by the advisor

### Student Dashboard Panel

`src/components/student/DashboardImportantDatesPanel.js`:
- Shows up to 6 upcoming dates
- Filters to assigned advisor(s) plus global dates
- Compact dashboard-friendly layout

## Student Assignment Logic

### Current Implementation
Students are assigned via `userProfile.advisor` (advisor name string):

```javascript
// Get student's advisor ID
const advisor = await getAdvisorByName(userProfile.advisor);
const advisorIds = advisor ? [advisor.id] : [];

// Get filtered dates
const dates = await getImportantDatesForAdvisors(advisorIds);
```

### Future Multi-Advisor Support
Code is prepared for `userProfile.advisors` array:

```javascript
let advisorIds = [];
if (userProfile.advisor) {
  // Single advisor (current)
  const advisor = await getAdvisorByName(userProfile.advisor);
  if (advisor) advisorIds.push(advisor.id);
}
if (userProfile.advisors) {
  // Multiple advisors (future)
  advisorIds = [...advisorIds, ...userProfile.advisors];
}
```

## Migration Strategy

### Backward Compatibility Approach
1. **No Breaking Changes**: Existing global dates continue to work
2. **Gradual Migration**: New dates can be advisor-specific
3. **Legacy Support**: Documents without `advisorId` treated as global

### Optional Data Cleanup
To explicitly mark legacy documents as global:

```javascript
// One-time migration script (optional)
const batch = writeBatch(db);
const globalDates = await getDocs(
  query(collection(db, 'importantDates'), where('advisorId', '==', undefined))
);

globalDates.docs.forEach(doc => {
  batch.update(doc.ref, { advisorId: null });
});

await batch.commit();
```

## Testing Strategy

### Unit Tests
Focus on data access functions:

```javascript
// Test advisor-specific filtering
test('getAdvisorImportantDates filters correctly', async () => {
  // Setup test data
  // Verify only advisor's dates returned
});

// Test multi-advisor batching
test('getImportantDatesForAdvisors handles >10 advisors', async () => {
  // Test with 15 advisor IDs
  // Verify batching works correctly
});

// Test global date inclusion
test('global dates included for all students', async () => {
  // Verify null advisorId dates always included
});
```

### Integration Tests
Test complete workflows:
- Advisor creates date → Student sees it
- Admin creates global date → All students see it
- Advisor edits own date → Changes reflected for assigned students

## Performance Considerations

### Firestore Query Optimization
- **Composite Index**: `(advisorId, date)` for efficient advisor-specific queries
- **Batching**: Automatic handling of 10+ advisor queries
- **Caching**: Results cached at component level to reduce queries

### Query Patterns
```javascript
// Efficient: Single advisor query
collection('importantDates').where('advisorId', '==', 'advisor_id').orderBy('date')

// Efficient: Global dates query  
collection('importantDates').where('advisorId', '==', null).orderBy('date')

// Efficient: Batched multi-advisor queries
collection('importantDates').where('advisorId', 'in', batch).orderBy('date')
```

## Security Considerations

### Access Control
- **Advisor Isolation**: Advisors cannot access other advisors' dates
- **Student Filtering**: Students only see assigned advisor dates + global
- **Admin Override**: Admins maintain full access for management

### Data Validation
- **Required Fields**: Title and date are required
- **Date Format**: YYYY-MM-DD format enforced
- **Advisor ID**: Must be valid user ID or null

## Future Enhancements

### Phase 2 Improvements
- **Real-time Updates**: Add Firestore listeners for live updates
- **Calendar Integration**: Export to Google Calendar, iCal
- **Notification System**: Email/push notifications for upcoming dates
- **Bulk Operations**: Import/export date sets

### Multi-Advisor Support
- **Student Assignment**: Support `userProfile.advisors` array
- **Shared Dates**: Dates visible to multiple advisor groups
- **Permission Inheritance**: Complex advisor hierarchy support

## Troubleshooting

### Common Issues

#### Dates Not Showing for Students
1. Check student's advisor assignment: `userProfile.advisor`
2. Verify advisor exists: `getAdvisorByName(advisorName)`
3. Check date `advisorId` matches advisor ID or is null

#### Permission Denied Errors
1. Verify Firestore rules are deployed
2. Check user authentication status
3. Confirm user has `isAdvisor: true` flag

#### Missing Global Dates
1. Verify global dates have `advisorId: null` 
2. Check `getImportantDatesForAdvisors` includes null query
3. Ensure security rules allow global date access

### Debug Queries
```javascript
// Check what dates a student should see
const student = await getUserProfile(studentId);
const advisor = await getAdvisorByName(student.advisor);
const dates = await getImportantDatesForAdvisors(advisor ? [advisor.id] : []);
console.log('Student dates:', dates);

// Verify advisor's dates
const advisorDates = await getAdvisorImportantDates(advisorId);
console.log('Advisor dates:', advisorDates);

// Check global dates
const globalDates = await getImportantDatesForAdvisors([]);
console.log('Global dates:', globalDates);
```