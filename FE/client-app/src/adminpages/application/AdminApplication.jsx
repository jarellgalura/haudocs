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
} from "firebase/firestore";

const AdminApplication = () => {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const db = getFirestore();
    const submissionsCollection = collection(db, "submissions");
    const submissionsQuery = query(
      submissionsCollection,
      where("protocol_no", "!=", "")
    );
    const unsubscribe = onSnapshot(submissionsQuery, (snapshot) => {
      const submissionsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          rev_date_sent: data.rev_date_sent
            ? new Date(data.rev_date_sent.seconds * 1000).toLocaleString()
            : null,
          due_date: data.due_date
            ? new Date(data.due_date.seconds * 1000).toLocaleString()
            : null,
        };
      });
      setSubmissions(submissionsData);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const columns = [
    { field: "protocol_no", headerName: "Protocol Number", width: 300 },
    { field: "review_type", headerName: "Review Type", width: 300 },
    {
      field: "rev_date_sent",
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

  return (
    <Adminsidebar>
      <div className="adminreviewdatatable">
        <h1 className="text-center text-2xl font-bold">Review Status</h1>
        <div
          className="review mt-4 shadow-md"
          style={{ height: 500, width: "100%" }}
        >
          <DataGrid
            rows={submissions}
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
