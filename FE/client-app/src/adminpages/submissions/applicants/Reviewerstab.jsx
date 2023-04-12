import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import Modal from "@mui/material/Modal";
import Reviewersmodal from "./modals/Reviewersmodal";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { auth } from "../../../firebase";
import CircularProgress from "@mui/material/CircularProgress";

function Reviewersstab(props) {
  const [showModal, setShowModal] = useState(false);
  const [selectedUid, setSelectedUid] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getFirestore();
    const submissionsCollection = collection(db, "submissions");
    const unsubscribe = onSnapshot(
      query(submissionsCollection, where("rev_initial_files", "!=", [])),
      (snapshot) => {
        const submissionsData = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              rev_to_admin_sent_date: data.rev_to_admin_sent_date
                ? new Date(
                    data.rev_to_admin_sent_date.seconds * 1000
                  ).toLocaleString()
                : null,
              due_date: data.due_date
                ? new Date(data.due_date.seconds * 1000).toLocaleString()
                : null,
            };
          })
          .filter((submission) => submission.completed === false);
        setSubmissions(submissionsData);
        setLoading(false);
      }
    );
    return () => {
      unsubscribe();
    };
  }, []);

  function handleOpenModal(uid) {
    setSelectedUid(uid);
    setShowModal(true);
  }

  function handleCloseModal() {
    setSelectedUid(null);
    setShowModal(false);
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

  const columns = [
    { field: "protocol_no", headerName: "Protocol Number", flex: 1 },
    { field: "rev_to_admin_sent_date", headerName: "Date Sent", flex: 1 },
    { field: "due_date", headerName: "Due Date", flex: 1 },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => <ViewCell {...params} />,
    },
  ];

  function ViewCell(props) {
    return (
      <div>
        <Button
          onClick={() => handleOpenModal(props.row.uid)}
          style={viewStyle}
        >
          View
        </Button>
        <Modal
          open={showModal}
          onClose={handleCloseModal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            {selectedUid && (
              <Reviewersmodal
                uid={selectedUid}
                handleCloseModal={handleCloseModal}
              />
            )}
          </Box>
        </Modal>
      </div>
    );
  }

  const viewStyle = {
    color: "maroon",
  };

  function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }

  TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  };

  return (
    <div style={{ height: 400 }}>
      <DataGrid
        classes={{ header: "custom-header" }}
        rows={submissions}
        columns={columns}
        loading={loading}
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
        pageSize={5}
        rowsPerPageOptions={[5]}
        disableHorizontalScroll
        autoWidth
      />
    </div>
  );
}

export default Reviewersstab;
