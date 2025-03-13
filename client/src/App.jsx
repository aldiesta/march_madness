import { useState } from 'react';
import './App.css'
import AddTeamForm from './components/AddTeamForm'
import TeamList from './components/TeamList';
import OwnerList from './components/AddOwnerForm';

function App() {

  const [teams, setTeams] = useState([]);

  const addTeam = (team) => {
    setTeams([...teams, team]);
  };

  return (
    <div>
      <h1>March Madness Team Randomizer</h1>
      <AddTeamForm addTeam={addTeam} />
      <TeamList teams={teams} />
      <OwnerList />
    </div>
  )
}

export default App;
