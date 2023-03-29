import React from "react";
import Adminsidebar from "../Adminsidebar";
import "./application.css";
import { DataGrid } from "@mui/x-data-grid";

const AdminApplication = () => {
  // Sample data
  const columns = [
    { field: "protocolnumber", headerName: "Protocol Number", width: 300 },
    { field: "reviewetype", headerName: "Review Type", width: 300 },
    {
      field: "datesent",
      headerName: "Date Sent",
      width: 200,
    },
    {
      field: "reviewer",
      headerName: "Reviewer",
      width: 200,
    },
    {
      field: "status",
      headerName: "Status",
    },
  ];

  const rows = [
    {
      id: "",
      protocolnumber: "2023-001-NAME-TITLE",
      reviewtype: "",
      datesent: "February 14, 2023",
      reviewer: "Person A",
      status: "Initial",
    },
  ];
  return (
    <Adminsidebar>
      <div className="adminreviewdatatable">
        <h1 className="text-center text-2xl font-bold">Review Status</h1>
        <div
          className="review mt-4 shadow-md"
          style={{ height: 500, width: "100%" }}
        >
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
          />
        </div>
      </div>
    </Adminsidebar>
  );
};

export default AdminApplication;
