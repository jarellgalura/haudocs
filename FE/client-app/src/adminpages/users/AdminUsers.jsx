import React, { useState, useEffect } from "react";
import Adminsidebar from "../Adminsidebar";
import "./users.css";
import { userColumns } from "./adminusersdata";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  where,
  query,
  setDoc,
  addDoc,
} from "firebase/firestore/lite";

import { DataGrid } from "@mui/x-data-grid";
import "./adminusers.css";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogActions,
  Alert,
} from "@mui/material";
import { auth, db } from "../../firebase";
import CircularProgress from "@mui/material/CircularProgress";

const AdminUsers = () => {
  const [data, setData] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessages, setErrorMessages] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [secondopen, secondsetOpen] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const handleClose = () => setOpen(false);
  const secondhandleClose = () => secondsetOpen(false);
  const handleOpen = () => setOpen(true);
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const fetchData = async () => {
        let list = [];
        try {
          const usersRef = collection(db, "users");
          const querySnapshotRef = await getDocs(
            query(
              usersRef,
              where("role", "in", ["admin", "scientist", "non-scientist"])
            )
          );
          querySnapshotRef.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() });
          });
          setLoading(false);
          setData(list);
        } catch (err) {
          console.log(err);
        }
      };
      fetchData();
    }
  }, [auth, db]);

  const validateForm = () => {
    let valid = true;
    let errorMessage = "";
    if (!email) {
      errorMessage += errorMessages.email + "\n";
      valid = false;
    }
    setErrorMessages(errorMessage);
    return valid;
  };

  const addusers = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Retrieve the user's uid from Firebase Authentication
        const user = auth.currentUser;
        const uid = user.uid;

        // Check if an existing user with the same email exists
        const usersRef = collection(db, "users");
        const querySnapshotRef = await getDocs(
          query(usersRef, where("email", "==", email))
        );

        if (querySnapshotRef.docs.length > 0) {
          // Update the existing user record
          const userId = querySnapshotRef.docs[0].id;
          const userRef = doc(usersRef, userId);
          await updateDoc(userRef, {
            role: role,
            uid: uid,
          });
        } else {
          throw new Error("User does not exist.");
        }

        // Fetch the updated user list and update the state with the updated data
        const updatedSnapshotRef = await getDocs(
          query(
            usersRef,
            where("role", "in", ["admin", "scientist", "non-scientist"])
          )
        );
        const updatedData = updatedSnapshotRef.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(updatedData);

        console.log("User added/updated successfully!");
        setShowDialog(true);
      } catch (err) {
        setErrorMessages(err.message);
      }
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    setOpen(false);
    setEmail("");
    setPassword("");
    setRole("");
  };

  const actionColumn = [];

  const resetForm = () => {
    setEmail("");
    setRole("");
  };

  const buttonStyle = {
    backgroundColor: "maroon",
    color: "white",
    "@media (max-width: 600px)": {
      fontSize: "14px",
      padding: "8px 16px",
    },
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "1px solid #000",
    boxShadow: 24,
    p: 2,
    borderRadius: "5px",
  };

  return (
    <Adminsidebar>
      <div className="usersdatatable">
        <div className="datatableTitle">
          <div>
            <Button
              style={buttonStyle}
              variant="contained"
              onClick={handleOpen}
              className="editUsersButton"
            >
              Edit Users
            </Button>
            <Modal open={open} onClose={handleClose}>
              <Box sx={style}>
                <Container component="main" maxWidth="xs">
                  <CssBaseline />
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Typography sx={{ mb: 5 }} component="h1" variant="h5">
                      User Management
                    </Typography>
                    {errorMessages && (
                      <Alert
                        severity="error"
                        sx={{ width: "100%", mb: "2rem" }}
                        onClose={() => {
                          setErrorMessages(null);
                          resetForm();
                        }}
                      >
                        {errorMessages}
                      </Alert>
                    )}
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          id="email"
                          value={email}
                          label="Email Address"
                          name="email"
                          autoComplete="email"
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl required fullWidth>
                          <InputLabel id="role-label">Role</InputLabel>
                          <Select
                            labelId="role-label"
                            id="role"
                            label="Role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            autoComplete="role-name"
                          >
                            <MenuItem value="admin">Admin</MenuItem>
                            <MenuItem value="applicant">Applicant</MenuItem>
                            <MenuItem value="scientist">Scientist</MenuItem>
                            <MenuItem value="non-scientist">
                              Non-Scientist
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                    <Button
                      type="submit"
                      style={buttonStyle}
                      fullWidth
                      variant="contained"
                      sx={{ mt: 3, mb: 8, height: "3rem" }}
                      onClick={addusers}
                    >
                      Update User
                    </Button>
                  </Box>
                  <Dialog open={showDialog} onClose={handleDialogClose}>
                    <DialogTitle>Success!</DialogTitle>
                    <DialogContent>
                      <Typography variant="body1">
                        You have successfully change the role of {name} to{" "}
                        {role}!
                      </Typography>
                    </DialogContent>
                    <DialogActions>
                      <Button
                        sx={{ color: "maroon" }}
                        onClick={handleDialogClose}
                      >
                        Close
                      </Button>
                    </DialogActions>
                  </Dialog>
                </Container>
              </Box>
            </Modal>
          </div>
        </div>
        <DataGrid
          className="datagrid"
          rows={data}
          loading={loading}
          loadingOverlay={
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CircularProgress />
            </div>
          }
          autoWidth
          disableHorizontalScroll
          columns={userColumns.concat(actionColumn)}
          pageSize={9}
          rowsPerPageOptions={[9]}
        />
      </div>
    </Adminsidebar>
  );
};

export default AdminUsers;
