import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { DataGrid } from "@mui/x-data-grid";
import "./inbox.css";
import CircularProgress from "@mui/material/CircularProgress";
import { auth } from "../../firebase";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import InboxModal from "./InboxModal";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";

const Inbox = () => {
  const [submissions, setSubmissions] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const db = getFirestore();
    const submissionsCollection = collection(db, "submissions");
    const q = query(
      submissionsCollection,
      where("uid", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const submissionsData = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date_completed: data.date_completed
              ? new Date(data.date_completed.seconds * 1000).toLocaleString()
              : null,
            due_date: data.due_date
              ? new Date(data.due_date.seconds * 1000).toLocaleString()
              : null,
          };
        })
        .filter((submission) => submission.completed === true);
      setSubmissions(submissionsData);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  function handleOpenModal() {
    setShowModal(true);
  }

  function handleCloseModal() {
    setShowModal(false);
  }

  const columns = [
    { field: "protocol_no", headerName: "Protocol Number", flex: 1 },
    { field: "date_completed", headerName: "Date Received", flex: 1 },
    {
      field: "comment",
      headerName: "Message",
      flex: 1,
      renderCell: (params) => <MessageCell comment={params.value} />,
    },
    {
      field: "action",
      headerName: "Action",
      renderCell: (params) => <ViewCell {...params} />,
      width: 180,
    },
  ];

  function MessageCell({ props, comment }) {
    const MAX_LENGTH = 50; // max length of message before truncating

    const [open, setOpen] = useState(false);

    const handleClick = () => {
      setOpen(true);
    };

    const handleClose = () => {
      setOpen(false);
    };

    const dialogStyle = {
      minWidth: "400px",
      maxWidth: "600px",
      overflowWrap: "break-word",
      wordWrap: "break-word",
    };

    return (
      <>
        <Button onClick={handleClick}>Show Message</Button>

        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>{"Message"}</DialogTitle>
          <DialogContent style={dialogStyle}>
            <DialogContentText>{comment}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Close</Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "50%",
    minHeight: "70vh",
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    overflow: "auto",
    p: 4,
    "@media (max-width: 600px)": {
      width: "100%",
      minHeight: "70vh",
    },
  };

  function ViewCell(props) {
    return (
      <div>
        <Button onClick={() => handleOpenModal(props.row.uid)}>View</Button>
        <Modal
          open={showModal}
          onClose={handleCloseModal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <InboxModal></InboxModal>
          </Box>
        </Modal>
      </div>
    );
  }

  return (
    <Sidebar>
      <div className="reviewdatatable">
        <div className=" mt-[2rem]" style={{ height: 500 }}>
          <DataGrid
            autoWidth
            disableHorizontalScroll
            rows={submissions}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
            loadingOverlay={
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CircularProgress />
              </div>
            }
          />
        </div>
      </div>
    </Sidebar>
  );
};

export default Inbox;
