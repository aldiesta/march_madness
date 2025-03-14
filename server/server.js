const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const cors = require("cors");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

// Create a PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false },
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

// Route to randomly draft one team per owner per round
app.post('/api/draft-round', async (req, res) => {
  try {
      // Get all available teams (unassigned)
      const { rows: availableTeams } = await pool.query('SELECT * FROM teams WHERE owner_id IS NULL ORDER BY RANDOM()');
      const { rows: owners } = await pool.query('SELECT * FROM owners');

      if (availableTeams.length === 0 || owners.length === 0) {
          return res.status(400).json({ error: "No teams or owners available for drafting." });
      }

      let teamIndex = 0;
      const updatedTeams = [];

      for (const owner of owners) {
          if (teamIndex >= availableTeams.length) break; // Stop if no more teams are left

          const team = availableTeams[teamIndex];
          teamIndex++;

          // Assign the team to the owner
          const { rows } = await pool.query(
              'UPDATE teams SET owner_id = $1 WHERE id = $2 RETURNING *',
              [owner.id, team.id]
          );

          updatedTeams.push(rows[0]); // Collect updated teams
      }

      res.json({ message: "Draft round completed.", draftedTeams: updatedTeams });
  } catch (err) {
      console.error("Error during draft round:", err);
      res.status(500).json({ error: "Failed to complete draft round." });
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

  app.post('/api/draft', async (req, res) => {
    try {
      // Get all unassigned teams in a random order
      const poolResult = await pool.query(
        'SELECT * FROM teams WHERE owner_id IS NULL ORDER BY RANDOM()'
      );
      const teams = poolResult.rows;
  
      // Get all owners
      const ownersResult = await pool.query('SELECT * FROM owners');
      const owners = ownersResult.rows;
  
      if (teams.length === 0 || owners.length === 0) {
        return res.status(400).json({ error: 'No available teams or owners' });
      }
  
      let updates = [];
      let numberOfAssignments = Math.min(owners.length, teams.length); // Assign one per owner
  
      for (let i = 0; i < numberOfAssignments; i++) {
        const team = teams.shift(); // Remove a team from the available pool
        updates.push(
          pool.query(
            'UPDATE teams SET owner_id = $1 WHERE id = $2 RETURNING *',
            [owners[i].id, team.id]
          )
        );
      }
  
      // Execute updates in parallel
      const results = await Promise.all(updates);
      
      res.json({
        message: `Drafted ${numberOfAssignments} team(s)`,
        draftedTeams: results.map(result => result.rows[0])
      });
  
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to draft teams' });
    }
  });

  // Route to delete a single owner
app.delete('/api/owners/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM owners WHERE id = $1', [id]);
    res.json({ message: 'Owner deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete owner' });
  }
});

// Route to delete all owners
app.delete('/api/owners', async (req, res) => {
  try {
    await pool.query('DELETE FROM owners');
    res.json({ message: 'All owners deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete all owners' });
  }
});

// Route to delete a single team
 app.delete('/api/teams/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM teams WHERE id = $1', [id]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete team' });
  }
});

// Route to delete all teams
app.delete('/api/teams', async (req, res) => {
  try {
    await pool.query('DELETE FROM teams');
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete all teams' });
  }
});

// Route to reset the draft
app.post('/api/reset-draft', async (req, res) => {
  try {
      await pool.query('UPDATE teams SET owner_id = NULL');
      res.json({ message: "All teams have been reset to the pool." });
  } catch (err) {
      console.error("Error resetting draft:", err);
      res.status(500).json({ error: "Failed to reset draft" });
  }
});
  

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
