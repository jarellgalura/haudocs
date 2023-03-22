import React, { useState, useEffect } from "react";
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
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "../../../../../firebase";

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

    const rows = [
        {
            id: "HAU-IRB FORM 3.1(A) Progress Report Form",
            documentname: "HAU-IRB FORM 3.1(A): Progress Report Form",
            sentby: "Stephanie David",
            datesent: "January 28, 2023",
        },
        {
            id: "HAU-IRB FORM 3.2(A) Early Termination Report Form",
            documentname: "HAU-IRB FORM 3.2(A): Early Termination Report Form",
            sentby: "Stephanie David",
            datesent: "January 28, 2023",
        },
        {
            id: "HAU-IRB FORM 3.3(A) Amendment Review Form",
            documentname: "HAU-IRB FORM 3.3(A): Amendment Review Form",
            sentby: "Stephanie David",
            datesent: "January 28, 2023",
        },
        {
            id: "HAU-IRB FORM 3.4(A) Protocol DeviationViolation Report Form",
            documentname:
                "HAU-IRB FORM 3.4(A): Protocol DeviationViolation Report Form",
            sentby: "Stephanie David",
            datesent: "January 28, 2023",
        },
        {
            id: "HAU-IRB FORM 3.5(A) Serious Adverse Event Form",
            documentname: "HAU-IRB FORM 3.5(A): Serious Adverse Event Form",
            sentby: "Stephanie David",
            datesent: "January 28, 2023",
        },
        {
            id: "HAU-IRB FORM 3.5(B) Reportable Negative Events Form",
            documentname:
                "HAU-IRB FORM 3.5(B): Reportable Negative Events Form",
            sentby: "Stephanie David",
            datesent: "January 28, 2023",
        },
        {
            id: "HAU-IRB FORM 3.6(A) Application for Continuing Review",
            documentname:
                "HAU-IRB FORM 3.6(A) Application for Continuing Review",
            sentby: "Stephanie David",
            datesent: "January 28, 2023",
        },
    ];

    const columns = [
        { field: "documentname", headerName: "DocumentName", width: "180" },
        { field: "sentby", headerName: "Sent By", width: "175" },
        { field: "datesent", headerName: "Date Sent", width: "200" },
        {
            field: "action",
            headerName: "Action",
            width: "100",
            renderCell: (params) => (
                <Button
                    style={downloadStyle}
                    onClick={() => handleDownload(params.id)}
                >
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
            isAllFieldsFilledOut &&
                isCheckboxSelectedAndValid &&
                !!protocolNumber
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
        rows,
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

    const handleDownload = async (id) => {
        console.log(id);

        // const fileRef = ref(storage, `Submissions/${id}.docx`);
        // try {
        //   // Get the download URL for the file
        //   const downloadURL = await getDownloadURL(fileRef);
        //   window.open(downloadURL, "_blank");
        //   setIsDownloadSuccessful(true);
        // } catch (error) {
        //   console.error(error);
        // }
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

    const handleSubmit = (event) => {
        event.preventDefault();
        checkFormValidity();
        if (isFormValid && isAnyCheckboxSelected) {
            setShowConfirmation(false);
            setShowSuccess(true);
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
                rows={rows}
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
                    <Alert
                        severity="warning"
                        onClose={() => setShowAlert(false)}
                    >
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
                <Box sx={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isCheckedHau}
                                onChange={handleCheckboxChange}
                                name="Hau"
                            />
                        }
                        label="Hau"
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
                        label="Protocol Number"
                        value={protocolNumber}
                        onChange={handleProtocolNumberChange}
                    />
                    <Box sx={{ display: "flex", gap: "1rem" }}>
                        <FormControl sx={{ width: "100%" }}>
                            <InputLabel>Review Type</InputLabel>
                            <Select
                                value={reviewType}
                                onChange={handleReviewTypeChange}
                            >
                                <MenuItem value="Type A">
                                    Full Board Review
                                </MenuItem>
                                <MenuItem value="Type B">
                                    Expedited Review
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <FormControl sx={{ minWidth: 120, marginBottom: "2rem" }}>
                        <InputLabel>Assign To</InputLabel>
                        <Select
                            value={assignTo}
                            onChange={handleAssignToChange}
                        >
                            <MenuItem value="Person A">Person A</MenuItem>
                            <MenuItem value="Person B">Person B</MenuItem>
                            <MenuItem value="Person C">Person C</MenuItem>
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
                        <Button
                            sx={{ color: "maroon" }}
                            onClick={handleSubmit}
                            autoFocus
                        >
                            Forward
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={showSuccess}
                    onClose={() => setShowSuccess(false)}
                >
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
            <Dialog
                open={showDownloadDialog}
                onClose={handleCloseDownloadDialog}
            >
                <DialogTitle>Download Selected Files</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Do you want to download all the selected files?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        sx={{ color: "maroon" }}
                        onClick={handleCloseDownloadDialog}
                    >
                        Cancel
                    </Button>
                    <Button
                        sx={{ color: "maroon" }}
                        onClick={handleDownloadAll}
                    >
                        Download
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Continuingtab;
