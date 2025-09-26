export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'instructor' | 'admin';
  createdAt: string;
  lastLogin?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  duration_weeks: number;
  instructor: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  is_active: boolean;
  created_at: string;
  enrollments?: { count: number }[];
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  course_id: string;
  due_date: string;
  max_points: number;
  created_at: string;
  submissions?: AssignmentSubmission[];
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  content: string;
  submitted_at: string;
  grade?: number;
  feedback?: string;
  status: 'submitted' | 'graded';
  student?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface Discussion {
  id: string;
  title: string;
  content: string;
  course_id: string;
  author_id: string;
  created_at: string;
  author: {
    id: string;
    first_name: string;
    last_name: string;
  };
  replies?: DiscussionReply[];
}

export interface DiscussionReply {
  id: string;
  discussion_id: string;
  content: string;
  author_id: string;
  created_at: string;
  author: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}