import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import "./application.css";
import { FaSpinner, FaTimes } from "react-icons/fa";
import { AiFillCheckCircle, AiOutlineFile } from "react-icons/ai";
import { Box, CircularProgress, Container, Typography } from "@mui/material";
import {
  collection,
  onSnapshot,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { auth } from "../../firebase";
import { FcCancel } from "react-icons/fc";

function Application() {
  const [status, setStatus] = useState("Please wait...");

  useEffect(() => {
    const db = getFirestore();
    const unsub = onSnapshot(
      query(
        collection(db, "submissions"),
        where("uid", "==", auth.currentUser.uid)
      ),
      (querySnapshot) => {
        if (querySnapshot.docs.length === 0) {
          setStatus("You have no pending submissions for review");
        } else {
          const submission = querySnapshot.docs[0].data();
          if (submission.status === "initial") {
            setStatus("Your application is in process for Initial Review");
          } else if (submission.status === "continuing") {
            setStatus("Your application is in process for Continuing Review");
          } else if (submission.status === "final") {
            setStatus("Your application is in process for Final Review");
          } else if (submission.status === "Initial Approved") {
            setStatus("Your application for Initial Review has been completed");
          } else if (submission.status === "Continuing Approved") {
            setStatus(
              "Your application for Continuing review has been completed"
            );
          } else if (submission.status === "Final Approved") {
            setStatus("Your application for Final Review has been completed");
          } else if (submission.status === "Declined Initial") {
            setStatus("Your application for Initial Review has been declined");
          } else if (submission.status === "Declined Continuing") {
            setStatus(
              "Your application for Continuing Review has been declined"
            );
          }
        }
      }
    );
    return unsub;
  }, [auth.currentUser.uid]);

  const getStatusIcon = () => {
    if (status === null) {
      return null;
    } else if (status === "You have no pending submissions for review") {
      return (
        <Box display="flex" alignItems="center" justifyContent="center" mb={5}>
          <AiOutlineFile size={70} color="gray" />
        </Box>
      );
    } else if (
      status === "Your application for Initial Review has been declined" ||
      status === "Your application for Continuing Review has been declined"
    ) {
      return (
        <Box display="flex" alignItems="center" justifyContent="center">
          <FcCancel size={70} />
        </Box>
      );
    } else if (
      (status === "Your application for Initial Review has been completed",
      status === "Your application for Continuing review has been completed",
      status === "Your application for Final Review has been completed")
    ) {
      return (
        <Box display="flex" alignItems="center" justifyContent="center">
          <AiFillCheckCircle size={70} color="green" />
        </Box>
      );
    } else {
      return (
        <Box display="flex" alignItems="center" justifyContent="center">
          <CircularProgress sx={{ color: "maroon" }} size={70} />
        </Box>
      );
    }
  };

  const getStatusText = () => {
    if (status === null) {
      return null;
    } else {
      return (
        <Typography
          variant="h5"
          sx={{ fontWeight: "bold", textAlign: "center", marginTop: "2rem" }}
        >
          {status}
        </Typography>
      );
    }
  };

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
          {getStatusText()}
        </Box>
      </Container>
    </Sidebar>
  );
}

export default Application;
