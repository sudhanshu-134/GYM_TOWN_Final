# Gym Website with Supabase Integration

This project is a gym management website with Supabase as the backend database solution.

## Setup

### Prerequisites
- Node.js (v14 or later)
- npm or yarn
- Supabase account (free tier is sufficient)

### Environment Variables
Create `.env` file in the root directory with the following:
```
url=https://uyeysqwrhyufyoqahcph.supabase.co
api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5ZXlzcXdyaHl1ZnlvcWFoY3BoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0ODQzNDksImV4cCI6MjA2MTA2MDM0OX0.E1GD9UqH6ty3xBt0OWPy_-Hefb8xInXl0316cAS8TOQ
```

### Installation

1. Install server dependencies:
   ```
   cd server
   npm install
   ```

2. Install client dependencies:
   ```
   cd client
   npm install
   ```

### Database Setup

1. Create a new project in Supabase dashboard
2. Copy the SQL code from `sql/database_setup.sql` and run it in the Supabase SQL Editor
3. This will create all necessary tables, triggers, stored procedures, and security policies

### Running the Application

1. Start the server:
   ```
   cd server
   npm run dev
   ```

2. Start the client:
   ```
   cd client
   npm run dev
   ```

## Supabase Integration

### Server-side Usage

The server provides a complete API for Supabase operations:

- GET `/api/supabase/:table` - Fetch all items from a table
- GET `/api/supabase/:table/:id` - Fetch a specific item by ID
- POST `/api/supabase/:table` - Create a new item
- PUT `/api/supabase/:table/:id` - Update an item
- DELETE `/api/supabase/:table/:id` - Delete an item

### Client-side Usage

You can use Supabase directly from the client using the provided utility functions:

```javascript
import { fetchAll, fetchById, createItem, updateItem, deleteItem } from './utils/supabase';

// Example: Fetch all workouts
const workouts = await fetchAll('workouts');

// Example: Create a new member
const newMember = await createItem('members', {
  name: 'John Doe',
  email: 'john@example.com',
  membership_type: 'premium'
});

// Example: Update a member
const updatedMember = await updateItem('members', 123, {
  membership_type: 'basic'
});

// Example: Delete a member
await deleteItem('members', 123);
```

### Advanced SQL Queries

For more complex queries, you can use the Supabase SQL API directly or use the provided helper functions in `client/utils/supabaseQueries.js`:

```javascript
import { getMembersWithAttendanceCounts, getWorkoutsOrderedByCalories } from './utils/supabaseQueries';

// Get all members with their attendance counts
const membersWithCounts = await getMembersWithAttendanceCounts();

// Get workouts ordered by calories burned (highest first)
const highCalorieWorkouts = await getWorkoutsOrderedByCalories(5); // limit to top 5
```

The project also includes many pre-written SQL queries in `sql/common_queries.sql` that you can run directly in the Supabase SQL Editor.

## Database Schema

The database has the following tables:

### Members
- id (UUID)
- name (text)
- email (text, unique)
- phone (text)
- membership_type (text: 'basic', 'premium', 'vip')
- join_date (timestamp)
- status (text: 'active', 'inactive', 'suspended')
- created_at (timestamp)
- updated_at (timestamp)

### Workouts
- id (UUID)
- name (text)
- description (text)
- difficulty (text: 'beginner', 'intermediate', 'advanced', 'expert')
- duration (integer)
- calories_burned (integer)
- created_at (timestamp)
- updated_at (timestamp)

### Diet Plans
- id (UUID)
- name (text)
- description (text)
- calories (integer)
- protein (integer)
- carbs (integer)
- fat (integer)
- created_at (timestamp)
- updated_at (timestamp)

### Attendance
- id (UUID)
- member_id (UUID, foreign key)
- member_name (text)
- check_in_time (timestamp)
- check_out_time (timestamp)
- created_at (timestamp)
- updated_at (timestamp)

### Additional Tables
- member_workout_plans
- member_diet_plans
- payments
- fitness_progress

## Advanced Features

### Custom React Hooks for Supabase

The project includes custom React hooks to simplify working with Supabase:

```javascript
import { 
  useSupabaseQuery, 
  useSupabaseCrud,
  useSupabaseForm,
  useSupabaseSubscription
} from './utils/supabaseHooks';

// Query hook with filtering and sorting
const { data, error, loading, refetch } = useSupabaseQuery('workouts', {
  orderBy: { column: 'calories_burned', ascending: false },
  limit: 10
});

// CRUD operations hook
const { create, read, readAll, update, remove } = useSupabaseCrud('members');

// Form handling with Supabase
const { formData, handleChange, handleSubmit } = useSupabaseForm('diet_plans');

// Real-time subscriptions
const { data } = useSupabaseSubscription('attendance');
```

### Row-Level Security (RLS)

The database is configured with Row-Level Security policies to ensure that:

1. Members can only view their own data
2. Admins have full access to all data
3. Public data (like workouts and diet plans) is accessible to all authenticated users

### Stored Procedures

The database includes the following stored procedures:

1. `calculate_average_gym_time()` - Calculate average gym session duration
2. `get_member_signups_by_month()` - Get signup statistics by month
3. `get_gym_usage_by_day_of_week()` - Get gym usage by day of week
4. `get_peak_gym_hours()` - Find the busiest hours at the gym
5. `register_new_member()` - Register a new member with default settings
6. `record_gym_session()` - Record a complete gym session
7. `get_member_fitness_stats()` - Get comprehensive fitness stats for a member

## Security Note

The API key included in this setup is an anonymous key with restricted permissions. For production, set up proper Row Level Security in Supabase and use the provided Row Level Security policies. 