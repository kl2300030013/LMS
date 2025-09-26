import jwt from 'jsonwebtoken';
import { supabase } from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const useMemoryStore = !supabase;

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (useMemoryStore) {
      // Minimal user context from token in dev fallback
      req.user = { id: decoded.userId, role: decoded.role };
    } else {
      // Get user from database
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.userId)
        .single();

      if (error || !user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token.'
        });
      }

      req.user = user;
    }
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    next();
  };
};