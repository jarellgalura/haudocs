import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  getFirestore,
} from "firebase/firestore";
import Sidebar from "../../components/Sidebar";
import "./submit.css";
import Initial from "./Initial";
import Continuing from "./Continuing";
import Final from "./Final";
import { auth } from "../../firebase";
import LinearProgress from "@mui/material/LinearProgress";

function Submission() {
  const [activeTab, setActiveTab] = useState(0);
  const [initialSubmitted, setInitialSubmitted] = useState(false);
  const [continuingSubmitted, setContinuingSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      const db = getFirestore();
      const querySnapshot = await getDocs(
        query(
          collection(db, "submissions"),
          where("uid", "==", auth.currentUser.uid)
        )
      );

      let initial = false;
      let continuing = false;

      querySnapshot.forEach((doc) => {
        const submissionData = doc.data();
        if (submissionData.status === "initial") {
          initial = true;
        } else if (submissionData.status === "continuing") {
          initial = true;
          continuing = true;
        }
      });

      if (initial && continuing) {
        setActiveTab(2);
      } else if (initial) {
        setActiveTab(1);
      } else {
        setActiveTab(0);
      }

      setInitialSubmitted(initial);
      setContinuingSubmitted(continuing);
      setLoading(false);
    };
    fetchSubmissions();
  }, []);

  const tabs = [
    {
      label: "Initial Process",
      content: <Initial onSubmitted={() => setInitialSubmitted(true)} />,
      disabled: activeTab === 1 || activeTab === 2,
    },
    {
      label: "Continuing Review",
      content: <Continuing onSubmitted={() => setContinuingSubmitted(true)} />,
      disabled: activeTab !== 1 || !continuingSubmitted,
    },
    {
      label: "Final Review",
      content: <Final />,
      disabled: !continuingSubmitted,
    },
  ];

  return (
    <Sidebar>
      <div className="subtabs">
        {loading ? (
          <LinearProgress />
        ) : (
          <div className="flex justify-center items-center">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={activeTab === index ? "active" : ""}
                disabled={tab.disabled}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
        {loading ? <LinearProgress /> : <div>{tabs[activeTab].content}</div>}
      </div>
    </Sidebar>
  );
}

export default Submission;
