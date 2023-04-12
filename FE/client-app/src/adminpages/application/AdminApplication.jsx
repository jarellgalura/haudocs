import React, { useState, useEffect } from "react";
import Adminsidebar from "../Adminsidebar";
import "./application.css";
import { DataGrid } from "@mui/x-data-grid";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import CircularProgress from "@mui/material/CircularProgress";

const AdminApplication = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getFirestore();
    const submissionsCollection = collection(db, "submissions");
    const submissionsQuery = query(
      submissionsCollection,
      where("reviewer", "!=", "")
    );
    const unsubscribe = onSnapshot(submissionsQuery, (snapshot) => {
      const submissionsData = [];
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.reviewer) {
          if (Array.isArray(data.reviewer)) {
            data.reviewer.forEach((reviewer, index) => {
              submissionsData.push({
                id: `${doc.id}_${index}`,
                protocol_no: data.protocol_no,
                review_type: data.review_type,
                rev_date_sent: data.rev_date_sent
                  ? new Date(data.rev_date_sent.seconds * 1000).toLocaleString()
                  : null,
                reviewer: reviewer,
                status: data.status,
              });
            });
          } else {
            submissionsData.push({
              id: doc.id,
              protocol_no: data.protocol_no,
              review_type: data.review_type,
              rev_date_sent: data.rev_date_sent
                ? new Date(data.rev_date_sent.seconds * 1000).toLocaleString()
                : null,
              reviewer: data.reviewer,
              status: data.status,
            });
          }
        }
      });
      setSubmissions(submissionsData);
      setLoading(false);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const columns = [
    { field: "protocol_no", headerName: "Protocol Number", flex: 1 },
    { field: "review_type", headerName: "Review Type", flex: 1 },
    {
      field: "rev_date_sent",
      headerName: "Date Sent",
      flex: 1,
    },
    {
      field: "reviewer",
      headerName: "Reviewer",
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
    },
  ];

  return (
    <Adminsidebar>
      <div className="adminreviewdatatable">
        <h1 className="text-center text-2xl font-bold">Review Status</h1>
        <div className="review mt-4 shadow-md" style={{ height: 400 }}>
          <DataGrid
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
          />
        </div>
      </div>
    </Adminsidebar>
  );
};

export default AdminApplication;
