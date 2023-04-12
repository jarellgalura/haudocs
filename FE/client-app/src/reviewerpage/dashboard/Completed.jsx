import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { auth } from "../../firebase";
import CircularProgress from "@mui/material/CircularProgress";

const Completed = () => {
  const [status, setStatus] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [numInProgress, setNumInProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const db = getFirestore();
    const submissionsCollection = collection(db, "submissions");
    const currentUser = auth.currentUser;

    if (currentUser) {
      const submissionsQuery = query(
        submissionsCollection,
        where("reviewer", "array-contains", currentUser.email),
        where("completed", "==", true)
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
        setNumInProgress(submissionsData.length);
        setIsLoading(false);
      });
      return () => {
        unsubscribe();
      };
    }
  }, []);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      {isLoading ? (
        <CircularProgress />
      ) : (
        <>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "0.5rem",
              color: "maroon",
            }}
          >
            {numInProgress}
          </div>
          <p className="text-xl flex items-center text-center justify-center font-semibold">
            {numInProgress > 0
              ? "Number of Completed Review"
              : "Number of Completed Review"}
          </p>
        </>
      )}
    </div>
  );
};

export default Completed;
