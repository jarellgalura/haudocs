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
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import "../tabmodal.css";
import { useNavigate } from "react-router-dom";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore/lite";

const Continuingtab = (props) => {
  const navigate = useNavigate();
  const { handleCloseModal } = props;
  const [protocolNumber, setProtocolNumber] = React.useState("");
  const [reviewType, setReviewType] = React.useState("");
  const [isCheckedHau, setIsCheckedHau] = React.useState(false);
  const [isCheckedOthers, setIsCheckedOthers] = React.useState(false);
  const [assignTo, setAssignTo] = React.useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isAnyCheckboxSelected, setIsAnyCheckboxSelected] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isDownloadSuccessful, setIsDownloadSuccessful] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = React.useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const formRef = useRef(null);
  const [submissions, setSubmissions] = useState([]);
  const [users, setUsers] = useState(null);

  console.log(submissions);

  useEffect(() => {
    const db = getFirestore();
    const submissionsRef = collection(db, "submissions");
    const q = query(submissionsRef, where("uid", "==", props.uid));

    getDocs(q).then((querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const files = data[0].files.map((file, index) => ({
        id: index + 1,
        name: data[0].name,
        date_sent: new Date(
          data[0].date_sent.seconds * 1000 +
            data[0].date_sent.nanoseconds / 1000000
        ).toLocaleString(),
        ...file,
      }));
      setSubmissions(files);
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

  const columns = [
    { field: "documentname", headerName: "DocumentName", width: "180" },
    { field: "sentby", headerName: "Sent By", width: "175" },
    { field: "datesent", headerName: "Date Sent", width: "200" },
    {
      field: "action",
      headerName: "Action",
      width: "100",
      renderCell: (params) => (
        <Button style={downloadStyle} onClick={() => handleDownload(params.id)}>
          Download
        </Button>
      ),
    },
  ];

  const checkFormValidity = () => {
    const requiredFields = [protocolNumber, reviewType, assignTo];
    const isAllFieldsFilledOut = requiredFields.every((field) => !!field);
    const isAnyCheckboxSelected = isCheckedHau || isCheckedOthers;
    const isCheckboxSelectedAndValid =
      isAnyCheckboxSelected && selectedRows.length > 0;

    setIsFormValid(
      isAllFieldsFilledOut && isCheckboxSelectedAndValid && !!protocolNumber
    );
  };

  useEffect(() => {
    setIsAnyCheckboxSelected(
      isCheckedHau || isCheckedOthers || selectedRows.length > 0
    );
    checkFormValidity();
  }, [
    isCheckedHau,
    isCheckedOthers,
    isAnyCheckboxSelected,
    selectedRows,
    submissions,
  ]);

  const handleProtocolNumberChange = (event) => {
    setProtocolNumber(event.target.value);
    checkFormValidity();
  };

  const handleReviewTypeChange = (event) => {
    setReviewType(event.target.value);
    checkFormValidity();
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;

    if (name === "Hau") {
      setIsCheckedHau(checked);
      setIsCheckedOthers(false); // uncheck Others checkbox
    } else if (name === "Others") {
      setIsCheckedOthers(checked);
      setIsCheckedHau(false); // uncheck Hau checkbox
    }
    checkFormValidity();
  };

  const handleAssignToChange = (event) => {
    setAssignTo(event.target.value);
  };

  const handleDownload = async (params) => {
    console.log(params.row.downloadLink);
    window.open(
      `${process.env.REACT_APP_BACKEND_URL}${params.row.downloadLink}`,
      "_blank"
    );
  };

  const handleOpenDownloadDialog = () => {
    if (isAnyCheckboxSelected) {
      setShowDownloadDialog(true);
    } else {
      setShowAlert(true);
    }
  };

  const handleCloseDownloadDialog = () => {
    setShowDownloadDialog(false);
  };

  const handleDownloadAll = async () => {
    for (const row of submissions) {
      if (selectedRows.includes(row.id)) {
        await handleDownload(row.id);
      }
    }
    setShowDownloadDialog(false);
  };

  const handleSubmit = (event) => {
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
        where("status", "==", "initial")
      );

      getDocs(q).then((querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Update the first document in the query snapshot
        const docRef = doc(db, "submissions", data[0].id);
        updateDoc(docRef, {
          protocol_no: protocolNumber,
          review_type: reviewType,
          reviewer: assignTo,
          school: isCheckedHau ? "HAU" : "Others",
        });
      });

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
  return (
    <div style={{ height: 400, width: "100%" }}>
      <DataGrid
        classes={{ header: "custom-header" }}
        rows={submissions}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        checkboxSelection
        onSelectionModelChange={(newSelection) => {
          setSelectedRows(newSelection);
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
          onClick={handleOpenDownloadDialog}
        >
          Download
        </Button>
      </div>
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          setShowConfirmation(true);
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            marginTop: "1rem",
          }}
        >
          <FormControl required sx={{ minWidth: 120, marginBottom: "2rem" }}>
            <InputLabel>Assign To</InputLabel>
            <Select value={assignTo} onChange={handleAssignToChange}>
              {users &&
                users
                  .filter(
                    (user) =>
                      user.role === "scientist" || user.role === "non-scientist"
                  )
                  .map((user, index) => (
                    <MenuItem key={user.id} value={user.id}>
                      Reviewer {index + 1}
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
            onClick={() => setShowConfirmation(true)}
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

export default Continuingtab;
