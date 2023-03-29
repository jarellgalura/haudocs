import React, { useState, useEffect, useContext } from "react";
import Sidebar from "../../components/Sidebar";
import "./application.css";
import { FaSpinner, FaTimes } from "react-icons/fa";
import { AiFillCheckCircle, AiOutlineFile } from "react-icons/ai";
import { StatusContext } from "./StatusContext";
import PendingIcon from "@mui/icons-material/Pending";
import { Box, CircularProgress, Container, Typography } from "@mui/material";

function Application() {
  const { status } = useContext(StatusContext);

  const getStatusIcon = () => {
    switch (status) {
      case "Your application for initial review has been completed":
        return (
          <Box display="flex" alignItems="center" justifyContent="center">
            <AiFillCheckCircle size={70} color="green" />
          </Box>
        );
      case "Your application is in process for initial review":
      case "Your application is in process for Continuing review":
      case "Your application is in process for Final review":
        return (
          <Box display="flex" alignItems="center" justifyContent="center">
            <CircularProgress sx={{ color: "maroon" }} size={70} />
          </Box>
        );
      case "Your application for initial review has been declined":
      case "Your application for Continuing review has been declined":
      case "Your application for Continuing review has been completed":
      case "Your application for Final review has been completed":
        return (
          <Box display="flex" alignItems="center" justifyContent="center">
            <FaTimes size={70} color="red" />
          </Box>
        );
      default:
        return (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            mb={5}
          >
            <AiOutlineFile size={70} color="gray" />
          </Box>
        );
    }
  };

  useEffect(() => {
    console.log("Status updated:", status);
  }, [status]);

  return (
    <Sidebar>
      <Container>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          minHeight="calc(70vh - 64px)"
        >
          {getStatusIcon()}
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", textAlign: "center" }}
          >
            {status}
          </Typography>
        </Box>
      </Container>
    </Sidebar>
  );
}

export default Application;
