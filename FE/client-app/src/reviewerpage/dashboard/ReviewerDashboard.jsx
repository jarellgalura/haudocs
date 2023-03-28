import React from "react";
import { Grid, Box } from "@mui/material";
import Reviewersidebar from "../Reviewersidebar";
import Completed from "./Completed";
import Progress from "./Progress";
import "./reviewer.css";

function ReviewerDashboard() {
  return (
    <Reviewersidebar>
      <Grid
        container
        spacing={2}
        justifyContent="center"
        alignItems="stretch"
        sx={{ gap: 5 }}
      >
        <Grid item xs={12} sm={6} md={6} lg={4}>
          <Box
            sx={{
              p: 2,
              borderRadius: 1,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              height: "50vh",
              display: "flex",
              flexDirection: "column",
              borderRadius: "16px",
              overflow: "hidden",
              justifyContent: "center",
              alignItems: "center",
              width: { lg: "30vw", md: "100%", sm: "100%", xs: "100%" },
            }}
          >
            <Progress sx={{ flexGrow: 1 }} />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={6} lg={4}>
          <Box
            sx={{
              p: 2,
              borderRadius: 1,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              height: "50vh",
              display: "flex",
              flexDirection: "column",
              borderRadius: "16px",
              overflow: "hidden",
              justifyContent: "center",
              alignItems: "center",
              width: { lg: "30vw", md: "100%", sm: "100%", xs: "100%" },
            }}
          >
            <Completed sx={{ flexGrow: 1 }} />
          </Box>
        </Grid>
      </Grid>
    </Reviewersidebar>
  );
}

export default ReviewerDashboard;
