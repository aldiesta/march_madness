import { useState, useEffect } from "react";
import { Grid, Card, CardContent, Typography, Button, CircularProgress } from "@mui/material";

const DraftComponent = () => {
  const [owners, setOwners] = useState([]);
  const [draftedTeams, setDraftedTeams] = useState({});
  const [isDrafting, setIsDrafting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/owners`);
      const data = await response.json();
      setOwners(data);
      fetchTeamsForOwners(data);
    } catch (error) {
      console.error("Error fetching owners:", error);
    }
  };

  const fetchTeamsForOwners = async (ownersList = owners) => {
    try {
      const updatedDraftedTeams = {};
      for (const owner of ownersList) {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/owners/${owner.id}/teams`);
        const teams = await response.json();
        updatedDraftedTeams[owner.id] = teams;
      }
      setDraftedTeams(updatedDraftedTeams);
    } catch (error) {
      console.error("Error fetching teams for owners:", error);
    }
  };

  const handleDraftRound = async () => {
    setIsDrafting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/draft-round`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        fetchTeamsForOwners();
      } else {
        console.error("Error drafting teams in this round");
      }
    } catch (error) {
      console.error("Error drafting team:", error);
    }

    setTimeout(() => {
      setIsDrafting(false);
    }, 1000);
  };

  const handleResetDraft = async () => {
    if (!window.confirm("Are you sure you want to reset the draft?")) return;

    setIsResetting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reset-draft`, {
        method: "POST",
      });

      if (response.ok) {
        fetchTeamsForOwners();
      }
    } catch (error) {
      console.error("Error resetting draft:", error);
    }

    setIsResetting(false);
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Draft
      </Typography>
      <Button onClick={handleDraftRound} disabled={isDrafting} variant="contained" color="primary" sx={{ marginRight: 2 }}>
        {isDrafting ? <CircularProgress size={24} /> : "Draft Next Round"}
      </Button>
      <Button onClick={handleResetDraft} disabled={isResetting} variant="contained" color="error">
        {isResetting ? <CircularProgress size={24} /> : "Reset Draft"}
      </Button>

      <Typography variant="h5" sx={{ marginTop: 3 }}>
        Owners & Drafted Teams
      </Typography>
      <Grid container spacing={2}>
        {owners.map((owner) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={owner.id}>
            <Card sx={{ minHeight: 150 }}>
              <CardContent>
                <Typography variant="h6" align="center">
                  {owner.name.toUpperCase()}
                </Typography>
                <Typography variant="subtitle2" align="center" color="textSecondary">
                  Drafted Teams:
                </Typography>
                {draftedTeams[owner.id]?.length > 0 ? (
                  <ul>
                    {draftedTeams[owner.id].map((team) => (
                      <li key={team.id}>{team.name.toUpperCase()} ({team.seed})</li>
                    ))}
                  </ul>
                ) : (
                  <Typography variant="body2" align="center" color="textSecondary">
                    No teams drafted yet
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default DraftComponent;
