import { useState, useEffect } from 'react';
import './App.css';
import AddTeamForm from './components/AddTeamForm';
import TeamList from './components/TeamList';
import OwnerList from './components/AddOwnerForm';

function App() {
  const [teams, setTeams] = useState([]);

  // Fetch teams from the backend when the component loads
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/teams");
        if (!response.ok) {
          throw new Error("Failed to fetch teams");
        }
        const data = await response.json();
        console.log("Fetched Teams:", data); // Debugging log
        setTeams(data);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };
    fetchTeams();
  }, []);

  const addTeam = (team) => {
    setTeams((prevTeams) => [...prevTeams, team]);
  };

  return (
    <div>
      <h1>March Madness Team Randomizer</h1>
      <AddTeamForm addTeam={addTeam} />
      <TeamList teams={teams} />
      <OwnerList />
    </div>
  );
}

export default App;