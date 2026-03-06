import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

/**
 * POST /auth/login
 * Login with email and password
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: 'Invalid credentials', message: error.message });
    }

    res.json({
      access_token: data.session.access_token,
      token_type: 'bearer',
      user: data.user
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed', message: error.message });
  }
});

/**
 * POST /auth/register
 * Register new user with username
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          display_name: username
        }
      }
    });

    if (error) {
      return res.status(400).json({ error: 'Registration failed', message: error.message });
    }

    res.status(201).json({
      access_token: data.session?.access_token || '',
      token_type: 'bearer',
      user: data.user
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed', message: error.message });
  }
});

/**
 * POST /auth/logout
 * Logout user
 */
router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return res.status(400).json({ error: 'Logout failed', message: error.message });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed', message: error.message });
  }
});

export default router;
