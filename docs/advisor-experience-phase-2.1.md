# Advisor Experience Phase 2.1 Documentation

## Overview

Phase 2.1 introduces multi-pathway advisor support and the Important Dates feature, transitioning from a single-pathway system to a flexible many-to-many relationship between advisors and pathways.

## Key Features Implemented

### 1. Multi-Pathway Advisor Support

#### Database Schema Changes
- **New table: `advisor_pathways`**
  - `advisor_id` (string): Foreign key to users collection
  - `pathway` (string): Pathway name
  - `created_at` (timestamp): Creation timestamp
  - **Unique composite index**: `(advisor_id, pathway)`

#### Migration Strategy
- Legacy `pathway` field in users collection is preserved for backward compatibility
- New `migrateAdvisorPathwaysData()` function migrates existing single pathway data to join table
- First pathway in multi-selection is stored in legacy field for compatibility

#### Functions Added
- `addAdvisorPathway(advisorId, pathway)`: Add pathway to advisor
- `removeAdvisorPathway(advisorId, pathway)`: Remove pathway from advisor
- `getAdvisorPathways(advisorId)`: Get all pathways for advisor
- `setAdvisorPathways(advisorId, pathways[])`: Replace all pathways for advisor
- `getAdvisorsByPathwaysWithOverlap(studentPathways[])`: Find advisors with ANY overlap
- `migrateAdvisorPathwaysData()`: Migrate legacy data

### 2. Important Dates Feature

#### Database Schema
- **New table: `advisor_important_dates`**
  - `id` (string): Document ID
  - `advisor_id` (string): Foreign key to users collection
  - `title` (string): Event title
  - `description` (string, nullable): Event description
  - `date` (string): Date in YYYY-MM-DD format (all-day events)
  - `created_at` (timestamp): Creation timestamp
  - `updated_at` (timestamp): Last update timestamp
  - **Index**: `(advisor_id, date)` for efficient queries

#### Access Control
- **Advisors**: Full CRUD access to their own dates only
- **Students**: Read-only access to dates from assigned advisors
- **Admins**: Full access (implicit through advisor functions)

#### Functions Added
- `createAdvisorImportantDate(advisorId, dateData)`: Create new date
- `updateAdvisorImportantDate(dateId, updates)`: Update existing date
- `deleteAdvisorImportantDate(dateId)`: Delete date
- `getAdvisorImportantDates(advisorId)`: Get advisor's dates
- `getUpcomingImportantDatesForAdvisors(advisorNames[])`: Aggregate for students

### 3. Enhanced Onboarding Experience

#### Advisor Onboarding
- Multi-pathway checkbox selection
- Validation: At least one pathway required
- Data saved to both legacy field and join table

#### Student Onboarding
- Enhanced advisor selection with visual cards
- Pathway badges showing advisor specializations
- Overlap count indicators (e.g., "2 matches")
- Advisors ranked by pathway overlap count (descending)
- ANY overlap logic instead of exact match

### 4. Student Dashboard Integration

#### Important Dates Display
- Shows upcoming dates from all assigned advisors
- Merges and deduplicates dates from multiple advisors
- Sorted chronologically (ascending)
- No dismissal/hide functionality (always visible)
- Graceful handling of multi-advisor scenarios

### 5. Advisor Experience Changes

#### Removed Features
- "Schedule Meetings" button removed from advisor dashboard
- No meeting creation capabilities for advisors
- Students retain full meeting scheduling functionality

## Technical Implementation

### Database Migrations

#### Running Migration
```javascript
import { migrateAdvisorPathwaysData } from './services/firebase';

// Run once to migrate existing data
const results = await migrateAdvisorPathwaysData();
console.log(`Migrated: ${results.migrated}, Skipped: ${results.skipped}`);
```

#### Rollback Strategy
To rollback to single-pathway system:
1. Drop `advisor_pathways` collection
2. Drop `advisor_important_dates` collection  
3. Restore original onboarding form
4. Restore original advisor selection logic
5. Remove multi-pathway functions from firebase.js

### Usage Examples

#### Multi-Pathway Management
```javascript
// Set multiple pathways for an advisor
await setAdvisorPathways('advisor-id', [
  'Entrepreneurship', 
  'Design & Fabrication'
]);

// Get advisors with ANY overlap
const advisors = await getAdvisorsByPathwaysWithOverlap([
  'Entrepreneurship', 
  'Applied Science'
]);
// Returns advisors sorted by overlap count
```

#### Important Dates Management
```javascript
// Create important date
const dateId = await createAdvisorImportantDate('advisor-id', {
  title: 'Midterm Presentations',
  description: 'All students present project progress',
  date: '2025-03-15'
});

// Get upcoming dates for student
const dates = await getUpcomingImportantDatesForAdvisors(['Dr. Smith']);
```

## Testing

### Test Coverage
- **Multi-pathway functions**: Structure and parameter validation
- **Important dates**: CRUD operations and access control
- **Onboarding**: Multi-pathway selection and advisor ranking
- **Integration**: Firebase function exports and basic validation

### Running Tests
```bash
npm test -- --passWithNoTests --watchAll=false
```

## Security Considerations

### Access Control
- Advisor important dates are scoped by `advisor_id`
- Students can only read dates from assigned advisors
- No cross-advisor data access
- Input validation on all date operations

### Data Integrity
- Unique composite index prevents duplicate advisor-pathway entries
- Date format validation (YYYY-MM-DD)
- Required field validation
- Timestamp consistency with `serverTimestamp()`

## Performance Considerations

### Database Optimization
- Indexes on frequently queried fields
- Batch operations for pathway management
- Efficient ANY overlap queries using `where('pathway', 'in', pathways)`
- Minimal data transfer with targeted queries

### Frontend Optimization
- Debounced pathway selection updates
- Cached advisor lookup results
- Lazy loading of important dates
- Optimistic UI updates

## Future Enhancements

### Multi-Advisor Support
The system is designed to support multiple advisors per student:
- `getUpcomingImportantDatesForAdvisors()` accepts array of advisor names
- Deduplication logic handles overlapping dates
- Database schema supports many-to-many relationships

### Admin Management
- Admin interface for managing advisor-pathway assignments
- Bulk migration tools
- Analytics on pathway distribution
- Important dates calendar view

## Troubleshooting

### Common Issues

#### Migration Problems
```javascript
// Check migration status
const advisors = await getAllUsers();
const advisorsWithPathways = advisors.filter(u => u.userType === 'advisor');
console.log('Advisors to migrate:', advisorsWithPathways.length);
```

#### Missing Important Dates
```javascript
// Verify advisor assignment
const student = await getUserProfile(studentId);
console.log('Assigned advisor:', student.advisor);

// Check advisor dates
const dates = await getAdvisorImportantDates(advisorId);
console.log('Advisor dates:', dates.length);
```

#### Advisor Selection Issues
```javascript
// Test overlap logic
const advisors = await getAdvisorsByPathwaysWithOverlap(['Entrepreneurship']);
console.log('Matching advisors:', advisors.map(a => ({
  name: a.name,
  pathways: a.pathways,
  overlap: a.overlapCount
})));
```

## Backward Compatibility

### Legacy Support
- Original `pathway` field maintained in users collection
- Existing single-pathway advisors continue to work
- Graceful fallback when join table is empty
- No breaking changes to existing student experience

### Deprecation Path
- Phase 3.0: Full multi-advisor student assignment
- Phase 4.0: Remove legacy pathway field
- Phase 5.0: Advanced calendar integration