import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import CircularProgress from "@mui/material/CircularProgress";

const Research = () => {
  const [biocount, setBioCount] = useState(0);
  const [healthcount, setHealthCount] = useState(0);
  const [clinicalcount, setClinicalCount] = useState(0);
  const [publiccount, setPublicCount] = useState(0);
  const [socialcount, setSocialCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [numInProgress, setNumInProgress] = useState(0);

  useEffect(() => {
    const db = getFirestore();
    const submissionsCollection = collection(db, "submissions");

    const submissionsQuery = query(
      submissionsCollection,
      where("reviewer", "!=", "")
    );

    const unsubscribe = onSnapshot(submissionsQuery, (snapshot) => {
      let countbiocount = 0;
      let counthealthcount = 0;
      let countclinicalcount = 0;
      let countpubliccount = 0;
      let countsocialcount = 0;

      const submissionsData = snapshot.docs.map((doc) => {
        const data = doc.data();

        if (data.research_type === "Biomedical Studies") {
          countbiocount++;
        } else if (data.research_type === "Health Operations Research") {
          counthealthcount++;
        } else if (data.research_type === "Clinical Trials") {
          countclinicalcount++;
        } else if (data.research_type === "Public Health Research") {
          countpubliccount++;
        } else if (data.research_type === "Social Research") {
          countsocialcount++;
        }

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
      setBioCount(countbiocount);
      setHealthCount(counthealthcount);
      setClinicalCount(countclinicalcount);
      setPublicCount(countpubliccount);
      setSocialCount(countsocialcount);
      setNumInProgress(submissionsData.length);
      setIsLoading(false);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <>
          <h1 className="text-2xl text-center font-bold">Research Type</h1>
          <div className="space-y-4 ml-4 mt-[1rem] mr-4">
            <p className="text-left text-xl  border-t-2 border-black pb-1 ">
              Biomedical Studies:{" "}
              <span className="float-right text-maroon mr-5">{biocount}</span>
            </p>
            <p className="text-left text-xl border-t-2 border-black pb-1 ">
              Health Operations Research:{" "}
              <span className="float-right text-maroon mr-5">
                {healthcount}
              </span>
            </p>
            <p className="text-left text-xl border-t-2 border-black pb-1 ">
              Clinical Trials:{" "}
              <span className="float-right text-maroon mr-5">
                {clinicalcount}
              </span>
            </p>
            <p className="text-left text-xl border-t-2 border-black pb-1 ">
              Public Health Research:{" "}
              <span className="float-right text-maroon mr-5">
                {publiccount}
              </span>
            </p>
            <p className="text-left text-xl border-t-2 border-black pb-1 ">
              Social Research:{" "}
              <span className="float-right text-maroon mr-5">
                {socialcount}
              </span>
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Research;
