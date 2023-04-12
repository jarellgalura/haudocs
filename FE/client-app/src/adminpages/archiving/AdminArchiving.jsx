import { useState, useEffect } from "react";
import Adminsidebar from "../Adminsidebar";
import Button from "@mui/material/Button";
import { DataGrid } from "@mui/x-data-grid";
import "./archiving.css";
import { Box } from "@mui/system";
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import Modal from "@mui/material/Modal";
import Applicanttabmodal from "../submissions/applicants/modals/Applicanttabmodal";

const Archiving = (props) => {
  const [selectedUid, setSelectedUid] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const db = getFirestore();
    const submissionsCollection = collection(db, "submissions");
    const q = query(submissionsCollection, where("completed", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const submissionsData = snapshot.docs.map((doc) => {
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
      });
      setSubmissions(submissionsData);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const viewStyle = {
    color: "maroon",
  };

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
    { field: "review_type", headerName: "Review Type", flex: 1 },
    { field: "reviewer", headerName: "Reviewer", flex: 1 },
    { field: "date_completed", headerName: "Date Completed", flex: 1 },
    {
      field: "action",
      headerName: "Action",
      renderCell: (params) => <ViewCell {...params} />,
      width: 180,
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
              <Applicanttabmodal
                uid={selectedUid}
                handleCloseModal={handleCloseModal}
              />
            )}
          </Box>
        </Modal>
      </div>
    );
  }

  return (
    <Adminsidebar>
      <div className="archivingdatatable">
        <h1 className="text-center text-2xl font-bold">Archiving</h1>
        <Box sx={{ height: 400, marginTop: 4 }}>
          <DataGrid
            rows={submissions}
            autoWidth
            disableHorizontalScroll
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
          />
        </Box>
      </div>
    </Adminsidebar>
  );
};

export default Archiving;
