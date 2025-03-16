import { useState, useEffect } from "react";
import { Grid, Card, CardContent, Typography, Button, CircularProgress } from "@mui/material";

const DraftComponent = () => {
  const [owners, setOwners] = useState([]);
  const [draftedTeams, setDraftedTeams] = useState({});
  const [remainingTeams, setRemainingTeams] = useState([]);
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
      fetchRemainingTeams();
    } catch (error) {
      console.error("Error fetching teams for owners:", error);
    }
  };

  const fetchRemainingTeams = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/teams`);
      const teams = await response.json();
      const unassignedTeams = teams.filter((team) => team.owner_id === null);
      setRemainingTeams(unassignedTeams);
    } catch (error) {
      console.error("Error fetching remaining teams:", error);
    }
  };

  const handleDraftRound = async () => {
    if (remainingTeams.length === 0) {
      alert("No more teams available for drafting.");
      return;
    }

    if (remainingTeams.length < owners.length) {
      alert("Not enough teams left to distribute evenly. The draft cannot proceed.");
      return;
    }

    setIsDrafting(true);

    let availableTeams = [...remainingTeams];
    let draftedTeamsThisRound = [];

    for (const owner of owners) {
      if (availableTeams.length === 0) break; // Stop if no more teams left

      const randomIndex = Math.floor(Math.random() * availableTeams.length);
      const team = availableTeams.splice(randomIndex, 1)[0];

      draftedTeamsThisRound.push({ owner_id: owner.id, team_id: team.id });
    }

    // Send the batch draft request
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/draft-round`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draftedTeamsThisRound),
      });

      if (!response.ok) {
        console.error("Error drafting teams in this round");
      }
    } catch (error) {
      console.error("Error drafting team:", error);
    }

    // Refresh data
    setTimeout(() => {
      fetchTeamsForOwners();
      fetchRemainingTeams();
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
        await fetchTeamsForOwners();
        fetchRemainingTeams();
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
      <Button onClick={handleDraftRound} disabled={isDrafting || remainingTeams.length === 0} variant="contained" color="primary" sx={{ marginRight: 2 }}>
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
                      <li key={team.id}>{team.name.toUpperCase()} (Seed: {team.seed})</li>
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

      <Typography variant="h5" sx={{ marginTop: 3 }}>
        Remaining Teams
      </Typography>
      <Grid container spacing={2}>
        {remainingTeams.length > 0 ? (
          remainingTeams.map((team) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={team.id}>
              <Card sx={{ minHeight: 100 }}>
                <CardContent>
                  <Typography variant="body1" align="center">
                    {team.name.toUpperCase()} (Seed: {team.seed})
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            No remaining teams
          </Typography>
        )}
      </Grid>
    </div>
  );
};

export default DraftComponent;
