import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import { supabase } from '../config/database.js';
import { memoryAssignments } from '../config/memory.js';

const router = express.Router();
const useMemoryStore = !supabase;
const memorySubmissions = [];

// Get assignments for a course
router.get('/course/:courseId', authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;

    if (useMemoryStore) {
      const list = memoryAssignments[courseId] || [];
      return res.json({ success: true, data: list });
    }

    const { data: assignments, error } = await supabase
      .from('assignments')
      .select(`
        *,
        submissions:assignment_submissions(
          id, submitted_at, grade, feedback,
          student:users!assignment_submissions_student_id_fkey(
            id, first_name, last_name
          )
        )
      `)
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching assignments',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Create assignment (instructors only)
router.post('/', authenticate, authorize('instructor', 'admin'), [
  body('title').notEmpty().trim(),
  body('description').notEmpty().trim(),
  body('course_id').isUUID(),
  body('due_date').isISO8601()
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

    const { title, description, course_id, due_date, max_points = 100 } = req.body;

    const { data: assignment, error } = await supabase
      .from('assignments')
      .insert([{
        title,
        description,
        course_id,
        due_date,
        max_points,
        created_by: req.user.id
      }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error creating assignment',
        error: error.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      data: assignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Submit assignment
router.post('/:assignmentId/submit', authenticate, [
  body('content').notEmpty().trim()
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

    const { assignmentId } = req.params;
    const { content } = req.body;

    if (useMemoryStore) {
      const already = memorySubmissions.find(s => s.assignment_id === assignmentId && s.student_id === req.user.id);
      if (already) {
        return res.status(400).json({ success: false, message: 'Assignment already submitted' });
      }
      const submission = {
        id: String(memorySubmissions.length + 1),
        assignment_id: assignmentId,
        student_id: req.user.id,
        content,
        submitted_at: new Date().toISOString(),
        status: 'submitted'
      };
      memorySubmissions.push(submission);
      return res.status(201).json({ success: true, message: 'Assignment submitted successfully', data: submission });
    }

    // Check if already submitted
    const { data: existingSubmission } = await supabase
      .from('assignment_submissions')
      .select('id')
      .eq('assignment_id', assignmentId)
      .eq('student_id', req.user.id)
      .single();

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'Assignment already submitted'
      });
    }

    const { data: submission, error } = await supabase
      .from('assignment_submissions')
      .insert([{
        assignment_id: assignmentId,
        student_id: req.user.id,
        content,
        submitted_at: new Date().toISOString(),
        status: 'submitted'
      }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error submitting assignment',
        error: error.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Assignment submitted successfully',
      data: submission
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