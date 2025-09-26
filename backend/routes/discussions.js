import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { supabase } from '../config/database.js';
import { memoryDiscussions } from '../config/memory.js';

const router = express.Router();

const useMemoryStore = !supabase;

// Get discussions for a course
router.get('/course/:courseId', authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;

    if (useMemoryStore) {
      return res.json({ success: true, data: memoryDiscussions[courseId] || [] });
    }

    const { data: discussions, error } = await supabase
      .from('discussions')
      .select(`
        *,
        author:users!discussions_author_id_fkey(
          id, first_name, last_name
        ),
        replies:discussion_replies(
          id, content, created_at,
          author:users!discussion_replies_author_id_fkey(
            id, first_name, last_name
          )
        )
      `)
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching discussions',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: discussions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Create discussion
router.post('/', authenticate, [
  body('title').notEmpty().trim(),
  body('content').notEmpty().trim(),
  body('course_id').isUUID()
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

    const { title, content, course_id } = req.body;

    if (useMemoryStore) {
      const disc = { id: 'disc-' + Date.now(), title, content, course_id, author: { id: req.user.id, first_name: 'You', last_name: '' }, replies: [] };
      memoryDiscussions[course_id] = memoryDiscussions[course_id] || [];
      memoryDiscussions[course_id].push(disc);
      return res.status(201).json({ success: true, message: 'Discussion created successfully', data: disc });
    }

    const { data: discussion, error } = await supabase
      .from('discussions')
      .insert([{
        title,
        content,
        course_id,
        author_id: req.user.id
      }])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Error creating discussion',
        error: error.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Discussion created successfully',
      data: discussion
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