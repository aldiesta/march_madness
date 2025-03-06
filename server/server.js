const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Create a PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(express.json());

// Route to add an owner
app.post('/api/owners', async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query('INSERT INTO owners (name) VALUES ($1) RETURNING *', [name]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add owner' });
  }
});

// Route to add a team
app.post('/api/teams', async (req, res) => {
  const { name, owner_id, seed } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO teams (name, owner_id, seed) VALUES ($1, $2, $3) RETURNING *',
      [name, owner_id, seed]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add team' });
  }
});

// Route to get all owners
app.get('/api/owners', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM owners');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch owners' });
  }
});

// Route to get all teams
app.get('/api/teams', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM teams');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Route to randomly draft a team
app.post('/api/draft', async (req, res) => {
    try {
      // Get all teams that have not been drafted (still in the pool)
      const poolResult = await pool.query('SELECT * FROM teams WHERE owner_id IS NULL ORDER BY RANDOM() LIMIT 1');
  
      if (poolResult.rows.length === 0) {
        return res.status(400).json({ error: 'No teams available in the pool' });
      }
  
      // Select the first available team
      const team = poolResult.rows[0];
  
      // Now assign that team to the current owner (pass owner_id from the request)
      const { owner_id } = req.body;
  
      const updatedTeam = await pool.query(
        'UPDATE teams SET owner_id = $1 WHERE id = $2 RETURNING *',
        [owner_id, team.id]
      );
  
      res.json(updatedTeam.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to draft team' });
    }
  });

  // Route to get teams by owner_id
app.get('/api/owners/:owner_id/teams', async (req, res) => {
    const { owner_id } = req.params;
    try {
      const result = await pool.query('SELECT * FROM teams WHERE owner_id = $1', [owner_id]);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch teams for this owner' });
    }
  });

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
