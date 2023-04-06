import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import "./submit.css";
import Initial from "./Initial";
import Continuing from "./Continuing";
import Final from "./Final";

function Submission() {
  const [activeTab, setActiveTab] = useState(0);
  const [initialSubmitted, setInitialSubmitted] = useState(false); // add state variable to track if initial form is submitted
  const tabs = [
    {
      label: "Initial Process",
      content: <Initial onSubmitted={() => setInitialSubmitted(true)} />,
    },
    {
      label: "Continuing Review",
      content: <Continuing />,
      disabled: !initialSubmitted, // disable the "Continuing" tab button if initial form is not submitted
    },
    {
      label: "Final Review",
      content: <Final />,
      disabled: !initialSubmitted, // disable the "Final" tab button if initial form is not submitted
    },
  ];

  return (
    <Sidebar>
      <div className="subtabs">
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
        <div>{tabs[activeTab].content}</div>
      </div>
    </Sidebar>
  );
}

export default Submission;
