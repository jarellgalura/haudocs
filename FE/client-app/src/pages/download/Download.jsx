import React from "react";
import Sidebar from "../../components/Sidebar";
import "./download.css";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const Download = () => {
  const initialgoogleDriveLink =
    " https://1drv.ms/f/s!AuF48Vlw3XM-avEjfrjOUCJbbJY?e=sd1Adi";

  const continuinggoogleDriveLink =
    "https://1drv.ms/f/s!AuF48Vlw3XM-ayLE5lP5ggZH9gg?e=orAX6D";

  const finalgoogleDriveLink =
    "https://1drv.ms/f/s!AuF48Vlw3XM-bMMRsAuG3x6K8Yk?e=InSyWb";
  return (
    <Sidebar>
      <div className="download-accordion">
        <div className="accordion">
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography>Initial Process Forms</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography sx={{ color: "maroon" }}>
                <a
                  href={initialgoogleDriveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Click Here To Download
                </a>
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel2a-content"
              id="panel2a-header"
            >
              <Typography>Continuing Review Forms</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography sx={{ color: "maroon" }}>
                <a
                  href={continuinggoogleDriveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Click Here To Download
                </a>
              </Typography>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel2a-content"
              id="panel2a-header"
            >
              <Typography>Final Review Form</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography sx={{ color: "maroon" }}>
                <a
                  href={finalgoogleDriveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Click Here To Download
                </a>
              </Typography>
            </AccordionDetails>
          </Accordion>
        </div>
      </div>
    </Sidebar>
  );
};

export default Download;
