import React, { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "../../../../firebase";

const AssignedmodalFinal = (props) => {
  const navigate = useNavigate();
  const [value, setValue] = React.useState(0);
  const [fileUploads, setfileUpload] = useState(null);
  const [open, setOpen] = useState(false);
  const { handleCloseModal } = props;
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setIsSubmitEnabled(true);
    setSelectedFiles(files);
    const newFileUploads = [...fileUploads];

    for (let i = 0; i < files.length; i++) {
      newFileUploads.push(files[i]);
    }

    setfileUpload(newFileUploads);

    const fileNames = files.map((file) => file.name).join(", ");
    document.getElementById("multiple_files").value = fileNames;
  };

  const rows = [
    {
      id: "HAU-IRB FORM 3.7(A) Final Report Form",
      documentname: "HAU-IRB FORM 3.7(A): Final Report Form",
      sentby: "Stephanie David",
      datesent: "January 28, 2023",
    },
  ];

  const columns = [
    { field: "documentname", headerName: "DocumentName", width: "550" },

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

  const handleDownload = async (id) => {
    // Get the reference to the file you want to download
    const fileRef = ref(storage, `Submissions/${id}.docx`);

    try {
      // Get the download URL for the file
      const downloadURL = await getDownloadURL(fileRef);
      // Open the file in a new tab/window
      window.open(downloadURL, "_blank");
    } catch (error) {
      console.error(error);
    }
  };
  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  function handlesSuccess() {
    setShowSuccess(true);
    setShowConfirmation(false);
  }

  function handleSubmit() {
    navigate("/reviewerstatus");
    setOpen(false);
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
    <div style={{ height: 400, width: "100%" }}>
      <DataGrid
        classes={{ header: "custom-header" }}
        rows={rows}
        columns={columns}
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
        <input
          class="mt-[1rem] block w-full mb-5 text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          id="multiple_files"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileUpload}
        />
        <div className="flex items-end justify-end space-x-2">
          <Button
            onClick={handleCloseModal}
            style={closeStyle}
            variant="outlined"
          >
            Close
          </Button>
          <Button
            id="sub"
            disabled={!isSubmitEnabled}
            type="submit"
            variant="contained"
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
            <Button sx={{ color: "maroon" }} onClick={handlesSuccess} autoFocus>
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
            <Button sx={{ color: "maroon" }} onClick={handleSubmit}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </div>
  );
};

export default AssignedmodalFinal;
