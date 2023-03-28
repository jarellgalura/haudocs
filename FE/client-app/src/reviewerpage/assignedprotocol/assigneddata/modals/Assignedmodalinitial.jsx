import React, { useState } from "react";
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
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "../../../../firebase";
import IconButton from "@mui/material/IconButton";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import "../../assignedprotocol.css";

const Assignedmodalinitial = (props) => {
  const navigate = useNavigate();
  const [value, setValue] = React.useState(0);
  const [files, setFiles] = useState([{ id: 1, file: null }]);
  const [open, setOpen] = useState(false);
  const { handleCloseModal } = props;
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const [selectedRows, setSelectedRows] = React.useState([]);
  const [showDownloadDialog, setShowDownloadDialog] = React.useState(false);
  const [isAnyCheckboxSelected, setIsAnyCheckboxSelected] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [isDownloadSuccessful, setIsDownloadSuccessful] = useState(false);

  const handleFileUpload = (event, id) => {
    const file = event.target.files[0];
    const newFiles = [...files];
    const index = newFiles.findIndex((file) => file.id === id);
    newFiles[index].file = file;
    setFiles(newFiles);
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

  const rows = [
    {
      id: "Research Proposal",
      documentname: "Research Proposal",
      sentby: "Stephanie David",
      datesent: "January 28, 2023",
    },
    {
      id: "Questionnaires Tools",
      documentname: "Questionnaire/s/Tools",
      sentby: "Stephanie David",
      datesent: "January 28, 2023",
    },
    {
      id: "Informed consent assent form",
      documentname: "Informed consent/assentform",
      sentby: "Stephanie David",
      datesent: "January 28, 2023",
    },
    {
      id: "NCIP clearance",
      documentname:
        "NCIP clearance (for studies involving indigenous groups)(if needed)",
      sentby: "Stephanie David",
      datesent: "January 28, 2023",
    },
    {
      id: "HAU-IRB FORM 4.1(A) Protocol Assessment Form",
      documentname: "HAU-IRB FORM 4.1(A) Protocol Assessment Form",
      sentby: "Stephanie David",
      datesent: "January 28, 2023",
    },
    {
      id: "HAU-IRB FORM 4.1(B) Informed Consent Assessment Form",
      documentname: "HAU-IRB FORM 4.1(B) Informed Consent Assessment Form",
      sentby: "Stephanie David",
      datesent: "January 28, 2023",
    },
  ];

  const handleDownload = async (id) => {
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
    for (const row of rows) {
      if (selectedRows.includes(row.id)) {
        await handleDownload(row.id);
      }
    }
    setShowDownloadDialog(false);
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
        checkboxSelection
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
        <DialogContent>
          <form>
            <Grid container spacing={2}>
              {files.map((file) => (
                <Grid item xs={12} key={file.id}>
                  <input
                    type="file"
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
          </form>
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
            id="sub"
            type="submit"
            disabled={!isSubmitEnabled}
            variant="contained"
          >
            Forward
          </Button>
        </div>
        <Dialog
          open={showConfirmation}
          onClose={() => setShowConfirmation(false)}
        >
          <DialogTitle>Confirm Forward</DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Are you sure you want to forward the reviewed forms?
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
