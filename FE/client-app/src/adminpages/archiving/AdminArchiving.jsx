import React from "react";
import Adminsidebar from "../Adminsidebar";
import Button from "@mui/material/Button";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import "./archiving.css";
import { Box } from "@mui/system";

const Archiving = () => {
  // Sample data
  const columns = [
    { field: "applicantname", headerName: "Applicant Name", width: 230 },
    { field: "documentname", headerName: "Document Name", width: 230 },
    { field: "reviewer", headerName: "Reviewer", width: 230 },
    { field: "date", headerName: "Date", width: 190 },
    {
      field: "action",
      headerName: "Action",
      renderCell: (params) => <DeleteCell {...params} />,
      width: 180,
    },
  ];

  function DeleteCell(props) {
    const handleDelete = () => {};

    return (
      <Button style={deleteStyle} startIcon={<DeleteIcon />}>
        Delete
      </Button>
    );
  }

  const deleteStyle = {
    color: "maroon",
    borderColor: "maroon",
  };

  const rows = [];

  return (
    <Adminsidebar>
      <div className="archivingdatatable">
        <h1 className="text-center text-2xl font-bold">Archiving</h1>
        <Box sx={{ height: 500, width: "100%", marginTop: 5 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
          />
        </Box>
      </div>
    </Adminsidebar>
  );
};

export default Archiving;
