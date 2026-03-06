import express from 'express';
import { supabase } from '../config/supabase.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /user/profile
 * Get user profile
 */
router.get('/profile', verifyToken, async (req, res) => {
  try {
    res.json({
      id: req.user.id,
      email: req.user.email,
      created_at: req.user.created_at
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile', message: error.message });
  }
});

/**
 * GET /user/preferences
 * Get user preferences
 */
router.get('/preferences', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      return res.status(500).json({ error: 'Failed to fetch preferences', message: error.message });
    }

    res.json(data || {
      budget: null,
      preferred_transport: null,
      preferred_hotel_rating: null,
      travel_style: null
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch preferences', message: error.message });
  }
});

/**
 * POST /user/preferences
 * Update user preferences
 */
router.post('/preferences', verifyToken, async (req, res) => {
  try {
    const { budget, preferred_transport, preferred_hotel_rating, travel_style } = req.body;

    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: req.user.id,
        budget,
        preferred_transport,
        preferred_hotel_rating,
        travel_style
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update preferences', message: error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update preferences', message: error.message });
  }
});

export default router;
