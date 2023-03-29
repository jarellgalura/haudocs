import React, { useState } from "react";
import PropTypes from "prop-types";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import Modal from "@mui/material/Modal";
import Reviewersmodal from "./modals/Reviewersmodal";

function Reviewersstab(props) {
  const [showModal, setShowModal] = useState(false);

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
      minHeight: "70vh",
    },
  };

  const columns = [
    { field: "protocolnumber", headerName: "Protocol Number", width: "350" },
    { field: "datesent", headerName: "Date Sent", width: "350" },
    { field: "duedate", headerName: "Due Date", width: "350" },
    {
      field: "action",
      headerName: "Action",
      width: "200",
      renderCell: (params) => <ViewCell {...params} />,
    },
  ];

  const rows = [
    {
      id: "",
      protocolnumber: "2023-001-NAME-TITLE",
      datesent: "January 28, 2023",
      duedate: "March 26, 2023",
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
            <Reviewersmodal handleCloseModal={handleCloseModal} />
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
    <div className="shadow-md" style={{ height: 400, width: "100%" }}>
      <DataGrid
        classes={{ header: "custom-header" }}
        rows={rows}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
      />
    </div>
  );
}

export default Reviewersstab;
