import React, { useState, useEffect } from "react";
import Reviewersidebar from "../Reviewersidebar";
import Button from "@mui/material/Button";
import { DataGrid } from "@mui/x-data-grid";
import "./reviewerstatus.css";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";

const Reviewstatus = () => {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const db = getFirestore();
    const submissionsCollection = collection(db, "submissions");
    const unsubscribe = onSnapshot(
      query(submissionsCollection, where("rev_initial_files", "!=", [])),
      (snapshot) => {
        const submissionsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            rev_to_admin_sent_date: data.rev_to_admin_sent_date
              ? new Date(
                  data.rev_to_admin_sent_date.seconds * 1000
                ).toLocaleString()
              : null,
            due_date: data.due_date
              ? new Date(data.due_date.seconds * 1000).toLocaleString()
              : null,
          };
        });
        setSubmissions(submissionsData);
      }
    );
    return () => {
      unsubscribe();
    };
  }, []);

  const columns = [
    { field: "protocol_no", headerName: "Protocol Number", flex: 1 },
    { field: "status", headerName: "Classification", flex: 1 },
    { field: "rev_to_admin_sent_date", headerName: "Date Sent", flex: 1 },
    {
      field: "due_date",
      headerName: "Due Date",
      flex: 1,
    },
    {
      field: "decision",
      headerName: "Status",
      flex: 1,
    },
  ];

  return (
    <Reviewersidebar>
      <div className="reviewdatatable">
        <h1 className="text-center text-2xl font-bold">Review Status</h1>
        <div className=" mt-[2rem]" style={{ height: 500 }}>
          <DataGrid
            autoWidth
            disableHorizontalScroll
            rows={submissions}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
          />
        </div>
      </div>
    </Reviewersidebar>
  );
};

export default Reviewstatus;
