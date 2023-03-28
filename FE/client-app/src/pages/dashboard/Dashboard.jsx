import React, { useState, useEffect, useRef } from "react";
import "./dashboard.css";
import "./modals/modal.css";
import Sidebar from "../../components/Sidebar";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import haudocsinitial from "../../assets/haudocs-initial.png";
import haudocscontinuing from "../../assets/haudocs-continuing.png";
import haudocsfinal from "../../assets/haudocs-final.png";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function Dashboard() {
  const [open, setOpen] = useState(false);
  const [continuingopen, setcontinuingOpen] = useState(false);
  const [finalopen, setfinalOpen] = useState(false);
  const [showCloseButton, setShowCloseButton] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const contentRef = useRef(null);

  const handleClose = () => {
    setOpen(false);
  };

  const continuinghandleClose = () => {
    setcontinuingOpen(false);
  };

  const finalhandleClose = () => {
    setfinalOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setShowCloseButton(false);
      setHasReachedEnd(false);
    }
  }, [open]);

  return (
    <Sidebar>
      <div className="card-container flex flex-wrap justify-center mt-[3rem]">
        <div className="card-wrapper">
          <Card sx={{ maxWidth: 345 }}>
            <CardMedia component="img" height="140" image={haudocsinitial} />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Requirements for Ethics Review Initial application
              </Typography>
            </CardContent>
            <div className="flex items-center justify-center">
              <CardActions>
                <Button
                  sx={{ color: "maroon" }}
                  onClick={() => setOpen(true)}
                  size="small"
                >
                  read the instructions
                </Button>
              </CardActions>
            </div>
          </Card>
        </div>
        <div className="card-wrapper">
          <Card sx={{ maxWidth: 345 }}>
            <CardMedia component="img" height="140" image={haudocscontinuing} />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Requirements for Continuing Ethics Review upon issuance of
                ethical clearance
              </Typography>
            </CardContent>
            <div className="flex items-center justify-center">
              <CardActions>
                <Button
                  sx={{ color: "maroon" }}
                  onClick={() => setcontinuingOpen(true)}
                  size="small"
                >
                  read the instructions
                </Button>
              </CardActions>
            </div>
          </Card>
        </div>
        <div className="card-wrapper">
          <Card sx={{ maxWidth: 345 }}>
            <CardMedia component="img" height="140" image={haudocsfinal} />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Requirements for Final Review upon completion of Continuing
                Review
              </Typography>
            </CardContent>
            <div className="flex items-center justify-center">
              <CardActions>
                <Button
                  sx={{ color: "maroon" }}
                  onClick={() => setfinalOpen(true)}
                  size="small"
                >
                  read the instructions
                </Button>
              </CardActions>
            </div>
          </Card>
        </div>
      </div>

      <>
        <Dialog
          open={open}
          sx={{ "& .MuiDialog-paper": { width: "100%", maxWidth: "md" } }}
          onClose={handleClose}
          disableEscapeKeyDown
          BackdropProps={{
            onClick: (event) => {
              event.stopPropagation();
            },
            onBackdropClick: (event) => {
              event.stopPropagation();
            },
          }}
        >
          <DialogTitle
            disableTypography
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid gray",
            }}
          >
            <Typography variant="h6">Initial Review</Typography>
            <IconButton aria-label="close" onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent
            ref={contentRef}
            sx={{ maxHeight: "90vh", overflowY: "auto" }}
          >
            <Typography variant="body1">
              <p>
                <strong>
                  Requirements for Ethics Review Initial Application:
                  <br />
                  <br />
                  <em>
                    (NOTE: Items in red color are not required, submit if it
                    only applies to your field of study.)
                  </em>
                </strong>
              </p>
              <p>
                <strong>
                  1. Research Proposal with the following sections:
                </strong>
                <li>Introduction</li>
                <li>Review of Related Literature and Studies</li>
                <li>
                  Methods section - with <em>Ethical Considerations</em> section
                </li>
              </p>
              <p>
                <strong>
                  2. Informed consent/assent form <em>(separate document)</em>
                </strong>
              </p>
              <p>
                <strong>
                  3. Questionnaire/s/Tools (Quantitative), Interview Guide
                  (Qualitative)
                </strong>
              </p>
              <div className="RED">
                <p>
                  <strong>
                    4. NCIP clearance (for studies involving indigenous groups)
                  </strong>
                </p>
              </div>
              <p>
                <strong>
                  5. Accomplished HAU-IRB FORM 2(B):{" "}
                  <em>Registration and Application Form</em>
                </strong>
                <li>
                  {" "}
                  section II should be signed and endorsed by URO Director
                  <em> (for faculty researchers)</em>
                </li>
                <li>
                  section III should be signed and endorsed by the dean/GPC
                  <em> (for graduate school students)</em>
                </li>
              </p>
              <p>
                <strong>
                  6. Accomplished HAU-IRB FORM 4.1(A):{" "}
                  <em>Protocol Assessment Form</em>
                </strong>
              </p>
              <p>
                <strong>7. Accomplished HAU-IRB FORM 4.1(B): </strong>
                <em>
                  <strong>Informed Consent Assessment Form</strong> (the basis
                  in filling out this form should be the submitted informed
                  consent document, not the entire manuscript)
                </em>
              </p>
              <p>
                <strong>8. Curriculum Vitae</strong>
              </p>

              <p>
                Upon the receipt of the complete set of documents, depending on
                the risks involved, a{" "}
                <strong>
                  maximum of 4 weeks is needed to process an expedited review,
                </strong>{" "}
                whereas{" "}
                <strong>
                  6 weeks for a study needing full review by the board.
                </strong>
              </p>

              <p>
                Please be reminded that students/researchers{" "}
                <strong>cannot proceed with any form of data collection</strong>{" "}
                <em>(pilot testing included)</em>{" "}
                <strong>unless issued an ethical clearance</strong>.
              </p>
            </Typography>
          </DialogContent>
        </Dialog>
      </>

      <>
        <Dialog
          open={continuingopen}
          sx={{ "& .MuiDialog-paper": { width: "100%", maxWidth: "md" } }}
          onClose={continuinghandleClose}
          disableEscapeKeyDown
          BackdropProps={{
            onClick: (event) => {
              event.stopPropagation();
            },
            onBackdropClick: (event) => {
              event.stopPropagation();
            },
          }}
        >
          <DialogTitle
            disableTypography
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid gray",
            }}
          >
            <Typography variant="h6">Continuing Review</Typography>
            <IconButton aria-label="close" onClick={continuinghandleClose}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent
            ref={contentRef}
            sx={{ maxHeight: "70vh", overflowY: "auto" }}
          >
            <Typography variant="body1">
              <p>
                Upon issuance of ethical clearance{" "}
                <em>(approval letter is valid for 1 year),</em> the researcher
                has the responsibility to the submission of the following
                post-approval reports{" "}
                <strong>during the conduct of the study</strong> (whichever is
                applicable) as follows:
              </p>

              <p>
                <strong>1. HAU-IRB FORM 3.1(A): Progress Report Form</strong>{" "}
                <em>(if the conduct of the study lasts more than 6 months)</em>{" "}
                should be submitted on the 6th month after issuance of ethical
                clearance.
              </p>

              <p>
                <strong>
                  2. HAU-IRB FORM 3.2(A): Early Termination Report Form
                </strong>{" "}
                <em>
                  (for reasons that make the continuation of the research
                  untenable such as poor recruitment, safety or benefits is
                  doubtful or at risks; conduct breaches)
                </em>
              </p>

              <p>
                <strong>3. HAU-IRB FORM 3.3(A): Amendment Review Form</strong>{" "}
                <em>
                  (any changes during the conduct of the study such as changes
                  to the study design, procedures, methods of recruitment, or
                  the consent form/information sheet).
                </em>
              </p>

              <p>
                <strong>
                  4. HAU-IRB FORM 3.4(A): Protocol Deviation/Violation Report
                  Form
                </strong>{" "}
                <em>
                  (any deviations in the approved conduct of the study that
                  would impact on participant safety/wellbeing).
                </em>
                <li>
                  Protocol Deviation - is non-compliance with the approved
                  protocol that causes no harm and has no potential to cause
                  harm to the research participants or others.
                </li>
                <li>
                  Protocol Violations - is non-compliance with the approved
                  protocol that has an impact on subject safety, may
                  substantially alter risks to subjects, may have an effect on
                  the integrity of the study data, or may affect the subject's
                  willingness to participate in the study.
                </li>
              </p>

              <p>
                <strong>
                  5. HAU-IRB FORM 3.5(A): Serious Adverse Event Form
                </strong>{" "}
                <em>
                  (SAEs is any an adverse event that results to death, life
                  threatening incident or causes immediate risk of death from
                  the event).
                </em>
              </p>

              <p>
                <strong>
                  6. HAU-IRB FORM 3.5(B): Reportable Negative Events Form
                </strong>{" "}
                <em>
                  (RNEs is any experiences of researchers that involve personal
                  safety issues [related to both research and research
                  participant] in the conduct of research such as sexual
                  harassment, physical threats, stalking and hostile reactions).
                </em>
              </p>

              <p>
                <strong>
                  7. HAU-IRB FORM 3.6(A) Application for Continuing Review
                </strong>{" "}
                <em>
                  (To ensure that conduct of study follows approved protocol
                  beyond period of initial ethical clearance and up to the end
                  of study).
                </em>
                This should be applied least 4 weeks before the expiration of
                the ethical clearance of a protocol.
              </p>
            </Typography>
          </DialogContent>
        </Dialog>
      </>

      <>
        <Dialog
          open={finalopen}
          sx={{ "& .MuiDialog-paper": { width: "100%", maxWidth: "md" } }}
          onClose={finalhandleClose}
          disableEscapeKeyDown
          BackdropProps={{
            onClick: (event) => {
              event.stopPropagation();
            },
            onBackdropClick: (event) => {
              event.stopPropagation();
            },
          }}
        >
          <DialogTitle
            disableTypography
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid gray",
            }}
          >
            <Typography variant="h6">Final Review</Typography>
            <IconButton aria-label="close" onClick={finalhandleClose}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent
            ref={contentRef}
            sx={{ height: "20vh", overflowY: "auto" }}
          >
            <Typography
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "3.5rem",
              }}
              variant="body1"
            >
              <p>
                <strong>1. HAU-IRB FORM 3.7(A): Final Report Form</strong>{" "}
                <em>
                  (this signals the completion of the study and its acceptance
                  by the HAU-IRB).
                </em>
                This should be forwarded to the board not later than 8 weeks
                after the end of the study.
              </p>
            </Typography>
          </DialogContent>
        </Dialog>
      </>
    </Sidebar>
  );
}

export default Dashboard;
