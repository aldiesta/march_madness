const TeamList = ({ teams }) => {
    return (
      <div>
        <h2>Teams</h2>
        <ul>
        {teams.map((team) => (
          <li key={team.id}>
            {team.name.toUpperCase()} - ({team.seed})
          </li>
        ))}
      </ul>
      </div>
    );
  };
  
  export default TeamList;