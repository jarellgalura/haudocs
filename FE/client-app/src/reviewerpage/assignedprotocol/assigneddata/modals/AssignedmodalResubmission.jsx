import React, { useState, useEffect } from "react";
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
import {
  collection,
  doc,
  updateDoc,
  getDocs,
  query,
  where,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore/lite";
import { db, auth } from "../../../../firebase";
import { getFirestore } from "firebase/firestore/lite";
import { onAuthStateChanged } from "firebase/auth";
import CircularProgress from "@mui/material/CircularProgress";

const AssignedmodalResubmission = (props) => {
  const navigate = useNavigate();
  const [value, setValue] = React.useState(0);
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

      const files = data[0].resubmission_files
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

  const columns = [
    { field: "filename", headerName: "DocumentName", flex: 1 },

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
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          setShowConfirmation(true);
        }}
      >
        <div className="mt-[1rem]">
          {showAlert && !isDownloadSuccessful && (
            <Alert severity="warning" onClose={() => setShowAlert(false)}>
              Please select at least one document to download.
            </Alert>
          )}
        </div>

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
        </div>
      </Box>
    </div>
  );
};

export default AssignedmodalResubmission;
