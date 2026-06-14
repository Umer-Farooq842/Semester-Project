# University Planner Web Application
# Name : Umer Farooq
# Roll-No: F24BDOCS1MO1311
#
A complete, production-ready web application for students to manage and track their academic tasks, assignments, exams, projects, and study activities with an intuitive user interface and comprehensive admin panel.

## Project Overview

The University Planner is a capstone web application built with vanilla JavaScript, HTML5, Bootstrap 5, and JSON Server. It enables students to organize their academic workload effectively with features for task management, deadline tracking, completion status monitoring, and detailed statistics.

## Features

### User Dashboard (index.html)
- ✅ **Task Management**: Add, view, and manage academic tasks with detailed information
- ✅ **Task Categories**: Organize tasks into Assignments, Exams, Projects, and Study Tasks
- ✅ **Priority Levels**: Set priority as Low, Medium, or High for each task
- ✅ **Status Tracking**: Track task status (Pending, In Progress, Completed)
- ✅ **Advanced Filtering**: Filter tasks by course, category, priority, and status
- ✅ **Debounced Search**: Search across title, course, and description with 300ms debounce
- ✅ **Due Date Management**: Set and track due dates with overdue indicators
- ✅ **Form Validation**: Client-side validation with error messages (no alert() usage)
- ✅ **Responsive Design**: Fully responsive on mobile, tablet, and desktop devices
- ✅ **Loading States**: Visual spinner during data fetching
- ✅ **Error Handling**: User-friendly error messages
- ✅ **Success Notifications**: Confirmation messages on successful task creation
- ✅ **Auto Refresh**: Task list automatically updates after task creation

### Admin Panel (admin.html)
- ✅ **Comprehensive Dashboard**: Complete view of all tasks with statistics
- ✅ **Statistics Section**: 
  - Total number of tasks
  - Completed tasks count
  - Pending tasks count
  - High priority tasks count
  - Completion percentage with visual progress bar
- ✅ **Full CRUD Operations**:
  - View all tasks in a data table
  - Edit task details inline
  - Update tasks with PATCH requests
  - Delete tasks with confirmation modal
- ✅ **Admin Search**: Quick search across multiple fields
- ✅ **Confirmation Modals**: Prevent accidental deletions
- ✅ **Admin Styling**: Distinct admin navbar (danger red) with clear ADMIN label
- ✅ **Responsive Tables**: Clean, sortable task table with action buttons
- ✅ **Real-time Updates**: All statistics update instantly after operations

## Technologies Used

### Frontend
- **HTML5**: Semantic markup and forms
- **Bootstrap 5**: Responsive grid system, components (cards, tables, forms, alerts, modals)
- **Plain JavaScript (ES6+)**: No frameworks or libraries except Bootstrap
  - Async/Await for asynchronous operations
  - Fetch API for HTTP requests
  - Try/Catch for error handling
  - ES6 features (arrow functions, template literals, destructuring)

### Backend
- **JSON Server**: Lightweight local REST API server
- **JSON Database**: File-based db.json with 20 sample task records

### HTTP Methods
- `GET` - Retrieve all tasks
- `POST` - Create new tasks
- `PATCH` - Update existing tasks
- `DELETE` - Remove tasks

## Project Structure

```
webproject/
├── index.html          # User dashboard
├── admin.html          # Admin control panel
├── app.js              # User-side JavaScript logic
├── admin.js            # Admin-side JavaScript logic
├── style.css           # Custom styling and responsive design
├── db.json             # JSON Server database with sample data
└── README.md           # Project documentation
```

## Installation & Setup

### Prerequisites
- Node.js and npm installed
- A modern web browser (Chrome, Firefox, Edge, Safari)

### Step 1: Install JSON Server
```bash
npm install -g json-server
```

### Step 2: Navigate to Project Directory
```bash
cd c:\Users\DELL\Desktop\webproject
```

### Step 3: Start JSON Server
Open a terminal and run:
```bash
npx json-server --watch db.json
```

The server will start on `http://localhost:3000`

**Expected output:**
```
  ✔ Server is running
  ✔ Now serving db.json
  ✔ Resources: http://localhost:3000
  ✔ Homepage: http://localhost:3000
  ✔ Type s + enter at any time to create a snapshot of the state
```

### Step 4: Open Application
Open your browser and navigate to:
```
file:///c:/Users/DELL/Desktop/webproject/index.html
```

Or for admin panel:
```
file:///c:/Users/DELL/Desktop/webproject/admin.html
```

## Usage Guide

### User Dashboard

#### Adding a Task
1. Fill out all fields in the "Add New Task" form
2. Minimum 6 fields required:
   - **Title**: Task name (min 3 characters)
   - **Course**: Course code (e.g., CS101, MATH150)
   - **Category**: Choose from Assignment, Exam, Project, Study Task
   - **Priority**: Select Low, Medium, or High
   - **Due Date**: Must be a future date
   - **Description**: Task details (min 5 characters)
3. Click "Add Task" button
4. Success message confirms task creation
5. Task list automatically refreshes

#### Filtering & Searching
- **Search Box**: Type to search by title, course, or category (300ms debounce)
- **Course Filter**: Filter by specific course
- **Category Filter**: Filter by task type
- **Priority Filter**: Filter by priority level
- **Status Filter**: Filter by completion status
- **Reset Button**: Clear all filters and search

### Admin Panel

#### Viewing Statistics
- Dashboard displays 4 key statistics cards
- Completion progress bar shows percentage of completed tasks
- Statistics update in real-time after any operation

#### Editing a Task
1. Locate the task in the table
2. Click the "Edit" button
3. Form loads with task details on the right
4. Modify any fields
5. Click "Update Task" to save changes
6. Success message confirms update

#### Deleting a Task
1. Locate the task in the table
2. Click the "Delete" button
3. Confirmation modal appears
4. Review task title
5. Click "Delete Task" to confirm or "Cancel" to abort
6. Success message confirms deletion

#### Searching Tasks
1. Enter search term in the search box
2. Search across title, course, and category
3. Click "Search" button or press Enter
4. Results update in real-time
5. Leave empty and search again to see all tasks

## API Endpoints

Base URL: `http://localhost:3000`

### Tasks Resource

#### Get All Tasks
```http
GET /tasks
```
**Response**: Array of all task objects

#### Get Single Task
```http
GET /tasks/{id}
```
**Response**: Single task object

#### Create Task
```http
POST /tasks
Content-Type: application/json

{
  "title": "Complete Assignment",
  "course": "CS101",
  "category": "assignment",
  "priority": "high",
  "dueDate": "2026-06-20",
  "status": "pending",
  "description": "Complete data structures assignment",
  "createdAt": "2026-06-14"
}
```
**Response**: Created task object with assigned ID

#### Update Task (PATCH)
```http
PATCH /tasks/{id}
Content-Type: application/json

{
  "status": "in-progress",
  "priority": "medium"
}
```
**Response**: Updated task object

#### Delete Task
```http
DELETE /tasks/{id}
```
**Response**: Empty response (204 status)

## Database Schema

### Task Object
```json
{
  "id": 1,
  "title": "String (required, min 3 chars)",
  "course": "String (required)",
  "category": "String (assignment|exam|project|study)",
  "priority": "String (low|medium|high)",
  "dueDate": "String (YYYY-MM-DD format, required)",
  "status": "String (pending|in-progress|completed)",
  "description": "String (required, min 5 chars)",
  "createdAt": "String (YYYY-MM-DD format)"
}
```

### Sample Data
The db.json file includes 20 realistic sample tasks across various courses (CS, WEB, DB, MATH, PHY, ENG, CHEM, HIST, MOB, STAT, BUS, DS, NET, ART) with varied:
- Categories (assignments, exams, projects, study tasks)
- Priorities (low, medium, high)
- Due dates (ranging from current to future dates)
- Statuses (pending, in-progress, completed)

## Features Implementation Details

### Form Validation (No Alerts)
- Errors display inline below input fields in red text
- Real-time validation feedback
- Clear, specific error messages
- Form prevents submission with invalid data

### Loading State
- Spinner animation shows during fetch operations
- Main content hidden while loading
- Professional UX with visual feedback

### Error Handling
- Server connection errors handled gracefully
- User-friendly error messages
- Try/Catch blocks for all async operations
- Response.ok validation for all fetch requests

### Success Notifications
- Toast-like alerts that auto-dismiss after 5 seconds
- Color-coded by type (success, error, warning, info)
- Closeable with dismiss button

### Debounced Search
- 300ms debounce prevents excessive filtering
- Smooth search experience
- Optimized performance on large datasets

### Responsive Bootstrap Grid
- Mobile-first approach
- Breakpoints: xs, sm (576px), md (768px), lg (992px), xl (1200px)
- Cards collapse appropriately on smaller screens
- Tables become scrollable on mobile

### Security Considerations
- HTML escaping prevents XSS attacks
- No sensitive data in localStorage
- Server-side validation recommended for production
- CORS considerations for different domains

## Browser Compatibility

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+
✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Screenshots Section

### User Dashboard
- Clean task cards with color-coded priority badges
- Advanced filter section with real-time updates
- Add task form with inline validation
- Responsive grid layout

### Admin Panel
- Statistics dashboard with 4 key metrics
- Completion progress bar with percentage
- Full-width task management table
- Edit form for inline task modifications
- Delete confirmation modal

## Code Quality Features

✅ **Modular Functions**: Organized functions for different concerns
✅ **Error Handling**: Try/Catch blocks throughout
✅ **Code Comments**: Clear comments explaining key sections
✅ **Consistent Naming**: CamelCase for variables, PascalCase for classes
✅ **DRY Principle**: Reusable utility functions
✅ **Performance**: Debounced search, optimized DOM manipulation
✅ **Accessibility**: Semantic HTML, ARIA labels where needed
✅ **Responsive**: Mobile-first, Bootstrap 5 grid system

## Reusable Functions

### User App (app.js)
- `fetchTasks()` - GET tasks from server
- `addTask(taskData)` - POST new task
- `renderTasks(tasks)` - Display tasks as cards
- `filterTasks()` - Apply active filters
- `validateForm(formData)` - Validate form inputs
- `showLoading()` / `hideLoading()` - Manage loading state
- `showSuccess()` / `showError()` - Display notifications
- `debounceSearch(callback, delay)` - Debounce search input

### Admin App (admin.js)
- `fetchTasks()` - GET all tasks
- `updateTask(taskId, data)` - PATCH task
- `deleteTask(taskId)` - DELETE task
- `renderTasksTable(tasks)` - Display tasks in table
- `loadTaskForEditing(taskId)` - Load task into edit form
- `updateStatistics()` - Calculate and display stats
- `performSearch()` - Search and filter tasks

## Production Deployment Recommendations

1. **Use a proper backend**: Replace JSON Server with Node.js/Express or similar
2. **Add authentication**: Implement user login and authorization
3. **Database migration**: Move from JSON file to SQL/NoSQL database
4. **Environment variables**: Store API URLs in .env files
5. **HTTPS**: Ensure secure data transmission
6. **Rate limiting**: Protect API from abuse
7. **Input validation**: Implement server-side validation
8. **Logging**: Add comprehensive error logging
9. **Caching**: Implement browser and server-side caching
10. **Testing**: Add unit and integration tests

## Future Improvements

- **User Authentication**: Login system with user-specific task lists
- **Task Reminders**: Email or browser notifications for upcoming due dates
- **Recurring Tasks**: Support for repeating tasks
- **File Attachments**: Upload files/documents related to tasks
- **Calendar View**: Visual calendar display of tasks
- **Task Comments**: Add comments and notes to tasks
- **Collaboration**: Share tasks with classmates or teachers
- **Export Features**: Export tasks to CSV or PDF
- **Dark Mode**: Theme toggle for dark mode
- **Task Templates**: Save and reuse task templates
- **Analytics**: Detailed progress analytics and reports
- **Mobile App**: Native iOS/Android applications
- **Offline Support**: Service workers for offline functionality
- **Task Dependencies**: Link related tasks
- **Custom Categories**: User-defined task categories
- **Time Tracking**: Track time spent on tasks
- **Grade Integration**: Link tasks to course grades

## Troubleshooting

### Issue: "Cannot fetch tasks" error
**Solution**: Make sure JSON Server is running on `http://localhost:3000`
```bash
npx json-server --watch db.json
```

### Issue: Tasks not saving
**Solution**: 
- Check browser console for errors (F12)
- Ensure JSON Server is running
- Verify db.json is writable

### Issue: Filters not working
**Solution**: 
- Refresh the page
- Check that tasks have the filter values
- Try resetting filters first

### Issue: Form validation not showing
**Solution**: 
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check that style.css is loaded

### Issue: Admin panel showing old data
**Solution**: 
- Click refresh in browser
- Stop and restart JSON Server
- Clear localStorage if applicable

## Support & Questions

For issues or questions about the application:
1. Check the troubleshooting section above
2. Review the console for error messages (F12)
3. Verify JSON Server is running correctly
4. Ensure all files are in the correct directory

## License

This project is created as a capstone assignment and is for educational purposes only.

## Version

**Version**: 1.0.0
**Last Updated**: June 2026
**Status**: Production Ready

---

**Created by**: University Planner Development Team
**Capstone Project**: Full Stack Web Development
**Tech Stack**: HTML5 • Bootstrap 5 • Vanilla JavaScript • JSON Server