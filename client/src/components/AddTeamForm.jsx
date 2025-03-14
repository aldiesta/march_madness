import { useState } from "react";

const AddTeamForm = ({ setTeams }) => {
  const [teamName, setTeamName] = useState("");
  const [seed, setSeed] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teamName.trim() || !seed) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/teams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: teamName, seed }),
      });

      if (response.ok) {
        const newTeam = await response.json();
        setTeams((prevTeams) => [...prevTeams, newTeam]); // Update UI instantly
        setTeamName("");
        setSeed(""); // Reset dropdown
      }
    } catch (error) {
      console.error("Error adding team:", error);
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
          <option key={num} value={num}>
            {num}
          </option>
        ))}
      </select>
      <button type="submit">Add Team</button>
    </form>
  );
};

export default AddTeamForm;
