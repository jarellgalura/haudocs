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
import CircularProgress from "@mui/material/CircularProgress";
import { auth } from "../../firebase";

const Reviewstatus = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getFirestore();
    const submissionsCollection = collection(db, "submissions");
    const unsubscribe = onSnapshot(
      query(
        submissionsCollection,
        where("reviewer", "array-contains", auth.currentUser.email),
        where("forAdmin", "==", true)
      ),
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
        console.log(submissionsData);
        setSubmissions(submissionsData);
        setLoading(false);
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
          />
        </div>
      </div>
    </Reviewersidebar>
  );
};

export default Reviewstatus;
