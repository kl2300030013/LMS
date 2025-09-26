import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { supabase } from '../config/database.js';
import { pool as mysqlPool } from '../config/mysql.js';
import crypto from 'crypto';

const router = express.Router();

// Fallbacks when environment/database are not fully configured
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
const useSupabase = !!supabase && !mysqlPool;
const useMySQL = !!mysqlPool;
const useMemoryStore = !useSupabase && !useMySQL; // if neither DB is initialized
const memoryUsers = []; // simple in-memory user store for dev/demo

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('role').isIn(['student', 'instructor', 'admin'])
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

    const { email, password, firstName, lastName, role } = req.body;

    // Check if user exists
    if (useMemoryStore) {
      const existing = memoryUsers.find(u => u.email === email);
      if (existing) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }
    } else if (useMySQL) {
      const [rows] = await mysqlPool.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
      if (rows.length > 0) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }
    } else {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let user;
    if (useMemoryStore) {
      user = {
        id: String(memoryUsers.length + 1),
        email,
        password_hash: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        role,
        is_active: true,
      };
      memoryUsers.push(user);
    } else if (useMySQL) {
      const id = crypto.randomUUID();
      await mysqlPool.execute(
        'INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)',
        [id, email, hashedPassword, firstName, lastName, role]
      );
      user = { id, email, first_name: firstName, last_name: lastName, role };
    } else {
      const { data, error } = await supabase
        .from('users')
        .insert([{ email, password_hash: hashedPassword, first_name: firstName, last_name: lastName, role, is_active: true }])
        .select()
        .single();
      if (error) {
        return res.status(500).json({ success: false, message: 'Error creating user', error: error.message });
      }
      user = data;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
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

    const { email, password } = req.body;

    // Get user
    let user;
    if (useMemoryStore) {
      user = memoryUsers.find(u => u.email === email && u.is_active);
    } else if (useMySQL) {
      const [rows] = await mysqlPool.execute('SELECT * FROM users WHERE email = ? AND is_active = 1 LIMIT 1', [email]);
      user = rows[0];
    } else {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .single();
      user = error ? null : data;
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    // Update last login
    if (useMySQL) {
      await mysqlPool.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
    } else if (!useMemoryStore) {
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role
        },
        token
      }
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