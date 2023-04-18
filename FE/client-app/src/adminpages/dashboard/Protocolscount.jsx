import React, { useState, useEffect } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { CircularProgress } from "@mui/material";

const Protocolscount = () => {
  const [exemptedCount, setExemptedCount] = useState(0);
  const [expediteCount, setExpediteCount] = useState(0);
  const [fullBoardCount, setFullBoardCount] = useState(0);
  const [hauProtocolsCount, setHauProtocolsCount] = useState(0);
  const [othersProtocolsCount, setOthersProtocolsCount] = useState(0);
  const [submissions, setSubmissions] = useState([]);
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
      let countExempted = 0;
      let countExpedite = 0;
      let countFullBoard = 0;
      let countHauProtocols = 0;
      let countOthersProtocols = 0;

      const submissionsData = snapshot.docs.map((doc) => {
        const data = doc.data();
        if (data.review_type === "Exempted Review") {
          countExempted++;
        } else if (data.review_type === "Expedited Review") {
          countExpedite++;
        } else if (data.review_type === "Full Board Review") {
          countFullBoard++;
        }

        if (data.school === "HAU") {
          countHauProtocols++;
        } else if (data.school === "Others") {
          countOthersProtocols++;
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
      setSubmissions(submissionsData);
      setExemptedCount(countExempted);
      setExpediteCount(countExpedite);
      setFullBoardCount(countFullBoard);
      setHauProtocolsCount(countHauProtocols);
      setOthersProtocolsCount(countOthersProtocols);
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
          <div className="flex items-center justify-center text-center mt-5 space-x-10">
            <div className="text-5xl text-maroon">
              {exemptedCount}
              <h1 className="text-xl text-black">Exempted</h1>
            </div>
            <div className="text-5xl text-maroon">
              {expediteCount}
              <h1 className="text-xl text-black">Expedite</h1>
            </div>
            <div className="text-5xl text-maroon">
              {fullBoardCount}
              <h1 className="text-xl text-black">Full Board</h1>
            </div>
          </div>
          <div className="flex items-center justify-center text-center mt-5 space-x-10">
            <div className="text-5xl text-maroon">
              {hauProtocolsCount}
              <h1 className="text-xl text-black">Protocols Inside HAU</h1>
            </div>
            <div className="text-5xl text-maroon">
              {othersProtocolsCount}
              <h1 className="text-xl text-black">Protocols Outside HAU</h1>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Protocolscount;
