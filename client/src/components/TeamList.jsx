
const TeamList = ({ teams }) => {
    return (
      <div>
        <h2>Teams</h2>
        <ul>
          {teams.map((team, index) => (
            <li key={index}>
              {team.teamName} - Seed: {team.seed}
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  export default TeamList;