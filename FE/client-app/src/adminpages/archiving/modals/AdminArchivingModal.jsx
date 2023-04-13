import React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ArchiveInitial from "./ArchiveInitial";

function AdminArchivingModal(props) {
  console.log("applicant", props.uid);
  const [value, setValue] = React.useState(0);
  const { handleCloseModal } = props;

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
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
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

  return (
    <div className="flex items-center, justify-center">
      <Box sx={{ width: "100%" }}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ThemeProvider theme={theme}>
            <CustomTabs
              value={value}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons
              allowScrollButtonsMobile
            >
              <Tab label="Initial Review" {...a11yProps(0)} />
              <Tab label="Continuing Review" {...a11yProps(1)} />
              <Tab label="Final Review" {...a11yProps(2)} />
            </CustomTabs>
          </ThemeProvider>
        </Box>
        <TabPanel value={value} index={0}>
          <ArchiveInitial handleCloseModal={handleCloseModal} />
        </TabPanel>

        {/* Continuing TAB */}
        <TabPanel value={value} index={1}></TabPanel>

        {/* Final TAB */}
        <TabPanel value={value} index={2}></TabPanel>
      </Box>
    </div>
  );
}

export default AdminArchivingModal;