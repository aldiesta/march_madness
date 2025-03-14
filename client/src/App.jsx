import { useState, useEffect } from "react";
import "./App.css";
import AddTeamForm from "./components/AddTeamForm";
import TeamList from "./components/TeamList";
import OwnerList from "./components/AddOwnerForm";

function App() {
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

  return (
    <div>
      <h1>March Madness Team Randomizer</h1>
      <AddTeamForm setTeams={setTeams} />
      <TeamList teams={teams} setTeams={setTeams} />
      <OwnerList />
    </div>
  );
}

export default App;
