import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  getFirestore,
} from "firebase/firestore";
import PropTypes from "prop-types";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import Modal from "@mui/material/Modal";
import Assignedmodal from "./modals/Assignedmodal";
import "../assignedprotocol.css";
import Reviewersidebar from "../../Reviewersidebar";
import { auth } from "../../../firebase";

function AssignedProtocol() {
  const [showModal, setShowModal] = useState(false);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const db = getFirestore();
    const submissionsCollection = collection(db, "submissions");
    const currentUser = auth.currentUser;

    if (currentUser) {
      const q = query(
        submissionsCollection,
        where("reviewer", "==", currentUser.uid),
        where("reviewer", "!=", "")
      );

      getDocs(q).then((querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => {
          const docData = doc.data();
          return {
            id: doc.id,
            ...docData,
            date_sent: docData.date_sent
              ? new Date(docData.date_sent.seconds * 1000).toLocaleString()
              : null,
            due_date: docData.due_date
              ? new Date(docData.due_date.seconds * 1000).toLocaleString()
              : null,
          };
        });
        setSubmissions(data);
      });
    }
  }, []);

  function handleCloseModal() {
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
      minHeight: "80vh",
    },
  };

  const columns = [
    { field: "protocol_no", headerName: "Protocol Number", width: "350" },
    { field: "date_sent", headerName: "Date Sent", width: "350" },
    { field: "duedate", headerName: "Due Date", width: "350" },
    {
      field: "action",
      headerName: "Action",
      width: "200",
      renderCell: (params) => <ViewCell {...params} />,
    },
  ];

  function ViewCell(id) {
    return (
      <div>
        <Button onClick={() => setShowModal(true)} style={viewStyle}>
          View
        </Button>
        <Modal
          open={showModal}
          onClose={handleCloseModal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Assignedmodal handleCloseModal={handleCloseModal} />
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
    <Reviewersidebar>
      <div className="assigned">
        <h1 className="text-center text-2xl font-bold">Assigned Protocol</h1>
        <div className="mt-[2rem]" style={{ height: 400 }}>
          <DataGrid
            classes={{ header: "custom-header" }}
            rows={submissions}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[5]}
          />
        </div>
      </div>
    </Reviewersidebar>
  );
}

export default AssignedProtocol;
