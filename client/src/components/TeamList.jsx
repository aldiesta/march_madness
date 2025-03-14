import { useState, useEffect } from "react";

const TeamList = () => {
  const [teams, setTeams] = useState([]);

  // Fetch teams when component loads
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/teams");
        const data = await response.json();
        setTeams(data);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };
    fetchTeams();
  }, []);

  // Delete individual team
  const deleteTeam = async (teamId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/teams/${teamId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTeams(teams.filter((team) => team.id !== teamId));
      }
    } catch (error) {
      console.error("Error deleting team:", error);
    }
  };

  // Delete all teams
  const deleteAllTeams = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/teams", {
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
      <h2>Teams</h2>
      {teams.length > 0 && (
        <button onClick={deleteAllTeams} style={{ marginBottom: "10px", backgroundColor: "red", color: "white" }}>Delete All Teams</button>
      )}
      <ul>
        {teams.map((team) => (
          <li key={team.id}>
            {team.name.toUpperCase()} - ({team.seed})
            <button onClick={() => deleteTeam(team.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeamList;
