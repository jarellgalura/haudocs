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
} from "@mui/material";
import Adminsidebar from "../Adminsidebar";
import "./transfer.css";
import "../../App.css";

const AdminTransfer = () => {
  const [file, setFile] = useState(null);
  const [reviewType, setReviewType] = useState("");
  const [sendTo, setSendTo] = useState("");
  const [comment, setComment] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const formRef = useRef(null);

  const handleFileUpload = (event) => {
    setFile(event.target.files[0]);
  };

  const handleReviewTypeChange = (event) => {
    setReviewType(event.target.value);
  };

  const handleSendToChange = (event) => {
    setSendTo(event.target.value);
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

  return (
    <Adminsidebar>
      <div className="transfer">
        <Box sx={{ py: 2 }}>
          <Box sx={{ maxWidth: "600px", margin: "0 auto", px: 2 }}>
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
                alignItems: "center",
                gap: 2,
                borderWidth: 2,
                borderColor: "black",
                borderRadius: 2,
                p: 4,
                boxShadow: 4,
              }}
            >
              <InputLabel htmlFor="file-upload">Transfer Files</InputLabel>
              <input
                multiple
                required
                type="file"
                id="file-upload"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                style={{ width: "100%" }}
              />

              <FormControl sx={{ width: "100%" }}>
                <InputLabel>Review Type</InputLabel>
                <Select value={reviewType} onChange={handleReviewTypeChange}>
                  <MenuItem value="Type A">Exempt from Review</MenuItem>
                  <MenuItem value="Type B">Full Board Review</MenuItem>
                  <MenuItem value="Type C">Expedited Review</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Send To"
                required
                autoComplete="off"
                value={sendTo}
                fullWidth
                onChange={handleSendToChange}
              />

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
    </Adminsidebar>
  );
};

export default AdminTransfer;
