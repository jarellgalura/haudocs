import react from "react";
import { Grid, Box } from "@mui/material";
import Adminsidebar from "../Adminsidebar";
import Count from "./Count";
import Protocolscount from "./Protocolscount";
import Ongoing from "./Ongoing";
import Research from "./Research";
import "./admindashboard.css";
import Papa from "papaparse";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { Button } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers-pro";
import { AdapterDayjs } from "@mui/x-date-pickers-pro/AdapterDayjs";
import { DateRangePicker } from "@mui/x-date-pickers-pro/DateRangePicker";

function AdminDashboard() {
  const fetchDataAndConvertToCSV = async () => {
    const db = getFirestore();
    const submissionsCollection = collection(db, "submissions");

    const researchTypes = [
      "Biomedical Studies",
      "Health Operations Research",
      "Clinical Trials",
      "Public Health Research",
      "Social Research",
      "Others",
    ];

    const reviewTypes = [
      "Full Board Review",
      "Expedited Review",
      "Exempt from Review",
    ];

    let aggregatedData = researchTypes.map((researchType) => {
      const row = { research_type: researchType };
      reviewTypes.forEach((reviewType) => {
        row[reviewType] = 0;
      });
      row["Non-HAU Schools"] = 0;
      return row;
    });

    const processSnapshot = (snapshot) => {
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const researchTypeIndex = researchTypes.indexOf(data.research_type);
        const reviewType = data.review_type;
        const school = data.school;

        if (researchTypeIndex !== -1) {
          if (reviewTypes.includes(reviewType)) {
            aggregatedData[researchTypeIndex][reviewType]++;
          }

          if (school !== "HAU") {
            aggregatedData[researchTypeIndex]["Non-HAU Schools"]++;
          }
        }
      });

      const csv = Papa.unparse(aggregatedData);
      return csv;
    };

    return new Promise((resolve, reject) => {
      onSnapshot(submissionsCollection, (snapshot) => {
        try {
          const csv = processSnapshot(snapshot);
          resolve(csv);
        } catch (error) {
          reject(error);
        }
      });
    });
  };

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownload = async () => {
    const csv = await fetchDataAndConvertToCSV();
    downloadCSV(csv, "archive.csv");
  };

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
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateRangePicker
            localeText={{ start: "Start-Date", end: "End-Date" }}
          />
        </LocalizationProvider>
        <Box
          className="size"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "end",
            justifyContent: "end",
            marginBottom: "20px",
          }}
        >
          <Button variant="contained" onClick={handleDownload}>
            Download Stats
          </Button>
        </Box>
        <Grid sx={{ marginTop: 1, marginBottom: 3 }} container spacing={2}>
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
