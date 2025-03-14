import { useState, useEffect } from "react";

const DraftComponent = () => {
  const [owners, setOwners] = useState([]);
  const [draftedTeams, setDraftedTeams] = useState({});
  const [isDrafting, setIsDrafting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [remainingTeams, setRemainingTeams] = useState([]);

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

    // ✅ NEW CHECK: Prevent drafting if fewer teams than owners
    if (remainingTeams.length < owners.length) {
      alert("Not enough teams left to distribute evenly. The draft cannot proceed.");
      return;
    }

    setIsDrafting(true);

    let availableTeams = [...remainingTeams]; // Clone the remaining teams list
    let draftedTeamsThisRound = [];

    for (const owner of owners) {
      if (availableTeams.length === 0) break; // Stop if no more teams left

      const randomIndex = Math.floor(Math.random() * availableTeams.length);
      const team = availableTeams.splice(randomIndex, 1)[0]; // Remove team from available list

      draftedTeamsThisRound.push({ owner_id: owner.id, team_id: team.id });
    }

    if (draftedTeamsThisRound.length > 0) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/draft-round`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(draftedTeamsThisRound),
        });

        if (!response.ok) {
          console.log(`No more teams available.`);
        }
      } catch (error) {
        console.error("Error drafting team:", error);
      }
    }

    setTimeout(() => {
      fetchTeamsForOwners();
      fetchRemainingTeams();
      setIsDrafting(false);
    }, 1000);
  };

  const handleResetDraft = async () => {
    const confirmReset = window.confirm("Are you sure you want to reset the draft?");
    if (!confirmReset) return;

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
      <h2>Draft</h2>
      <button onClick={handleDraftRound} disabled={isDrafting || remainingTeams.length === 0} style={{ marginBottom: "10px" }}>
        {isDrafting ? "Drafting..." : "Draft Next Round"}
      </button>
      <button onClick={handleResetDraft} disabled={isResetting} style={{ marginLeft: "10px", backgroundColor: "red", color: "white" }}>
        {isResetting ? "Resetting..." : "Reset Draft"}
      </button>

      <h3>Owners & Drafted Teams</h3>
      <ul>
        {owners.map((owner) => (
          <li key={owner.id}>
            <strong>{owner.name.toUpperCase()}</strong>
            <ul>
              {draftedTeams[owner.id]?.length > 0 ? (
                draftedTeams[owner.id].map((team) => (
                  <li key={team.id}>{team.name.toUpperCase()} (Seed: {team.seed})</li>
                ))
              ) : (
                <li>No teams drafted yet</li>
              )}
            </ul>
          </li>
        ))}
      </ul>

      <h3>Remaining Teams</h3>
      <ul>
        {remainingTeams.length > 0 ? (
          remainingTeams.map((team) => <li key={team.id}>{team.name.toUpperCase()} (Seed: {team.seed})</li>)
        ) : (
          <li>No remaining teams</li>
        )}
      </ul>
    </div>
  );
};

export default DraftComponent;



