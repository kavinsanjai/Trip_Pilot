import express from 'express';
import { supabase } from '../config/supabase.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /trip/create
 * Create a new trip
 */
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { destination, start_date, end_date, itinerary_json } = req.body;

    if (!destination || !start_date || !end_date) {
      return res.status(400).json({ 
        error: 'Missing required fields: destination, start_date, end_date' 
      });
    }

    const { data, error } = await supabase
      .from('trip_history')
      .insert({
        user_id: req.user.id,
        destination,
        start_date,
        end_date,
        itinerary_json: itinerary_json || {}
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create trip', message: error.message });
    }

    res.status(201).json({
      message: 'Trip created successfully',
      trip: data
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create trip', message: error.message });
  }
});

/**
 * GET /trip/history
 * Get all trips for authenticated user
 */
router.get('/history', verifyToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('trip_history')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch trip history', message: error.message });
    }

    res.json({
      trips: data || []
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trip history', message: error.message });
  }
});

/**
 * GET /trip/:id
 * Get specific trip by ID
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('trip_history')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Trip not found', message: error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trip', message: error.message });
  }
});

/**
 * DELETE /trip/:id
 * Delete a trip
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('trip_history')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      return res.status(500).json({ error: 'Failed to delete trip', message: error.message });
    }

    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete trip', message: error.message });
  }
});

export default router;
