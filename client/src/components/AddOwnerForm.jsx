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

  const deleteOwner = async (ownerId) => {
    if (!window.confirm("Are you sure you want to delete this owner?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/owners/${ownerId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setOwners((prevOwners) => prevOwners.filter((owner) => owner.id !== ownerId));
      }
    } catch (error) {
      console.error("Error deleting owner:", error);
    }
  };

  const deleteAllOwners = async () => {
    if (!window.confirm("Are you sure you want to delete all owners? This action cannot be undone.")) return;

    try {
      const response = await fetch("http://localhost:5000/api/owners", {
        method: "DELETE",
      });

      if (response.ok) {
        setOwners([]);
      }
    } catch (error) {
      console.error("Error deleting all owners:", error);
    }
  };

  return (
    <div>
      <h2>Owners</h2>
      <AddOwnerForm onOwnerAdded={handleOwnerAdded} />
      {owners.length > 0 && <button onClick={deleteAllOwners} style={{ marginBottom: "10px", backgroundColor: "red", color: "white" }}>Delete All Owners</button>}
      <ul>
        {owners.map((owner) => (
          <li key={owner.id}>
            {owner.name.toUpperCase()}{" "}
            <button onClick={() => deleteOwner(owner.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OwnerList;
