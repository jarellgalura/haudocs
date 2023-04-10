import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
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
  const [protocolNo, setProtocolNo] = useState(null);

  useEffect(() => {
    const db = getFirestore();
    const submissionsCollection = collection(db, "submissions");
    const currentUser = auth.currentUser;

    if (currentUser) {
      const submissionsQuery = query(
        submissionsCollection,
        where("reviewer", "array-contains", currentUser.email)
      );

      const unsubscribe = onSnapshot(submissionsQuery, (snapshot) => {
        const submissionsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            rev_date_sent: data.rev_date_sent
              ? new Date(data.rev_date_sent.seconds * 1000).toLocaleString()
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
    }
  }, []);

  function handleOpenModal(protocol_no) {
    setProtocolNo(protocol_no);
    setShowModal(true);
  }

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
    { field: "rev_date_sent", headerName: "Date Sent", width: "350" },
    { field: "due_date", headerName: "Due Date", width: "350" },
    {
      field: "action",
      headerName: "Action",
      width: "200",
      renderCell: (params) => <ViewCell {...params} />,
    },
  ];

  function ViewCell(id) {
    console.log(id.row.protocol_no);
    return (
      <div>
        <Button
          onClick={() => handleOpenModal(id.row.protocol_no)}
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
            {protocolNo && (
              <Assignedmodal
                protocol_no={protocolNo}
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
