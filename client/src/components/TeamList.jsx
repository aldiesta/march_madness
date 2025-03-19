import { useEffect, useState } from "react";
import { Grid, Card, CardContent, Typography, Button, Box } from "@mui/material";
import "bootstrap-icons/font/bootstrap-icons.css";


const TeamList = ({ teams, setTeams }) => {
  const [sortedTeams, setSortedTeams] = useState([]);

  // Fetch teams when component mounts
  useEffect(() => {
    fetchTeams();
  }, []);

  // Sort teams when `teams` state changes
  useEffect(() => {
    const undrafted = teams.filter((team) => !team.owner_id);
    const drafted = teams.filter((team) => team.owner_id);
    setSortedTeams([...undrafted, ...drafted]); // Drafted teams move to the bottom
  }, [teams]);

  const fetchTeams = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/teams`);
      const data = await response.json();
      setTeams(data); // Updates the state, which triggers the sorting
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

  const deleteAllTeams = async () => {
    if (!window.confirm("Are you sure you want to delete all teams? This action cannot be undone.")) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/teams`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTeams([]);
      }
    } catch (error) {
      console.error("Error deleting all teams:", error);
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Teams
      </Typography>

      {teams.length > 0 && (
        <Box sx={{ mb: 2, textAlign: "center" }}>
          <Button variant="contained" color="error" onClick={deleteAllTeams}>
            Delete All Teams
          </Button>
        </Box>
      )}

      {/* Grid Layout for Team Cards */}
      <Grid container spacing={2}>
        {sortedTeams.map((team) => (
          <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={team.id}>
            <Card
              sx={{
                textAlign: "center",
                p: 2,
                backgroundColor: team.owner_id ? "#d3d3d3" : "white", // Grey out drafted teams
                opacity: team.owner_id ? 0.6 : 1, // Reduce opacity for drafted teams
              }}
            >
              <CardContent>
                <Typography variant="h6">{team.name.toUpperCase()} ({team.seed})</Typography>
                {!team.owner_id && (
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    sx={{ mt: 1 }}
                    onClick={() => deleteTeam(team.id)}
                  >
                    <i class="bi bi-trash-fill"></i>
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default TeamList;
