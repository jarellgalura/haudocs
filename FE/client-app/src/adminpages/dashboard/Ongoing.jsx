import React, { useState, useEffect } from "react";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import CircularProgress from "@mui/material/CircularProgress";

const Ongoing = () => {
  const [submissions, setSubmissions] = useState([]);
  const [numInProgress, setNumInProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const db = getFirestore();
    const submissionsCollection = collection(db, "submissions");
    const unsubscribe = onSnapshot(submissionsCollection, (snapshot) => {
      const submissionsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date_sent: data.date_sent
            ? new Date(data.date_sent.seconds * 1000).toLocaleString()
            : null,
          due_date: data.due_date
            ? new Date(data.due_date.seconds * 1000).toLocaleString()
            : null,
        };
      });
      setSubmissions(submissionsData);
      const numInProgress = submissionsData.filter(
        (submission) => submission.reviewer !== ""
      ).length;
      setNumInProgress(numInProgress);
      setIsLoading(false);
    });
    return () => {
      unsubscribe();
    };
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
              ? "Protocols in Progress"
              : "NO PROTOCOLS IN PROGRESS"}
          </p>
        </>
      )}
    </div>
  );
};

export default Ongoing;
