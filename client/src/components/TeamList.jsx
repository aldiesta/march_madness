const TeamList = ({ teams, setTeams }) => {
    const deleteTeam = async (teamId) => {
      const confirmDelete = window.confirm("Are you sure you want to delete this team?");
      if (!confirmDelete) return;
  
      try {
        const response = await fetch(`http://localhost:5000/api/teams/${teamId}`, {
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
      const confirmDeleteAll = window.confirm("Are you sure you want to delete ALL teams?");
      if (!confirmDeleteAll) return;
  
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
          <button onClick={deleteAllTeams} style={{ marginBottom: "10px", backgroundColor: "red", color: "white" }}>
            Delete All Teams
          </button>
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
  