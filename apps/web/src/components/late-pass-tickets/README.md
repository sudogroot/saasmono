# Late Pass Tickets Frontend Components

## Overview
Complete frontend implementation for the Late Pass Ticket system, following the same patterns as the attendances module with Arabic-first UI and shadcn/ui components.

## File Structure

```
/apps/web/src/
├── app/dashboard/late-pass-tickets/
│   ├── page.tsx                          # Main tickets list page
│   └── generate/
│       └── page.tsx                      # Generate new ticket page
└── components/late-pass-tickets/
    ├── late-pass-tickets-table.tsx       # Tickets list table component
    └── generate/
        ├── classroom-filter.tsx          # Classroom/group filter component
        ├── eligible-students-table.tsx   # Eligible students table
        └── timetable-selection-dialog.tsx # Timetable selection dialog
```

## Components

### 1. Main Tickets Page (`page.tsx`)
- **Location:** `/apps/web/src/app/dashboard/late-pass-tickets/page.tsx`
- **Purpose:** Main entry point for late pass tickets management
- **Features:**
  - Page title: "تذاكر الدخول"
  - Navigation to generate page
  - Renders LatePassTicketsTable component

### 2. Tickets Table (`late-pass-tickets-table.tsx`)
- **Location:** `/apps/web/src/components/late-pass-tickets/late-pass-tickets-table.tsx`
- **Purpose:** Display and manage all issued tickets
- **Features:**
  - GenericTable with mobile/desktop views
  - Columns: Ticket Number, Student, Timetable, Validity, Actions
  - Status badges: ISSUED (صادر), USED (مستخدم), EXPIRED (منتهي), CANCELED (ملغى)
  - Quick filters by status
  - Search functionality
  - Actions:
    - Download PDF
    - Cancel ticket (with reason prompt)
  - Mobile-responsive card view
  - ORPC query integration
  - Toast notifications for success/error

### 3. Generate Page (`generate/page.tsx`)
- **Location:** `/apps/web/src/app/dashboard/late-pass-tickets/generate/page.tsx`
- **Purpose:** Page for generating new tickets
- **Features:**
  - Title: "إصدار تذكرة الدخول "
  - Manages classroom/group selection state
  - Renders EligibleStudentsTable

### 4. Classroom Filter (`classroom-filter.tsx`)
- **Location:** `/apps/web/src/components/late-pass-tickets/generate/classroom-filter.tsx`
- **Purpose:** Filter students by classroom or classroom group
- **Features:**
  - Two-column layout (Classroom | Classroom Group)
  - Fetches classrooms and groups via ORPC
  - Mutual exclusion (selecting one clears the other)
  - Current selection display
  - Clear selection button
  - Icons: Building2 for classrooms, Users for groups

### 5. Eligible Students Table (`eligible-students-table.tsx`)
- **Location:** `/apps/web/src/components/late-pass-tickets/generate/eligible-students-table.tsx`
- **Purpose:** Display students eligible for late pass tickets
- **Features:**
  - GenericTable implementation
  - Requires classroom or group selection
  - Columns:
    - Student (name, email)
    - Last Attendance (status badge, timetable, date)
    - Upcoming Timetables count
    - Active Tickets count
    - Actions (Generate Ticket button)
  - Attendance status badges:
    - ABSENT (غائب) - red
    - EXCUSED (غياب بعذر) - yellow
    - SICK (مريض) - orange
  - Click student → Opens timetable selection dialog
  - Disabled state when no upcoming timetables
  - Empty states for no selection and no eligible students

### 6. Timetable Selection Dialog (`timetable-selection-dialog.tsx`)
- **Location:** `/apps/web/src/components/late-pass-tickets/generate/timetable-selection-dialog.tsx`
- **Purpose:** Select timetable and generate ticket
- **Features:**
  - Dialog/Modal component from shadcn/ui
  - Student info display
  - Upcoming timetables list with:
    - Title and subject
    - Date and time
    - Room and teacher
    - "Has Active Ticket" badge
    - "Can Generate Ticket" indicator (CheckCircle/XCircle)
  - Selection state (highlighted border)
  - Disabled timetables outside generation window
  - Generate ticket mutation
  - Success toast with PDF download action
  - Error handling

## Data Flow

### 1. Viewing Tickets
```
page.tsx → LatePassTicketsTable
  ↓
ORPC Query: getTickets()
  ↓
Display in GenericTable
  ↓
Actions: Download PDF, Cancel Ticket
```

### 2. Generating Tickets
```
generate/page.tsx → EligibleStudentsTable + ClassroomFilter
  ↓
Select Classroom/Group → ORPC Query: getEligibleStudents()
  ↓
Display Eligible Students
  ↓
Click Student → TimetableSelectionDialog
  ↓
ORPC Query: getStudentUpcomingTimetables()
  ↓
Select Timetable → ORPC Mutation: generateTicket()
  ↓
Success: Toast + PDF Download Option
```

## ORPC Endpoints Used

### Queries
- `orpc.management.latePassTickets.getTickets` - List all tickets
- `orpc.management.latePassTickets.getEligibleStudents` - Get eligible students by classroom/group
- `orpc.management.latePassTickets.getStudentUpcomingTimetables` - Get upcoming timetables for student
- `orpc.management.classroom.getClassroomsList` - Get all classrooms
- `orpc.management.classroom.getClassroomGroupsList` - Get all classroom groups

### Mutations
- `orpc.management.latePassTickets.generateTicket` - Generate new ticket
- `orpc.management.latePassTickets.cancelTicket` - Cancel existing ticket

## UX Features

### Arabic-First Design
- All text in Arabic
- RTL layout support
- Arabic date/time formatting

### Responsive Design
- Desktop: Full table view
- Mobile: Card-based view with condensed information
- Touch-friendly interactions

### Status Indicators
- Color-coded status badges
- Icons for different states
- Visual feedback for disabled states

### User Feedback
- Toast notifications (success/error)
- Loading states
- Empty states with helpful messages
- Inline validation messages

### Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation support
- Screen reader friendly

## Patterns Followed

All components follow the established patterns from the attendances module:

1. **GenericTable Usage:** Same table component with mobile/desktop views
2. **ORPC Integration:** Using `queryOptions()` and `mutationOptions()`
3. **State Management:** React Query for server state
4. **Form Handling:** Mutations with success/error callbacks
5. **UI Components:** shadcn/ui components (Button, Badge, Dialog, Card, etc.)
6. **Styling:** Tailwind CSS with logical properties for RTL
7. **Icons:** lucide-react icons
8. **Notifications:** sonner toast library

## Notes

- All TypeScript types are inferred from ORPC schemas
- Type assertions used where necessary (`as unknown as Type`)
- Mutations use `mutateAsync` for proper async handling
- Query invalidation handled automatically by ORPC
- Error boundaries handled by GenericTable component
- PDF downloads open in new window/tab
