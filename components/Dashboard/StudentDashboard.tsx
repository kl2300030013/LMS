import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Award, TrendingUp, Clock, Star } from 'lucide-react';
import { apiService } from '../../utils/api';

const StudentDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    submittedAssignments: 0,
    certificatesEarned: 0
  });
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [dashboardStats, courses] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getCourses()
      ]);
      
      setStats(dashboardStats);
      setRecentCourses(courses.slice(0, 3));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Enrolled Courses</p>
              <p className="text-3xl font-bold mt-1">{stats.enrolledCourses}</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 p-3 rounded-full">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Assignments Submitted</p>
              <p className="text-3xl font-bold mt-1">{stats.submittedAssignments}</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 p-3 rounded-full">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Certificates Earned</p>
              <p className="text-3xl font-bold mt-1">{stats.certificatesEarned}</p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 p-3 rounded-full">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Courses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Available Courses
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentCourses.map((course: any) => (
                <div key={course.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-500">{course.category} • {course.level}</p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                    Enroll
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Learning Progress
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="font-medium text-gray-900">Study Time Today</p>
                    <p className="text-sm text-gray-500">Keep up the great work!</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-600">2.5h</p>
                  <p className="text-xs text-gray-500">+30min from yesterday</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="font-medium text-gray-900">Average Score</p>
                    <p className="text-sm text-gray-500">Across all assignments</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-yellow-600">85%</p>
                  <p className="text-xs text-gray-500">+5% improvement</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group">
              <BookOpen className="w-8 h-8 text-gray-400 group-hover:text-blue-600" />
              <span className="text-sm font-medium text-gray-600 group-hover:text-blue-700">Browse Courses</span>
            </button>
            
            <button className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group">
              <FileText className="w-8 h-8 text-gray-400 group-hover:text-green-600" />
              <span className="text-sm font-medium text-gray-600 group-hover:text-green-700">View Assignments</span>
            </button>
            
            <button className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group">
              <Award className="w-8 h-8 text-gray-400 group-hover:text-purple-600" />
              <span className="text-sm font-medium text-gray-600 group-hover:text-purple-700">My Certificates</span>
            </button>
            
            <button className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all group">
              <TrendingUp className="w-8 h-8 text-gray-400 group-hover:text-orange-600" />
              <span className="text-sm font-medium text-gray-600 group-hover:text-orange-700">Progress Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;