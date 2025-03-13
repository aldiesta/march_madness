import { useState } from 'react';

const AddTeamForm = ({ addTeam }) => {
  const [teamName, setTeamName] = useState('');
  const [seed, setSeed] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const seedValue = parseInt(seed);
    
    // Ensure seed is a valid number between 1 and 16
    if (teamName && seedValue >= 1 && seedValue <= 16) {
      addTeam({ teamName, seed: seedValue });
      setTeamName('');
      setSeed('');
    } else {
      alert("Seed must be a number between 1 and 16.");
    }
  };
  return (
    <form onSubmit={handleSubmit}>
    <input
      type="text"
      value={teamName}
      onChange={(e) => setTeamName(e.target.value)}
      placeholder="Enter team name"
      required
    />
    <select value={seed} onChange={(e) => setSeed(e.target.value)} required>
      <option value="">Select a Seed</option>
      {Array.from({ length: 16 }, (_, i) => i + 1).map((num) => (
        <option key={num} value={num}>{num}</option>
      ))}
    </select>
    <button type="submit">Add Team</button>
  </form>
  );
};

export default AddTeamForm;
