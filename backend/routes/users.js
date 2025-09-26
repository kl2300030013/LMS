import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { supabase } from '../config/database.js';
import { memoryCourses } from '../config/memory.js';

const router = express.Router();

// Get user profile
const useMemoryStore = !supabase;

router.get('/profile', authenticate, async (req, res) => {
  try {
    if (useMemoryStore) {
      // Construct a minimal profile with enrolled courses from memory store
      const enrolledCourseIds = new Set();
      memoryCourses.forEach(c => {
        c.enrollments.forEach(e => { if (e.user_id === req.user.id) enrolledCourseIds.add(c.id); });
      });
      const profile = {
        id: req.user.id,
        email: 'you@example.com',
        first_name: 'You',
        last_name: '',
        role: req.user.role,
        enrollments: Array.from(enrolledCourseIds).map(id => ({ course: memoryCourses.find(c => c.id === id) }))
      };
      return res.json({ success: true, data: profile });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id, email, first_name, last_name, role, created_at, last_login,
        enrollments:course_enrollments(
          course:courses(id, title, category, level)
        )
      `)
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching profile',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get user by id (self or admin)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Only allow fetching your own record unless admin
    const isSelf = req.user.id === id;
    const isAdmin = req.user.role === 'admin';
    if (!isSelf && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own profile.'
      });
    }

    if (useMemoryStore) {
      // Minimal mock user in memory mode
      return res.json({
        success: true,
        data: {
          id,
          email: isSelf ? 'you@example.com' : 'user@example.com',
          first_name: isSelf ? 'You' : 'User',
          last_name: '',
          role: req.user.role
        }
      });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, created_at, last_login')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching user',
        error: error.message
      });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get user dashboard stats
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let stats = {};

    if (userRole === 'student') {
      if (useMemoryStore) {
        let enrolled = 0;
        memoryCourses.forEach(c => {
          if (c.enrollments.some(e => e.user_id === userId)) enrolled += 1;
        });
        stats = {
          enrolledCourses: enrolled,
          submittedAssignments: 0,
          certificatesEarned: 0
        };
      } else {
        // Student stats via DB
        const { data: enrollments } = await supabase
          .from('course_enrollments')
          .select('id')
          .eq('user_id', userId);

        const { data: submissions } = await supabase
          .from('assignment_submissions')
          .select('id')
          .eq('student_id', userId);

        const { data: certificates } = await supabase
          .from('certificates')
          .select('id')
          .eq('user_id', userId);

        stats = {
          enrolledCourses: enrollments?.length || 0,
          submittedAssignments: submissions?.length || 0,
          certificatesEarned: certificates?.length || 0
        };
      }
    } else if (userRole === 'instructor') {
      // Instructor stats
      const { data: courses } = await supabase
        .from('courses')
        .select('id')
        .eq('instructor_id', userId);

      const { data: assignments } = await supabase
        .from('assignments')
        .select('id')
        .eq('created_by', userId);

      const { data: enrollments } = await supabase
        .from('course_enrollments')
        .select('id')
        .in('course_id', courses?.map(c => c.id) || []);

      stats = {
        coursesCreated: courses?.length || 0,
        assignmentsCreated: assignments?.length || 0,
        totalStudents: enrollments?.length || 0
      };
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

export default router;