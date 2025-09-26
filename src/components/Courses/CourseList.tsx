import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Clock, Star, Filter, Search } from 'lucide-react';
import { Course } from '../../types';
import { apiService } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';

const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const { user, isAuthenticated } = useAuth();
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [assignmentsOpen, setAssignmentsOpen] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [assignmentsCourseTitle, setAssignmentsCourseTitle] = useState('');

  useEffect(() => {
    loadCourses();
    loadEnrolled();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, selectedCategory, selectedLevel]);

  const loadCourses = async () => {
    try {
      const data = await apiService.getCourses();
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEnrolled = async () => {
    try {
      if (!isAuthenticated) return; // no token
      const data = await apiService.getEnrolledCourses();
      setEnrolledIds(new Set(data.map(c => c.id)));
    } catch (error) {
      // ignore silently for unauthenticated or API errors
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }

    setFilteredCourses(filtered);
  };

  const handleEnroll = async (courseId: string) => {
    try {
      if (!isAuthenticated) {
        setToast({ type: 'error', message: 'Please sign in as a student to enroll.' });
        return;
      }
      setEnrollingId(courseId);
      await apiService.enrollInCourse(courseId);
      setToast({ type: 'success', message: 'Enrolled successfully!' });
      setEnrolledIds(prev => new Set([...Array.from(prev), courseId]));
    } catch (error: any) {
      console.error('Error enrolling:', error);
      const message = error?.message || 'Failed to enroll. Please try again.';
      setToast({ type: 'error', message });
    }
    finally {
      setEnrollingId(null);
      setTimeout(() => setToast(null), 2500);
    }
  };

  const handleViewAssignments = async (course: any) => {
    try {
      if (!isAuthenticated) {
        setToast({ type: 'error', message: 'Please sign in to view assignments.' });
        return;
      }
      const list = await apiService.getAssignments(course.id);
      setAssignments(list);
      setAssignmentsCourseTitle(course.title);
      setAssignmentsOpen(true);
    } catch (error) {
      console.error('Error loading assignments:', error);
      setToast({ type: 'error', message: 'Failed to load assignments.' });
    } finally {
      setTimeout(() => setToast(null), 2500);
    }
  };

  const categories = [...new Set(courses.map(course => course.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-6">
      {toast && (
        <div className={`p-3 rounded-lg text-sm ${toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {toast.message}
        </div>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Available Courses</h1>
        <div className="text-sm text-gray-500">
          {filteredCourses.length} courses available
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedLevel('all');
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Course Image Placeholder */}
            <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-white opacity-80" />
              </div>
              <div className="absolute top-4 left-4">
                <span className={`
                  px-2 py-1 text-xs font-semibold rounded-full
                  ${course.level === 'beginner' ? 'bg-green-100 text-green-800' :
                    course.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'}
                `}>
                  {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">{course.description}</p>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span className="bg-gray-100 px-2 py-1 rounded-md">{course.category}</span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {course.enrollments?.length || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.duration_weeks}w
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">4.8</span>
                  <span className="text-sm text-gray-500">(124 reviews)</span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {course.price === 0 ? 'Free' : `$${course.price}`}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleEnroll(course.id)}
                    disabled={enrollingId === course.id || enrolledIds.has(course.id)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enrolledIds.has(course.id) ? 'Enrolled' : (enrollingId === course.id ? 'Enrolling...' : 'Enroll Now')}
                  </button>
                  <button
                    onClick={() => handleViewAssignments(course)}
                    className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 focus:ring-4 focus:ring-gray-200 transition-all"
                  >
                    View Assignments
                  </button>
                </div>
              </div>

              <div className="mt-3 text-center">
                <p className="text-xs text-gray-500">
                  By {course.instructor.first_name} {course.instructor.last_name}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-500">Try adjusting your search criteria or browse all courses.</p>
        </div>
      )}
    </div>
      {/* Assignments Modal */}
      {assignmentsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-lg border border-gray-200">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Assignments · {assignmentsCourseTitle}</h3>
              <button onClick={() => setAssignmentsOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {assignments.length === 0 ? (
                <p className="text-sm text-gray-500">No assignments yet.</p>
              ) : (
                <ul className="space-y-3">
                  {assignments.map((a) => (
                    <li key={a.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{a.title}</p>
                          <p className="text-sm text-gray-600">{a.description}</p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : '—'}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="p-4 border-t text-right">
              <button onClick={() => setAssignmentsOpen(false)} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseList;