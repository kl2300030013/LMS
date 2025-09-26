import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import { supabase } from '../config/database.js';
import { memoryCourses as sharedMemoryCourses } from '../config/memory.js';

const router = express.Router();

// Fallbacks when database is not configured
const useMemoryStore = !supabase;
const memoryCourses = sharedMemoryCourses;
 

// Get all courses
router.get('/', async (req, res) => {
  try {
    if (useMemoryStore) {
      return res.json({ success: true, data: memoryCourses });
    }

    const { data: courses, error } = await supabase
      .from('courses')
      .select(`
        *,
        instructor:users!courses_instructor_id_fkey(
          id, first_name, last_name, email
        ),
        enrollments:course_enrollments(count)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching courses',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Create course (instructors and admins only)
router.post('/', authenticate, authorize('instructor', 'admin'), [
  body('title').notEmpty().trim(),
  body('description').notEmpty().trim(),
  body('category').notEmpty().trim(),
  body('level').isIn(['beginner', 'intermediate', 'advanced'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, category, level, price = 0, duration_weeks = 4 } = req.body;

    const { data: course, error } = await supabase
      .from('courses')
      .insert([{
        title,
        description,
        category,
        level,
        price,
        duration_weeks,
        instructor_id: req.user.id,
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error creating course',
        error: error.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Enroll in course
router.post('/:courseId/enroll', authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // In-memory fallback path
    if (useMemoryStore) {
      const course = memoryCourses.find(c => c.id === courseId);
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
      const already = course.enrollments.some(e => e.user_id === userId);
      if (already) {
        return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
      }
      course.enrollments.push({ user_id: userId, enrolled_at: new Date().toISOString(), status: 'active' });
      return res.status(201).json({ success: true, message: 'Successfully enrolled in course', data: { course_id: courseId, user_id: userId } });
    }

    // Database path
    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .single();

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Create enrollment
    {
      const course = memoryCourses.find(c => c.id === courseId);
      if (!course) {
        // If DB route, we won't reach here
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
    }
    const { data: enrollment, error } = await supabase
      .from('course_enrollments')
      .insert([{
        course_id: courseId,
        user_id: userId,
        enrolled_at: new Date().toISOString(),
        status: 'active'
      }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error enrolling in course',
        error: error.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: enrollment
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

// Get courses the authenticated user is enrolled in
router.get('/enrolled', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    if (useMemoryStore) {
      const enrolled = memoryCourses.filter(c => c.enrollments.some(e => e.user_id === userId));
      return res.json({ success: true, data: enrolled });
    }

    const { data, error } = await supabase
      .from('course_enrollments')
      .select(`
        course:courses(
          id, title, description, category, level, price, duration_weeks, instructor_id
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching enrolled courses',
        error: error.message
      });
    }

    const courses = (data || []).map(row => row.course).filter(Boolean);
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});