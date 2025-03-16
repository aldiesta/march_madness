import { useState } from "react";

const AddOwnerForm = ({ onOwnerAdded }) => {
  const [name, setName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/owners`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        const newOwner = await response.json();
        onOwnerAdded(newOwner); // Update the owner list in parent component
        setName(""); // Reset input field
      } else {
        console.error("Failed to add owner");
      }
    } catch (error) {
      console.error("Error adding owner:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-owner-form">
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

export default AddOwnerForm;
