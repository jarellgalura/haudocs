import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "../../../../../firebase";

const Continuing = (props) => {
  const { handleCloseModal } = props;

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
      documentname: "HAU-IRB FORM 3.5(B): Reportable Negative Events Form",
      sentby: "Stephanie David",
      datesent: "January 28, 2023",
    },
    {
      id: "HAU-IRB FORM 3.6(A) Application for Continuing Review",
      documentname: "HAU-IRB FORM 3.6(A) Application for Continuing Review",
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
    <div style={{ height: 400, width: "100%" }}>
      <DataGrid
        classes={{ header: "custom-header" }}
        rows={rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        checkboxSelection
      />
      <div className="flex items-end justify-end mt-[1rem]">
        <Button
          onClick={handleCloseModal}
          style={closeStyle}
          variant="outlined"
        >
          Close
        </Button>
      </div>
    </div>
  );
};

export default Continuing;
