import react from "react";
import { Grid, Box } from "@mui/material";
import Adminsidebar from "../Adminsidebar";
import Count from "./Count";
import Protocolscount from "./Protocolscount";
import Ongoing from "./Ongoing";
import Research from "./Research";
import "./admindashboard.css";

function AdminDashboard() {
  return (
    <Adminsidebar>
      <Box
        className="size"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                width: "100%",
                height: "300px",
                border: "2px solid black",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "10px",
                boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.3)",
              }}
            >
              <Count />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                width: "100%",
                height: "300px",
                border: "2px solid black",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "10px",
                boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.3)",
              }}
            >
              <Protocolscount />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                width: "100%",
                height: "300px",
                border: "2px solid black",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "10px",
                boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.3)",
              }}
            >
              <Ongoing />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                width: "100%",
                height: "300px",
                border: "2px solid black",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "10px",
                boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.3)",
              }}
            >
              <Research />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Adminsidebar>
  );
}

export default AdminDashboard;
