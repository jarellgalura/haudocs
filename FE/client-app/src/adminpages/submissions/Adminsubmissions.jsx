import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Adminsidebar from "../Adminsidebar";
import Applicantstab from "./applicants/Applicantstab";
import Reviewersstab from "./applicants/Reviewerstab";
import "./adminsubmission.css";

function Adminsubmissions() {
  const [value, setValue] = React.useState(0);

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

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  const theme = createTheme({
    palette: {
      primary: {
        main: "#FFFFFF", // set the primary color to red
      },
    },
  });

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const CustomTabs = styled(Tabs)({
    "& .Mui-selected": {
      backgroundColor: "maroon",
      color: "white",
    },
  });

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
    <Adminsidebar>
      <div className="admin-submission">
        <div className="adminsubmit">
          <Box sx={{ width: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <ThemeProvider theme={theme}>
                <CustomTabs value={value} onChange={handleChange}>
                  <Tab label="Applicants" {...a11yProps(0)} />
                  <Tab label="Reviewers" {...a11yProps(1)} />
                </CustomTabs>
              </ThemeProvider>
            </Box>
            <TabPanel value={value} index={0}>
              <Applicantstab />
            </TabPanel>
            <TabPanel value={value} index={1}>
              <Reviewersstab />
            </TabPanel>
          </Box>
        </div>
      </div>
    </Adminsidebar>
  );
}

export default Adminsubmissions;
