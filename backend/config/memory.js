// Simple in-memory demo data for development without a database

export const memoryCourses = [
  {
    id: 'course-1',
    title: 'Intro to Web Development',
    description: 'Learn HTML, CSS, and basic JavaScript to build modern websites.',
    category: 'Programming',
    level: 'beginner',
    price: 0,
    duration_weeks: 4,
    instructor: { id: 'instructor-1', first_name: 'Alex', last_name: 'Johnson', email: 'alex@example.com' },
    enrollments: [],
    is_active: true,
  },
  {
    id: 'course-2',
    title: 'React Fundamentals',
    description: 'A practical guide to building interactive UIs with React.',
    category: 'Programming',
    level: 'intermediate',
    price: 49,
    duration_weeks: 6,
    instructor: { id: 'instructor-2', first_name: 'Priya', last_name: 'Sharma', email: 'priya@example.com' },
    enrollments: [],
    is_active: true,
  },
  {
    id: 'course-3',
    title: 'Node.js APIs with Express',
    description: 'Build secure, production-ready REST APIs using Express.',
    category: 'Programming',
    level: 'advanced',
    price: 79,
    duration_weeks: 8,
    instructor: { id: 'instructor-3', first_name: 'Diego', last_name: 'Martinez', email: 'diego@example.com' },
    enrollments: [],
    is_active: true,
  },
  {
    id: 'course-4',
    title: 'Technical English for Engineers',
    description: 'Improve technical communication: reports, presentations, and documentation for B.Tech.',
    category: 'English',
    level: 'beginner',
    price: 0,
    duration_weeks: 4,
    instructor: { id: 'instructor-4', first_name: 'Maya', last_name: 'Verma', email: 'maya@example.com' },
    enrollments: [],
    is_active: true,
  },
  {
    id: 'course-5',
    title: 'Data Structures & Algorithms (C++)',
    description: 'Master DSA for interviews and competitive programming using C++.',
    category: 'Programming',
    level: 'intermediate',
    price: 59,
    duration_weeks: 8,
    instructor: { id: 'instructor-5', first_name: 'Sanjay', last_name: 'Kumar', email: 'sanjay@example.com' },
    enrollments: [],
    is_active: true,
  },
  {
    id: 'course-6',
    title: 'Python for Data Science',
    description: 'NumPy, Pandas, Matplotlib, and basic ML workflows for B.Tech students.',
    category: 'Programming',
    level: 'beginner',
    price: 39,
    duration_weeks: 6,
    instructor: { id: 'instructor-6', first_name: 'Anita', last_name: 'Gupta', email: 'anita@example.com' },
    enrollments: [],
    is_active: true,
  },
];

// Minimal assignment samples keyed by course id
export const memoryAssignments = {
  'course-1': [
    { id: 'a1', title: 'Build a Personal Page', description: 'HTML/CSS basics', course_id: 'course-1', due_date: new Date(Date.now()+7*864e5).toISOString(), max_points: 100 },
  ],
  'course-2': [
    { id: 'a2', title: 'Todo App', description: 'React components and state', course_id: 'course-2', due_date: new Date(Date.now()+10*864e5).toISOString(), max_points: 100 },
  ],
};

// Minimal discussions per course
export const memoryDiscussions = {
  'course-2': [
    { id: 'd1', title: 'Hooks vs Class Components', content: 'What do you prefer?', course_id: 'course-2', author: { id: 'instructor-2', first_name: 'Priya', last_name: 'Sharma' }, replies: [] },
  ],
};

export const useMemoryStore = true;




