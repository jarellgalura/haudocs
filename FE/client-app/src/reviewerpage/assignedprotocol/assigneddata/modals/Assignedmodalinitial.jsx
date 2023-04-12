import React, { useState, useEffect, useRef } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography,
  Box,
  Alert,
  Grid,
  TextField,
  InputAdornment,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import "../../assignedprotocol.css";
import {
  collection,
  doc,
  updateDoc,
  getDocs,
  query,
  where,
  setDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore/lite";
import { db, auth } from "../../../../firebase";
import { getFirestore } from "firebase/firestore/lite";
import { onAuthStateChanged } from "firebase/auth";
import CircularProgress from "@mui/material/CircularProgress";

const Assignedmodalinitial = (props) => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([{ id: 1, file: null }]);
  const [open, setOpen] = useState(false);
  const { handleCloseModal } = props;
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = React.useState(false);
  const [isAnyCheckboxSelected, setIsAnyCheckboxSelected] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [isDownloadSuccessful, setIsDownloadSuccessful] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userName, setUserName] = useState(null);
  const formRef = useRef(null);
  const [filesUploaded, setFilesUploaded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setCurrentUser(currentUser);

      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);

        getDoc(userRef).then((doc) => {
          if (doc.exists()) {
            const name = doc.data().name;
            setUserName(name);
            localStorage.setItem("userName", name);
          }
        });
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const db = getFirestore();
    const submissionsRef = collection(db, "submissions");
    const q = query(
      submissionsRef,
      where("protocol_no", "==", props.protocol_no)
    );

    getDocs(q).then((querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const files = data[0].initial_files
        .filter((file) => file.forReview)
        .map((file, index) => ({
          id: index + 1,
          name: data[0].name,
          date_sent: new Date(
            data[0].date_sent.seconds * 1000 +
              data[0].date_sent.nanoseconds / 1000000
          ).toLocaleString(),
          ...file,
        }));
      setSubmissions(files);
      setLoading(false);
      console.log(files);
    });
  }, [auth.currentUser.uid]);

  async function handleSubmit(e) {
    e.preventDefault();
    // Create a new FormData instance
    const form = new FormData();
    setShowConfirmation(false);
    setShowSuccess(true);

    // Append the files to the FormData instance
    files.forEach((fileObj, index) => {
      if (fileObj.file) {
        form.append(`file_${index}`, fileObj.file);
      }
    });

    // Perform the fetch request
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/files`,
        {
          method: "POST",
          headers: {
            filefolder: `${auth.currentUser.uid}/initial`,
          },
          body: form,
        }
      );

      const data = await response.json();
      console.log(data);

      const submissionsRef = collection(db, "submissions");
      const q = query(
        submissionsRef,
        where("protocol_no", "==", props.protocol_no)
      );
      const querySnapshot = await getDocs(q);

      // Check if the submission exists
      if (!querySnapshot.empty) {
        // Get the first matching document (there should be only one)
        const docSnapshot = querySnapshot.docs[0];

        // Get the current date as a UNIX timestamp
        const currentDate = Date.now();

        // Offset the current date to GMT+8
        const offsetHours = 8;
        const offsetMilliseconds = offsetHours * 60 * 60 * 1000;
        const currentDateGMT8 = currentDate + offsetMilliseconds;

        // Add the offset current date to each file in the data.files array
        const filesWithDate = data.files.map((file) => ({
          ...file,
          upload_date: currentDateGMT8, // Add the offset current date as a UNIX timestamp
        }));

        // Get the existing rev_initial_files array or an empty array if it doesn't exist
        const existingReviewerFiles =
          docSnapshot.data().rev_initial_files || [];

        // Concatenate the existing and new files arrays
        const updatedReviewerFiles =
          existingReviewerFiles.concat(filesWithDate);

        // Get the current user's email
        const sentBy = auth.currentUser.email;

        // Update the document with the updated rev_initial_files and sent_by
        const submissionRef = doc(db, "submissions", docSnapshot.id);
        await updateDoc(submissionRef, {
          rev_initial_files: updatedReviewerFiles,
          sent_by: sentBy,
          rev_to_admin_sent_date: serverTimestamp(),
        });
        console.log("Document updated with ID: ", docSnapshot.id);
        const notificationsRef = collection(db, "notifications");
        const adminUsersQuery = query(
          collection(db, "users"),
          where("role", "==", "admin")
        );
        const adminUsersSnapshot = await getDocs(adminUsersQuery);
        const adminEmails = adminUsersSnapshot.docs.map(
          (doc) => doc.data().email
        );

        adminEmails.forEach(async (email) => {
          const newNotification = {
            id: doc(notificationsRef).id,
            message: `Reviewer ${userName} has submitted an initial review for protocol ${props.protocol_no}.`,
            read: false,
            recipientEmail: email,
            senderEmail: auth.currentUser.email,
            timestamp: serverTimestamp(),
          };
          await setDoc(doc(notificationsRef), newNotification);
        });
      } else {
        console.log("No submission found with the given protocol_no");
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  const handleFileUpload = (event, id) => {
    const file = event.target.files[0];
    const newFiles = [...files];
    const index = newFiles.findIndex((file) => file.id === id);
    newFiles[index].file = file;
    setFiles(newFiles);
    setFilesUploaded(true);
  };

  const handleAddFile = () => {
    const newFiles = [...files];
    newFiles.push({ id: newFiles.length + 1, file: null });
    setFiles(newFiles);
  };

  const handleRemoveFile = (id) => {
    const newFiles = files.filter((file) => file.id !== id);
    setFiles(newFiles);
  };

  const columns = [
    { field: "fieldname", headerName: "DocumentName", flex: 1 },

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

  function handlesSuccess() {
    setShowSuccess(true);
    setShowConfirmation(false);
  }

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
    <div style={{ height: 400 }}>
      <DataGrid
        classes={{ header: "custom-header" }}
        rows={submissions}
        columns={columns}
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
        pageSize={5}
        rowsPerPageOptions={[5]}
      />

      <div className="mt-[1rem]">
        {showAlert && !isDownloadSuccessful && (
          <Alert severity="warning" onClose={() => setShowAlert(false)}>
            Please select at least one document to download.
          </Alert>
        )}
      </div>

      <Box
        ref={formRef}
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          setShowConfirmation(true);
        }}
      >
        <DialogContent>
          <div className="flex flex-col">
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
            <Grid sx={{ marginTop: "1rem" }} container spacing={2}>
              {files.map((file) => (
                <Grid item xs={12} key={file.id}>
                  <input
                    type="file"
                    required
                    variant="outlined"
                    onChange={(event) => handleFileUpload(event, file.id)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => handleRemoveFile(file.id)}>
                            <RemoveIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              ))}
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  sx={{
                    color: "maroon",
                    borderColor: "maroon",
                    "&:hover": {
                      backgroundColor: "maroon",
                      color: "white",
                      borderColor: "maroon",
                    },
                  }}
                  startIcon={<AddIcon />}
                  onClick={handleAddFile}
                >
                  Add More
                </Button>
              </Grid>
            </Grid>
          </div>
        </DialogContent>

        <div className="flex items-end justify-end space-x-2 pb-[2rem]">
          <Button
            onClick={handleCloseModal}
            style={closeStyle}
            variant="outlined"
          >
            Close
          </Button>
          <Button
            onClick={() => setShowConfirmation(true)}
            id="sub"
            variant="contained"
            disabled={!filesUploaded}
          >
            SUBMIT
          </Button>
        </div>
        <Dialog
          open={showConfirmation}
          onClose={() => setShowConfirmation(false)}
        >
          <DialogTitle>Confirm Forward</DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Are you sure you want to submit the files?
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
        <Dialog
          open={showSuccess}
          onClose={() => {
            setShowSuccess(false);
            navigate("/reviewerstatus");
          }}
        >
          <DialogTitle>Success!</DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              You have successfully transferred the files.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              sx={{ color: "maroon" }}
              onClick={() => {
                navigate("/reviewerstatus");
                setOpen(false);
              }}
            >
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

export default Assignedmodalinitial;
