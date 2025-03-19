import { useState, useEffect } from "react";
import { Card, CardContent, Typography, Button, Grid, Box } from "@mui/material";
import AddOwnerForm from "./AddOwnerForm";
import "bootstrap-icons/font/bootstrap-icons.css";


const OwnerList = () => {
  const [owners, setOwners] = useState([]);

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/owners`);
      if (!response.ok) throw new Error("Failed to fetch owners");

      const data = await response.json();
      setOwners(data);
    } catch (error) {
      console.error("Error fetching owners:", error);
    }
  };

  const handleOwnerAdded = (newOwner) => {
    setOwners((prevOwners) => [...prevOwners, newOwner]);
  };

  const deleteOwner = async (ownerId) => {
    if (!window.confirm("Are you sure you want to delete this owner?")) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/owners/${ownerId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setOwners((prevOwners) => prevOwners.filter((owner) => owner.id !== ownerId));
      } else {
        console.error("Failed to delete owner");
      }
    } catch (error) {
      console.error("Error deleting owner:", error);
    }
  };

  const deleteAllOwners = async () => {
    if (!window.confirm("Are you sure you want to delete all owners? This action cannot be undone.")) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/owners`, {
        method: "DELETE",
      });

      if (response.ok) {
        setOwners([]);
      } else {
        console.error("Failed to delete all owners");
      }
    } catch (error) {
      console.error("Error deleting all owners:", error);
    }
  };

  return (
    <Box sx={{ textAlign: "center", mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Owners 
      </Typography>
      <AddOwnerForm onOwnerAdded={handleOwnerAdded} />

      {owners.length > 0 && (
        <Button
          onClick={deleteAllOwners}
          variant="contained"
          color="error"
          sx={{ mt: 2, mb: 2 }}
        >
          Delete All Owners
        </Button>
      )}

      <Grid container spacing={2} justifyContent="center">
        {owners.map((owner) => (
          <Grid item key={owner.id} xs={12} sm={6} md={4} lg={3} xl={1.5}>
            <Card sx={{ maxWidth: 200, textAlign: "center", p: 2 }}>
              <CardContent>
                <Typography variant="h6">{owner.name.toUpperCase()}</Typography>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => deleteOwner(owner.id)}
                  sx={{ mt: 1 }}
                >
                  <i class="bi bi-trash-fill"></i>
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default OwnerList;
