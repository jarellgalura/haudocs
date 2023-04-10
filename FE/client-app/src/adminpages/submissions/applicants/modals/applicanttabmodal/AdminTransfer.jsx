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
} from "@mui/material";
import "./transfer.css";
import Checkbox from "@mui/material/Checkbox";

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
    setShowExemptReviewTextField(event.target.value === "Type A");
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setShowSuccess(true);
    setShowConfirmation(false);
    setFile("");
    setSendTo("");
    setReviewType("");
    setComment("");
    formRef.current.reset();
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
                <MenuItem value="Decision A">Protocol Approved</MenuItem>
                <MenuItem value="Decision B">Protocol Disapproved</MenuItem>
                <MenuItem value="Decision C">Approved with Major</MenuItem>
                <MenuItem value="Decision D">Approved with Minor</MenuItem>
                <MenuItem value="Decision E">None</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ width: "100%" }}>
              <InputLabel>Review Type</InputLabel>
              <Select
                label="Review Type"
                value={reviewType}
                onChange={handleReviewTypeChange}
              >
                <MenuItem value="Type A">Exempt from Review</MenuItem>
                <MenuItem value="Type B">Full Board Review</MenuItem>
                <MenuItem value="Type C">Expedited Review</MenuItem>
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