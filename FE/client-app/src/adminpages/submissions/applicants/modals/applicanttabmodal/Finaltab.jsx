import React, { useState, useEffect, useRef } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Typography,
  Alert,
  DialogContentText,
} from "@mui/material";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import "../tabmodal.css";
import { useNavigate } from "react-router-dom";
import "./applicantmodal.css";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth } from "../../../../../firebase";
import Modal from "@mui/material/Modal";
import AdminTransfer from "./AdminTransfer";
import CircularProgress from "@mui/material/CircularProgress";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "50%",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const Finaltab = (props) => {
  const navigate = useNavigate();
  const { handleCloseModal } = props;
  const [protocolNumber, setProtocolNumber] = React.useState("");
  const [submissionDate, setSubmissionDate] = useState(Timestamp.now());
  const [reviewType, setReviewType] = React.useState("");
  const [researchType, setResearchType] = React.useState("");
  const [isCheckedHau, setIsCheckedHau] = useState(false);
  const [isCheckedOthers, setIsCheckedOthers] = useState(false);
  const [assignTo, setAssignTo] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isAnyCheckboxSelected, setIsAnyCheckboxSelected] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isDownloadSuccessful, setIsDownloadSuccessful] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = React.useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const formRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const db = getFirestore();
    const submissionsRef = collection(db, "submissions");
    const q = query(submissionsRef, where("uid", "==", props.uid));

    getDocs(q).then((querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const protocolNo = data[0].protocol_no;
      setProtocolNumber(protocolNo);

      const files = data[0].final_files.map((file, index) => ({
        id: index + 1,
        name: data[0].name,
        date_sent: new Date(
          data[0].date_sent.seconds * 1000 +
            data[0].date_sent.nanoseconds / 1000000
        ).toLocaleString(),
        ...file,
      }));
      if (data[0].completed) {
        setIsCompleted(true);
      }
      setSubmissions(files);
      setLoading(false);
    });
  }, [props.uid]);

  useEffect(() => {
    const db = getFirestore();
    const usersRef = collection(db, "users");
    getDocs(usersRef).then((querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(data);
    });
  }, []);

  const checkFormValidity = () => {
    const requiredFields = [assignTo];
    const isAllFieldsFilledOut = requiredFields.every((field) => !!field);
    const isCheckboxSelectedAndValid =
      isAnyCheckboxSelected && selectedRows.length > 0 && assignTo.length > 0;

    setIsFormValid(isAllFieldsFilledOut && isCheckboxSelectedAndValid);
  };

  useEffect(() => {
    setIsAnyCheckboxSelected(assignTo.length || selectedRows.length > 0);
    checkFormValidity();
  }, [assignTo, isAnyCheckboxSelected, selectedRows]);

  const handleSelectAll = () => {
    if (!selectAll) {
      // Select all users
      setAssignTo(
        users
          .filter(
            (user) => user.role === "scientist" || user.role === "non-scientist"
          )
          .map((user) => user.email)
      );
      setSelectAll(true);
      checkFormValidity();
    } else {
      // Deselect all users
      setAssignTo([]);
      setSelectAll(false);
    }
  };

  const handleAssignToChange = (event) => {
    if (event.target.value.includes("select-all")) {
      // "Select all" option was selected, toggle selectAll state
      setSelectAll(!selectAll);
      checkFormValidity();
    } else {
      // Other option was selected, update assignTo state
      setAssignTo(event.target.value);
      setSelectAll(false);
    }
  };

  const handleDownload = async (params) => {
    console.log(params.row.downloadLink);
    window.open(
      `${process.env.REACT_APP_BACKEND_URL}${params.row.downloadLink}`,
      "_blank"
    );
  };

  async function handleSubmit(event) {
    event.preventDefault();
    formRef.current.reset();
    checkFormValidity();
    if (isFormValid && isAnyCheckboxSelected) {
      setShowConfirmation(false);
      setShowSuccess(true);

      const db = getFirestore();
      const submissionsRef = collection(db, "submissions");
      const q = query(
        submissionsRef,
        where("uid", "==", props.uid),
        where("status", "==", "final")
      );

      getDocs(q).then((querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Update the first document in the query snapshot
        const docRef = doc(db, "submissions", data[0].id);
        updateDoc(docRef, {
          rev_date_sent: serverTimestamp(),
        });

        const updatedFinalFiles = data[0].final_files.map((file) => {
          if (selectedId.includes(file.id)) {
            return {
              ...file,
              forReview: true,
            };
          }
          return file;
        });

        updateDoc(docRef, {
          final_files: updatedFinalFiles,
        });
      });

      const notificationsRef = collection(db, "notifications");

      const newNotification = {
        id: doc(notificationsRef).id,
        message: `Protocol number: ${protocolNumber} has been forwarded for final review.`,
        read: false,
        recipientEmail: assignTo.join(", "),
        senderEmail: auth.currentUser.email,
        timestamp: serverTimestamp(),
      };
      await setDoc(doc(notificationsRef), newNotification);

      console.log({
        protocolNumber,
        reviewType,
        assignTo,
        isCheckedHau,
        isCheckedOthers,
      });
    } else {
      alert("Please select at least one checkbox");
    }
  }

  const handleOpenDownloadDialog = () => {
    if (isAnyCheckboxSelected) {
      setShowDownloadDialog(true);
    } else {
      setShowAlert(true);
    }
  };

  const handleCloseDownloadDialog = () => {
    setShowDownloadDialog(false);
    setShowAlert(false);
  };

  function modalhandleOpen() {
    setShowModal(true);
  }

  function modalhandleClose() {
    setShowModal(false);
  }

  const handleDownloadAll = async () => {
    const keys = [];
    for (const row of submissions) {
      keys.push(row.downloadLink.replace("/files/", ""));
    }

    fetch(`${process.env.REACT_APP_BACKEND_URL}/files/zip`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ keys: keys }),
    })
      .then((response) => {
        if (response.ok) {
          return response.blob();
        } else {
          throw new Error("Request failed");
        }
      })
      .then((blob) => {
        // Download the zip file
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "files.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleClose = () => {
    navigate("/adminapplication");
  };

  const downloadStyle = {
    color: "maroon",
  };

  const closeStyle = {
    color: "maroon",
    borderColor: "maroon",
  };

  const submitStyle = {
    color: "white",
    backgroundColor: "maroon",
  };

  const columns = [
    { field: "fieldname", headerName: "DocumentName", flex: 1 },
    { field: "name", headerName: "Sent By", flex: 1 },
    {
      field: "forReview",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => <span>{params.value ? "Forwarded" : ""}</span>,
    },
    { field: "date_sent", headerName: "Date Sent", flex: 1 },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => (
        <Button style={downloadStyle} onClick={() => handleDownload(params)}>
          Download
        </Button>
      ),
    },
  ];

  const [selectedId, setSelectedId] = useState([]);

  return (
    <div style={{ height: 400 }}>
      <DataGrid
        classes={{ header: "custom-header" }}
        rows={submissions}
        columns={columns}
        autoWidth
        disableHorizontalScroll
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
        pageSize={5}
        rowsPerPageOptions={[5]}
        checkboxSelection
        onSelectionModelChange={(newSelection) => {
          const selectedRowData = newSelection.map((id) =>
            submissions.find((row) => row.id === id)
          );
          setSelectedRows(selectedRowData);

          const id = selectedRowData.map((row) => row.id);
          setSelectedId(id);

          setIsAnyCheckboxSelected(newSelection.length > 0);
          checkFormValidity();
        }}
      />

      <div className="mt-[1rem]">
        {showAlert && !isDownloadSuccessful && (
          <Alert severity="warning" onClose={() => setShowAlert(false)}>
            Please select at least one document to download.
          </Alert>
        )}
      </div>
      <div className="flex justify-between mt-[1rem]">
        <Button
          variant="contained"
          size="medium"
          sx={{
            color: "white",
            backgroundColor: "maroon",
            "&:hover": {
              backgroundColor: "maroon",
            },
          }}
          onClick={handleDownloadAll}
        >
          Download All Files
        </Button>
        {!isCompleted && (
          <div>
            <Button
              size="medium"
              sx={{
                color: "white",
                backgroundColor: "maroon",
                "&:hover": {
                  backgroundColor: "maroon",
                },
              }}
              variant="contained"
              onClick={modalhandleOpen}
            >
              Transfer/Archive
            </Button>
            <Modal
              open={showModal}
              onClose={modalhandleClose}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Box sx={style}>
                <AdminTransfer uid={props.uid} />
              </Box>
            </Modal>
          </div>
        )}
      </div>
      {!isCompleted && (
        <Box
          ref={formRef}
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            setShowConfirmation(true);
          }}
        >
          <Box sx={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <FormControl fullWidth sx={{ marginBottom: "2rem" }}>
              <InputLabel id="assign-to-label">Assign To</InputLabel>
              <Select
                labelId="assign-to-label"
                id="assign-to"
                multiple
                value={assignTo}
                onChange={handleAssignToChange}
                label="Assign To"
                renderValue={(selected) => (
                  <div>
                    {selected.length === 0
                      ? "Select reviewers"
                      : selected.length === users.length
                      ? "All reviewers selected"
                      : `${selected.length} reviewers selected`}
                  </div>
                )}
              >
                <MenuItem key="select-all" value="select-all">
                  <Checkbox
                    checked={assignTo.length === users.length}
                    indeterminate={
                      assignTo.length > 0 && assignTo.length < users.length
                    }
                    onClick={handleSelectAll}
                  />
                  Select all
                </MenuItem>

                {users
                  .filter(
                    (user) =>
                      user.role === "scientist" || user.role === "non-scientist"
                  )
                  .map((user) => (
                    <MenuItem key={user.email} value={user.email}>
                      <Checkbox checked={assignTo.indexOf(user.email) > -1} />
                      {user.email}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>
          <div className="flex items-end justify-end space-x-2 pb-[2rem]">
            <Button
              style={closeStyle}
              onClick={handleCloseModal}
              variant="outlined"
            >
              Close
            </Button>
            <Button
              id="sub"
              type="submit"
              variant="contained"
              disabled={!isFormValid}
            >
              Forward
            </Button>
          </div>
          <Dialog
            open={showConfirmation}
            onClose={() => setShowConfirmation(false)}
          >
            <DialogTitle>Confirm Submit</DialogTitle>
            <DialogContent>
              <Typography variant="body1">
                Are you sure you want to forward the form?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button
                sx={{ color: "maroon" }}
                onClick={() => setShowConfirmation(false)}
              >
                Cancel
              </Button>
              <Button sx={{ color: "maroon" }} onClick={handleSubmit} autoFocus>
                Forward
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog open={showSuccess} onClose={() => setShowSuccess(false)}>
            <DialogTitle>Success!</DialogTitle>
            <DialogContent>
              <Typography variant="body1">
                You have successfully transferred the files.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button sx={{ color: "maroon" }} onClick={handleClose}>
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
      <Dialog open={showDownloadDialog} onClose={handleCloseDownloadDialog}>
        <DialogTitle>Download Selected Files</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you want to download all the selected files?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button sx={{ color: "maroon" }} onClick={handleCloseDownloadDialog}>
            Cancel
          </Button>
          <Button sx={{ color: "maroon" }} onClick={handleDownloadAll}>
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Finaltab;
