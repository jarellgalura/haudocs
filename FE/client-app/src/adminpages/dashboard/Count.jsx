import React, { useState, useEffect } from "react";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import CircularProgress from "@mui/material/CircularProgress";

const Count = () => {
  const [submissions, setSubmissions] = useState([]);
  const [numInProgress, setNumInProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const db = getFirestore();
    const submissionsCollection = collection(db, "submissions");
    const unsubscribe = onSnapshot(submissionsCollection, (snapshot) => {
      const submissionsData = snapshot.docs
        .map((doc) => {
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
        })
        .filter((submission) => submission.completed === false);
      setNumInProgress(
        submissionsData.filter((submission) => submission.reviewer !== [])
          .length
      );

      setSubmissions(submissionsData);
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
            {numInProgress > 0 ? "Number of Applicants" : "NO APPLICATIONS"}
          </p>
        </>
      )}
    </div>
  );
};

export default Count;
