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
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { auth } from "../../../../../firebase";

const Initialtab = (props) => {
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

  useEffect(() => {
    const db = getFirestore();
    const submissionsRef = collection(db, "submissions");
    const q = query(submissionsRef, where("uid", "==", props.uid));

    getDocs(q).then((querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const files = data[0].initial_files.map((file, index) => ({
        id: index + 1,
        name: data[0].name,
        date_sent: new Date(
          data[0].date_sent.seconds * 1000 +
            data[0].date_sent.nanoseconds / 1000000
        ).toLocaleString(),
        status_indicator: data[0].status_indicator,
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

  const checkFormValidity = () => {
    const requiredFields = [protocolNumber, reviewType, assignTo, researchType];
    const isAllFieldsFilledOut = requiredFields.every((field) => !!field);
    const isAnyCheckboxSelected = isCheckedHau || isCheckedOthers;
    const isCheckboxSelectedAndValid =
      isAnyCheckboxSelected && selectedRows.length > 0;

    setIsFormValid(isAllFieldsFilledOut && isCheckboxSelectedAndValid);
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

  const handleResearchTypeChange = (event) => {
    setResearchType(event.target.value);
    checkFormValidity();
  };

  const handleDateChange = (date) => {
    setSubmissionDate(date);
    checkFormValidity();
  };

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
    } else {
      // Deselect all users
      setAssignTo([]);
      setSelectAll(false);
    }
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
    if (event.target.value.includes("select-all")) {
      // "Select all" option was selected, toggle selectAll state
      setSelectAll(!selectAll);
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
          rev_date_sent: serverTimestamp(),
          protocol_no: protocolNumber,
          review_type: reviewType,
          research_type: researchType,
          due_date: Timestamp.fromDate(submissionDate.toDate()),
          reviewer: assignTo,
          school: isCheckedHau ? "HAU" : "Others",
        });

        const updatedInitialFiles = data[0].initial_files.map((file) => {
          if (selectedId.includes(file.id)) {
            return {
              ...file,
              status_indicator: "Forwarded",
              forReview: true,
            };
          }
          return file;
        });

        updateDoc(docRef, {
          initial_files: updatedInitialFiles,
        });
      });

      const notificationsRef = collection(db, "notifications");

      // Check if all users have been selected
      if (assignTo.length === users.length) {
        const newNotification = {
          id: doc(notificationsRef).id,
          message: `There's a forwarded form for you to review.`,
          read: false,
          recipientEmail: "all",
          senderEmail: auth.currentUser.email,
          timestamp: serverTimestamp(),
        };
        await setDoc(doc(notificationsRef), newNotification);
      } else {
        const newNotification = {
          id: doc(notificationsRef).id,
          message: `There's a forwarded form for you to review.`,
          read: false,
          recipientEmail: assignTo.join(", "),
          senderEmail: auth.currentUser.email,
          timestamp: serverTimestamp(),
        };
        await setDoc(doc(notificationsRef), newNotification);
      }

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

  const handleDownloadAll = async () => {
    for (const row of submissions) {
      if (selectedRows.includes(row.id)) {
        await handleDownload(row.id);
      }
    }
    setShowDownloadDialog(false);
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
    { field: "fieldname", headerName: "DocumentName", width: "180" },
    { field: "name", headerName: "Sent By", width: "175" },
    { field: "status_indicator", headerName: "Status", width: "200" },
    { field: "date_sent", headerName: "Date Sent", width: "200" },
    {
      field: "action",
      headerName: "Action",
      width: "100",
      renderCell: (params) => (
        <Button style={downloadStyle} onClick={() => handleDownload(params)}>
          Download
        </Button>
      ),
    },
  ];

  const [selectedId, setSelectedId] = useState([]);

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
          onClick={handleOpenDownloadDialog}
        >
          Download
        </Button>
      </div>
      <Box
        ref={formRef}
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          setShowConfirmation(true);
        }}
      >
        <Box sx={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isCheckedHau}
                onChange={handleCheckboxChange}
                name="Hau"
              />
            }
            label="HAU"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isCheckedOthers}
                onChange={handleCheckboxChange}
                name="Others"
              />
            }
            label="Others"
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <TextField
            required
            className="no-outline"
            label="Protocol Number"
            value={protocolNumber}
            onChange={handleProtocolNumberChange}
          />

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker value={submissionDate} onChange={handleDateChange} />
          </LocalizationProvider>

          <Box required sx={{ display: "flex", gap: "1rem" }}>
            <FormControl sx={{ width: "100%" }}>
              <InputLabel>Review Type</InputLabel>
              <Select
                label="Review Type"
                value={reviewType}
                onChange={handleReviewTypeChange}
              >
                <MenuItem value="Full Board Review">Full Board Review</MenuItem>
                <MenuItem value="Expedited Review">Expedited Review</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box required sx={{ display: "flex", gap: "1rem" }}>
            <FormControl sx={{ width: "100%" }}>
              <InputLabel>Research Type</InputLabel>
              <Select
                label="ResearchType"
                value={researchType}
                onChange={handleResearchTypeChange}
              >
                <MenuItem value="Biomedical Studies">
                  Biomedical Studies
                </MenuItem>
                <MenuItem value="Health Operations Research">
                  Health Operations Research
                </MenuItem>
                <MenuItem value="Clinical Trials">Clinical Trials</MenuItem>
                <MenuItem value="Public Health Research">
                  Public Health Research
                </MenuItem>
                <MenuItem value="Social Research">Social Research</MenuItem>
              </Select>
            </FormControl>
          </Box>
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

export default Initialtab;
