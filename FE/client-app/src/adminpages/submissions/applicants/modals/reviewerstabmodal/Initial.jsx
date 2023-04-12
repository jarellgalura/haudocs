import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "../../../../../firebase";
import {
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Alert,
} from "@mui/material";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import CircularProgress from "@mui/material/CircularProgress";

const Initial = (props) => {
  const { handleCloseModal } = props;
  const [selectedRows, setSelectedRows] = React.useState([]);
  const [showDownloadDialog, setShowDownloadDialog] = React.useState(false);
  const [isAnyCheckboxSelected, setIsAnyCheckboxSelected] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [isDownloadSuccessful, setIsDownloadSuccessful] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getFirestore();
    const submissionsRef = collection(db, "submissions");
    const q = query(submissionsRef, where("uid", "==", props.uid));

    getDocs(q).then((querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const files = data[0].rev_initial_files.map((file, index) => ({
        id: index + 1,
        name: data[0].name,
        date_sent: new Date(
          data[0].date_sent.seconds * 1000 +
            data[0].date_sent.nanoseconds / 1000000
        ).toLocaleString(),
        ...file,
        sent_by: data[0].sent_by,
      }));
      setSubmissions(files);
      setLoading(false);
    });
  }, [props.uid]);

  const handleDownload = async (id) => {
    const fileRef = ref(storage, `Submissions/${id}.docx`);
    try {
      // Get the download URL for the file
      const downloadURL = await getDownloadURL(fileRef);
      window.open(downloadURL, "_blank");
      setIsDownloadSuccessful(true);
    } catch (error) {
      console.error(error);
    }
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

  const columns = [
    { field: "filename", headerName: "DocumentName", flex: 1 },
    { field: "sent_by", headerName: "Sent By", flex: 1 },
    { field: "date_sent", headerName: "Date Sent", flex: 1 },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => (
        <Button style={downloadStyle} onClick={() => handleDownload(params.id)}>
          Download
        </Button>
      ),
    },
  ];

  const closeStyle = {
    color: "maroon",
    borderColor: "maroon",
  };

  const downloadStyle = {
    color: "maroon",
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
        selectionModel={selectedRows}
        onSelectionModelChange={(newSelection) => {
          setSelectedRows(newSelection);
          setIsAnyCheckboxSelected(newSelection.length > 0);
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
          Download All Files
        </Button>
        <Button
          onClick={handleCloseModal}
          style={closeStyle}
          variant="outlined"
        >
          Close
        </Button>
      </div>
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

export default Initial;
