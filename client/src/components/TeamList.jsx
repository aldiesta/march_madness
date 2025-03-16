import { useEffect, useState } from "react";
import { Grid, Card, CardContent, Typography, Button } from "@mui/material";

const TeamList = ({ teams, setTeams }) => {
  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/teams`);
      const data = await response.json();
      setTeams(data);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  const deleteTeam = async (teamId) => {
    if (!window.confirm("Are you sure you want to delete this team?")) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/teams/${teamId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTeams((prevTeams) => prevTeams.filter((team) => team.id !== teamId));
      }
    } catch (error) {
      console.error("Error deleting team:", error);
    }
  };

  return (
    <div>
      <h2>Teams</h2>
      <Grid container spacing={2}>
        {teams.map((team) => (
          <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={team.id}>
            <Card sx={{ textAlign: "center", p: 2 }}>
              <CardContent>
                <Typography variant="h6">{team.name.toUpperCase()}</Typography>
                <Typography variant="body2">({team.seed})</Typography>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  sx={{ mt: 1 }}
                  onClick={() => deleteTeam(team.id)}
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default TeamList;
