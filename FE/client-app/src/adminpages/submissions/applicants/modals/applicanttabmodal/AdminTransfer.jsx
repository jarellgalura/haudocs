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
  InputAdornment,
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
import IconButton from "@mui/material/IconButton";
import RemoveIcon from "@mui/icons-material/Remove";

const AdminTransfer = (props) => {
  const [file, setFile] = useState(null);
  const [reviewType, setReviewType] = useState("");
  const [sendTo, setSendTo] = useState("");
  const [comment, setComment] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showExemptReviewTextField, setShowExemptReviewTextField] =
    useState(false);
  const formRef = useRef(null);
  const [protocolNumber, setProtocolNumber] = useState("");
  const [decision, setDecision] = useState("");
  const [checkCompleted, setCheckCompleted] = useState(false);

  const handleFileUpload = (event) => {
    setFile(event.target.files[0]);
  };

  const handleDecisionChange = (event) => {
    setDecision(event.target.value);
  };

  const handleProtocolNumberChange = (event) => {
    setProtocolNumber(event.target.value);
  };

  const handleReviewTypeChange = (event) => {
    setReviewType(event.target.value);
    setShowExemptReviewTextField(event.target.value === "Exempt from Review");
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

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
      console.log(data);

      const submissionsRef = collection(db, "submissions");
      const q = query(submissionsRef, where("uid", "==", props.uid));
      const querySnapshot = await getDocs(q);

      // Check if the submission exists
      if (!querySnapshot.empty) {
        // Get the first matching document (there should be only one)
        const docSnapshot = querySnapshot.docs[0];

        // Get the current date as a UNIX timestamp
        const currentDate = Date.now();

        // Offset the current date to GMT+8
        const offsetHours = 8;
        const offsetMilliseconds = offsetHours * 60 * 60 * 1000;
        const currentDateGMT8 = currentDate + offsetMilliseconds;

        // Add the offset current date to each file in the data.files array
        const filesWithDate = data.files.map((file) => ({
          ...file,
          upload_date: currentDateGMT8, // Add the offset current date as a UNIX timestamp
        }));

        // Get the existing rev_initial_files array or an empty array if it doesn't exist
        const existingReviewerFiles =
          docSnapshot.data().rev_initial_files || [];

        // Concatenate the existing and new files arrays
        const updatedReviewerFiles =
          existingReviewerFiles.concat(filesWithDate);

        // Update the document with the updated rev_initial_files and sent_by
        const submissionRef = doc(db, "submissions", docSnapshot.id);
        let updateData = {
          admin_files: updatedReviewerFiles,
          decision: decision,
          review_type: reviewType,
          comment: comment,
          completed: checkCompleted,
          date_completed: serverTimestamp(),
        };
        if (reviewType === "Exempt from Review") {
          updateData.protocol_no = protocolNumber;
        }
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

            <FormControl sx={{ width: "100%" }}>
              <InputLabel>Review Type</InputLabel>
              <Select
                label="Review Type"
                value={reviewType}
                onChange={handleReviewTypeChange}
              >
                <MenuItem value="Exempt from Review">
                  Exempt from Review
                </MenuItem>
                <MenuItem value="Full Board Review">Full Board Review</MenuItem>
                <MenuItem value="Expedited Review">Expedited Review</MenuItem>
              </Select>
            </FormControl>

            {showExemptReviewTextField && (
              <TextField
                label="Protocol Number"
                required
                autoComplete="off"
                fullWidth
                value={protocolNumber}
                onChange={handleProtocolNumberChange}
              />
            )}

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
                <Button
                  sx={{ color: "maroon" }}
                  onClick={() => setShowConfirmation(false)}
                >
                  Cancel
                </Button>
                <Button
                  sx={{ color: "maroon" }}
                  onClick={handleSubmit}
                  autoFocus
                >
                  Send
                </Button>
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

export default AdminTransfer;
