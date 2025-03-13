import { useState, useEffect } from "react";

const AddOwnerForm = ({ onOwnerAdded }) => {
  const [name, setName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    try {
      const response = await fetch("http://localhost:5000/api/owners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });
      
      if (response.ok) {
        const newOwner = await response.json();
        onOwnerAdded(newOwner);
        setName("");
      }
    } catch (error) {
      console.error("Error adding owner:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter owner name"
        required
      />
      <button type="submit">Add Owner</button>
    </form>
  );
};

const OwnerList = () => {
  const [owners, setOwners] = useState([]);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/owners");
        const data = await response.json();
        setOwners(data);
      } catch (error) {
        console.error("Error fetching owners:", error);
      }
    };
    fetchOwners();
  }, []);

  const handleOwnerAdded = (newOwner) => {
    setOwners((prevOwners) => [...prevOwners, newOwner]);
  };

  return (
    <div>
      <h2>Owners</h2>
      <AddOwnerForm onOwnerAdded={handleOwnerAdded} />
      <ul>
        {owners.map((owner) => (
          <li key={owner.id}>{owner.name.toUpperCase()}</li>
        ))}
      </ul>
    </div>
  );
};

export default OwnerList;
