import React, { useState, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  FormGroup,
  FormControlLabel,
  DialogContentText,
} from "@mui/material";
import "./transfer.css";
import Checkbox from "@mui/material/Checkbox";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  setDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore/lite";
import { db, auth } from "../../../../../firebase";
import CircularProgressWithLabel from "@mui/material/CircularProgress";

const AdminContinuingTransfer = (props) => {
  const [file, setFile] = useState(null);
  const [reviewType, setReviewType] = useState("");
  const [sendTo, setSendTo] = useState("");
  const [comment, setComment] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const formRef = useRef(null);
  const [protocolNumber, setProtocolNumber] = useState("");
  const [decision, setDecision] = useState("");
  const [checkCompleted, setCheckCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (event) => {
    setFile(event.target.files[0]);
  };

  const handleDecisionChange = (event) => {
    setDecision(event.target.value);
  };

  const handleProtocolNumberChange = (event) => {
    setProtocolNumber(event.target.value);
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const form = new FormData();
    form.append("file", file);

    // Perform the fetch request
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/files`,
        {
          method: "POST",
          headers: {
            filefolder: `${auth.currentUser.uid}/transfer`,
          },
          body: form,
        }
      );

      const data = await response.json();

      const submissionsRef = collection(db, "submissions");
      const q = query(submissionsRef, where("uid", "==", props.uid));
      const querySnapshot = await getDocs(q);

      // Check if the submission exists
      if (!querySnapshot.empty) {
        // Get the first matching document (there should be only one)
        const docSnapshot = querySnapshot.docs[0];

        // Get the current date as a UNIX timestamp
        const currentDate = new Date();

        // Offset the current date to GMT+8
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Singapore",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        const currentDateGMT8 = formatter.format(currentDate);

        // Add the offset current date to each file in the data.files array
        const filesWithDate = data.files.map((file) => ({
          ...file,
          upload_date: currentDateGMT8,
        }));

        // Get the existing rev_continuing_files array or an empty array if it doesn't exist
        const existingReviewerFiles =
          docSnapshot.data().rev_continuing_files || [];

        // Concatenate the existing and new files arrays
        const updatedReviewerFiles =
          existingReviewerFiles.concat(filesWithDate);

        // Update the document with the updated rev_continuing_files and sent_by
        const submissionRef = doc(db, "submissions", docSnapshot.id);
        let updateData = {
          admin_files: updatedReviewerFiles,
          decision: decision,
          comment: comment,
          completed: checkCompleted,
          date_completed: serverTimestamp(),
          forContinuing: true,
          status: "Continuing Approved",
        };
        await updateDoc(submissionRef, updateData);

        // Assuming your user collection is named "users"
        const userRef = doc(db, "users", props.uid);

        // Fetch the user document
        const userDoc = await getDoc(userRef);

        // Get the user's email
        const recipientEmail = userDoc.data().email;

        const notificationsRef = collection(db, "notifications");
        const newNotification = {
          id: doc(notificationsRef).id,
          message: `There is a message for you from ${auth.currentUser.email}`,
          read: false,
          recipientEmail: recipientEmail,
          senderEmail: auth.currentUser.email,
          timestamp: serverTimestamp(),
        };
        await setDoc(doc(notificationsRef), newNotification);
        console.log("Document updated with ID: ", docSnapshot.id);
        setShowSuccess(true);
        setShowConfirmation(false);
        setFile("");
        setSendTo("");
        setReviewType("");
        setComment("");
        setProtocolNumber("");
        formRef.current.reset();
      } else {
        console.log("No submission found with the given protocol_no");
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const submitStyle = {
    color: "white",
    backgroundColor: "maroon",
  };

  console.log(props.uid);

  return (
    <div className="transfer">
      <Box>
        <Box sx={{ maxWidth: "100%", margin: "0 auto" }}>
          <Box
            ref={formRef}
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              setShowConfirmation(true);
            }}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              p: 4,
            }}
          >
            <Typography variant="h5" sx={{ textAlign: "center" }}>
              Transfer Files
            </Typography>
            <input
              multiple
              type="file"
              id="file-upload"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              style={{ width: "100%" }}
            />
            <FormGroup>
              <FormControlLabel
                required
                control={<Checkbox />}
                label="Mark Protocol As Completed (For Archiving)"
                onChange={(e) => {
                  setCheckCompleted(e.target.checked);
                }}
              />
            </FormGroup>

            <FormControl sx={{ width: "100%" }}>
              <InputLabel>Decision</InputLabel>
              <Select
                required
                label="Decision"
                value={decision}
                onChange={handleDecisionChange}
              >
                <MenuItem value="Protocol Approved">Protocol Approved</MenuItem>
                <MenuItem value="Protocol Disapproved">
                  Protocol Disapproved
                </MenuItem>
                <MenuItem value="Approved with Major">
                  Approved with Major
                </MenuItem>
                <MenuItem value="Approved with Minor">
                  Approved with Minor
                </MenuItem>
                <MenuItem value="None">None</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Message"
              variant="outlined"
              multiline
              rows={4}
              value={comment}
              onChange={handleCommentChange}
              fullWidth
              margin="nomal"
            />

            <Button
              type="submit"
              variant="contained"
              style={submitStyle}
              sx={{ width: "100%", height: "3rem" }}
            >
              Send
            </Button>
            <Dialog
              open={showConfirmation}
              onClose={() => setShowConfirmation(false)}
            >
              <DialogTitle>Confirm Submit</DialogTitle>
              <DialogContent>
                <Typography variant="body1">
                  Are you sure you want to send the form?
                </Typography>
              </DialogContent>
              <DialogActions>
                {loading ? (
                  <>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <CircularProgressWithLabel value={0} thickness={4} />
                      <DialogContentText sx={{ marginLeft: "10px" }}>
                        Sending...
                      </DialogContentText>
                    </Box>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => setShowConfirmation(false)}
                      sx={{ color: "maroon" }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit} sx={{ color: "maroon" }}>
                      Yes
                    </Button>
                  </>
                )}
              </DialogActions>
            </Dialog>
            <Dialog open={showSuccess} onClose={() => setShowSuccess(false)}>
              <DialogTitle>Success!</DialogTitle>
              <DialogContent>
                <Typography variant="body1">
                  You have successfully transferred the files.
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button
                  sx={{ color: "maroon" }}
                  onClick={() => setShowSuccess(false)}
                >
                  Close
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default AdminContinuingTransfer;
