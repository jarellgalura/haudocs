import React from "react";
import Sidebar from "../../components/Sidebar";
import { DataGrid } from "@mui/x-data-grid";
import "./inbox.css";

const Inbox = () => {
  // Sample data
  const columns = [
    { field: "documentname", headerName: "Document Name", width: 500 },
    { field: "datereceived", headerName: "Date Received", width: 500 },
    { field: "action", headerName: "Action", width: 100 },
  ];
  const rows = [{ id: "", documentname: "", datereceived: "", action: "" }];

  return (
    <Sidebar>
      <h1 className="text-center text-2xl font-bold mt-[1rem]">Files</h1>
      <div className="inbox-datatable">
        <div
          className="shadow-md"
          style={{ marginTop: 25, height: 500, width: "80vw" }}
        >
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
          />
        </div>
      </div>
    </Sidebar>
  );
};

export default Inbox;
