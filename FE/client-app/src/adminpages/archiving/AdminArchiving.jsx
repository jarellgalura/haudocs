import React from "react";
import Adminsidebar from "../Adminsidebar";
import Button from "@mui/material/Button";
import { DataGrid } from "@mui/x-data-grid";
import "./archiving.css";
import { Box } from "@mui/system";

const Archiving = () => {
  const columns = [
    { field: "protocol_no", headerName: "Protocol Number", flex: 1 },
    { field: "review_type", headerName: "Review Type", flex: 1 },
    { field: "reviewer", headerName: "Reviewer", flex: 1 },
    { field: "date", headerName: "Date Completed", flex: 1 },
    {
      field: "action",
      headerName: "Action",
      renderCell: (params) => <ViewCell {...params} />,
      width: 180,
    },
  ];

  function ViewCell(props) {
    return <Button>View</Button>;
  }

  const rows = [];

  return (
    <Adminsidebar>
      <div className="archivingdatatable">
        <h1 className="text-center text-2xl font-bold">Archiving</h1>
        <Box sx={{ height: 400, marginTop: 4 }}>
          <DataGrid
            rows={rows}
            autoWidth
            disableHorizontalScroll
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
