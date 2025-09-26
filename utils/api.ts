import { Course, Assignment, Discussion } from '../types';

const API_BASE = '/api';

class ApiService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('lms_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data;
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data;
  }

  async put<T>(endpoint: string, body: any): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data;
  }

  async delete(endpoint: string): Promise<void> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
  }

  // Course methods
  async getCourses(): Promise<Course[]> {
    return this.get<Course[]>('/courses');
  }

  async createCourse(course: Partial<Course>): Promise<Course> {
    return this.post<Course>('/courses', course);
  }

  async enrollInCourse(courseId: string): Promise<any> {
    return this.post<any>(`/courses/${courseId}/enroll`, {});
  }

  // Assignment methods
  async getAssignments(courseId: string): Promise<Assignment[]> {
    return this.get<Assignment[]>(`/assignments/course/${courseId}`);
  }

  async createAssignment(assignment: Partial<Assignment>): Promise<Assignment> {
    return this.post<Assignment>('/assignments', assignment);
  }

  async submitAssignment(assignmentId: string, content: string): Promise<any> {
    return this.post<any>(`/assignments/${assignmentId}/submit`, { content });
  }

  // Discussion methods
  async getDiscussions(courseId: string): Promise<Discussion[]> {
    return this.get<Discussion[]>(`/discussions/course/${courseId}`);
  }

  async createDiscussion(discussion: Partial<Discussion>): Promise<Discussion> {
    return this.post<Discussion>('/discussions', discussion);
  }

  // User methods
  async getUserProfile(): Promise<any> {
    return this.get<any>('/users/profile');
  }

  async getDashboardStats(): Promise<any> {
    return this.get<any>('/users/dashboard');
  }
}

export const apiService = new ApiService();