import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import CircularProgress from "@mui/material/CircularProgress";
import { auth } from "../../firebase";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import Button from "@mui/material/Button";

const InboxModal = () => {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const db = getFirestore();
    const submissionsCollection = collection(db, "submissions");
    const q = query(
      submissionsCollection,
      where("uid", "==", auth.currentUser.uid)
    );
    getDocs(q).then((querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const files = data[0].admin_files.map((file, index) => ({
        id: index + 1,
        name: data[0].name,
        date_sent: new Date(
          data[0].date_sent.seconds * 1000 +
            data[0].date_sent.nanoseconds / 1000000
        ).toLocaleString(),
        ...file,
        research_type: data[0].research_type,
        protocol_no: data[0].protocol_no,
        decision: data[0].decision,
        status: data[0].status,
      }));
      setSubmissions(files);
    });
  }, [auth.currentUser.uid]);

  const handleDownload = async (params) => {
    console.log(params.row.downloadLink);
    window.open(
      `${process.env.REACT_APP_BACKEND_URL}${params.row.downloadLink}`,
      "_blank"
    );
  };

  const columns = [
    { field: "protocol_no", headerName: "Protocol Number", flex: 1 },
    { field: "research_type", headerName: "Research Type", flex: 1 },
    { field: "upload_date", headerName: "Date Received", flex: 1 },
    {
      field: "decision",
      headerName: "Status",
      flex: 1,
    },

    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => (
        <Button onClick={() => handleDownload(params)}>Download</Button>
      ),
    },
  ];
  return (
    <div style={{ height: 500 }}>
      <DataGrid
        autoWidth
        disableHorizontalScroll
        rows={submissions}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
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
      />
    </div>
  );
};

export default InboxModal;
