import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, getDownloadURL } from "firebase/storage";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore/lite";
import userIcon from "../assets/usericon.png";
import { storage } from "../firebase";
import {
  Dashboard,
  AssignmentTurnedIn,
  CloudDownload,
  SwapHoriz,
  Archive,
  People,
} from "@mui/icons-material";
import { NavLink } from "react-router-dom";
import { styled } from "@mui/material/styles";
import {
  Menu,
  MenuItem,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  IconButton,
  Typography,
  Tooltip,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  ClickAwayListener,
} from "@mui/material";
import { Notifications, ExitToApp } from "@mui/icons-material";
import Settings from "@mui/icons-material/Settings";
import { useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import MenuIcon from "@mui/icons-material/Menu";
import Logout from "@mui/icons-material/Logout";
import AssignmentIcon from "@mui/icons-material/Assignment";

const drawerWidth = 220;

const Main = styled("div")(({ theme, drawerWidth }) => ({
  display: "flex",
  [theme.breakpoints.up("md")]: {
    "& .MuiDrawer-paper": {
      width: drawerWidth,
      boxSizing: "border-box",
    },
  },
  [theme.breakpoints.down("sm")]: {
    "& .MuiDrawer-paper": {
      width: "0px",
    },
  },
}));

const DrawerHeader = styled(Toolbar)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  "& div:first-child": {
    display: "flex",
    alignItems: "center",
  },
  "& div:last-child": {
    display: "flex",
    alignItems: "center",
    "& > *": {
      marginLeft: theme.spacing(1),
    },
  },
  [theme.breakpoints.down("sm")]: {
    "& div:nth-child(2)": {
      display: "none",
    },
  },
}));

const Reviewersidebar = ({ children }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [value, setValue] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("/");
  const [anchorEl2, setAnchorEl2] = useState(null);
  const [selectedItem, setSelectedItem] = useState("");
  const navigate = useNavigate();
  const open = Boolean(anchorEl2);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || null
  );
  const [imageUrl, setImageUrl] = useState(
    localStorage.getItem("profileImageUrl") || null
  );
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "New notification 1",
      read: false,
    },
    {
      id: 2,
      message: "New notification 2",
      read: false,
    },
  ]);

  const handleMenuClick = (event) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleLogout = () => {
    auth.signOut();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/");
    }, 1000);
    handleClose();
  };

  const handleSettings = () => {
    navigate("/reviewersettings");
    handleClose();
  };

  const handleMenuClose = () => {
    setAnchorEl2(null);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClose2 = () => {
    setIsOpen(false);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    console.log(selectedItem);
  }, [selectedItem]);

  const handleMarkAllRead = () => {
    const updatedNotifications = notifications.map((n) => {
      return {
        ...n,
        read: true,
      };
    });
    setNotifications(updatedNotifications);
    setAnchorEl(null);
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.photoURL) {
          setImageUrl(user.photoURL);
          localStorage.setItem("profileImageUrl", user.photoURL);
        } else {
          const storageRef = ref(storage, `users/${user.uid}/profile_picture`);
          getDownloadURL(storageRef)
            .then((url) => {
              setImageUrl(url);
              localStorage.setItem("profileImageUrl", url);
            })
            .catch((error) => {
              console.log(error);
            });
        }
      } else {
        setImageUrl(null);
        localStorage.removeItem("profileImageUrl");
      }
      setCurrentUser(user);
    });
    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setCurrentUser(currentUser);

      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);

        getDoc(userRef).then((doc) => {
          if (doc.exists()) {
            const name = doc.data().name;
            setUserName(name);
            localStorage.setItem("userName", name);
          }
        });
      }
    });

    return unsubscribe;
  }, []);

  const hasPhotoURL = currentUser && currentUser.photoURL;

  const SidenavItem = [
    {
      path: "/reviewerdashboard",
      name: "Dashboard",
      icon: <Dashboard />,
    },
    {
      path: "/reviewerstatus",
      name: "Review Status",
      icon: <AssignmentTurnedIn />,
    },
    {
      path: "/assignedprotocol",
      name: "Assigned Protocol",
      icon: <AssignmentIcon />,
    },
  ];
  useEffect(() => {
    setActiveLink(window.location.pathname);
  }, []);

  const drawer = isMobile ? (
    <AppBar sx={{ backgroundColor: "maroon" }} position="fixed">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" noWrap key={selectedItem}>
          {selectedItem || "HAUDOCS"}
        </Typography>

        <div
          style={{ display: "flex", alignItems: "center", marginLeft: "auto" }}
        >
          <Badge
            badgeContent={notifications.filter((n) => !n.read).length}
            color="error"
            sx={{ marginRight: "20px" }}
          >
            <Notifications sx={{ cursor: "pointer" }} onClick={handleClick} />
          </Badge>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                mt: 1.5,
                "& .MuiAvatar-root": {
                  width: 32,
                  height: 32,
                  ml: -0.51,
                  mr: 1,
                },
                "&:before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 15,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            {notifications.map((n) => (
              <MenuItem key={n.id} onClick={handleClose}>
                {n.message}
              </MenuItem>
            ))}
            <MenuItem onClick={handleMarkAllRead}>Mark all as read</MenuItem>
          </Menu>
          <div className="menu-trigger">
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleMenuClick}
                size="small"
                aria-controls={open ? "account-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
              >
                <img
                  src={
                    imageUrl ||
                    (currentUser && hasPhotoURL
                      ? currentUser.photoURL
                      : userIcon)
                  }
                  alt="Profile"
                />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl2}
              id="account-menu"
              open={open}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: "visible",
                  filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                  mt: 1.5,
                  "& .MuiAvatar-root": {
                    width: 32,
                    height: 32,
                    ml: -0.51,
                    mr: 1,
                  },
                  "&:before": {
                    content: '""',
                    display: "block",
                    position: "absolute",
                    top: 0,
                    right: 15,
                    width: 10,
                    height: 10,
                    bgcolor: "background.paper",
                    transform: "translateY(-50%) rotate(45deg)",
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem onClick={handleClose}>
                <Typography>Hello, {userName}!</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleSettings}>
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                Settings
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </div>
        </div>
      </Toolbar>
      <Paper
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          display: "none",
          "@media (min-width: 390px)": {
            display: "block",
          },
        }}
      >
        <BottomNavigation
          sx={{
            backgroundColor: "white",
            color: "white",
            "& .Mui-selected .MuiBottomNavigationAction-label": {
              color: "gold",
            },
            "& .MuiBottomNavigationAction-root": {
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            },
            boxShadow: "0px -1px 10px rgba(0, 0, 0, 0.1)",
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            borderRadius: "10px 10px 0px 0px",
          }}
          showLabels
          value={activeLink}
          onChange={handleChange}
        >
          <BottomNavigationAction
            to="/reviewerdashboard"
            component={NavLink}
            label={<Typography style={{ fontSize: 10 }}>Dashboard</Typography>}
            icon={<Dashboard />}
          />
          <BottomNavigationAction
            to="/reviewerstatus"
            component={NavLink}
            label={
              <Typography style={{ fontSize: 10 }}>Submissions</Typography>
            }
            icon={<AssignmentTurnedIn />}
          />
          <BottomNavigationAction
            to="/assignedprotocol"
            component={NavLink}
            label={<Typography style={{ fontSize: 10 }}>Transfer</Typography>}
            icon={<AssignmentIcon />}
          />
        </BottomNavigation>
      </Paper>
    </AppBar>
  ) : (
    <Drawer variant="persistent" anchor="left" open={true}>
      <DrawerHeader>
        <div className="menu-trigger">
          <img
            src={
              imageUrl ||
              (currentUser && hasPhotoURL ? currentUser.photoURL : userIcon)
            }
            alt="Profile"
            width={30}
            height={30}
          />
        </div>
        <div className="text-sm ml-3">{userName}</div>
        <div>
          <Badge
            badgeContent={notifications.filter((n) => !n.read).length}
            color="error"
          >
            <Notifications sx={{ cursor: "pointer" }} onClick={handleClick} />
          </Badge>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            {notifications.map((n) => (
              <MenuItem key={n.id} onClick={handleClose}>
                {n.message}
              </MenuItem>
            ))}
            <MenuItem onClick={handleMarkAllRead}>Mark all as read</MenuItem>
          </Menu>
        </div>
      </DrawerHeader>
      <List>
        <Divider />
        {SidenavItem.map((item, index) => (
          <NavLink
            to={item.path}
            key={index}
            className="link-sidebar"
            onClick={() => {
              setValue(index);
              setSelectedItem(item.name);
              console.log(selectedItem);
            }}
          >
            <ListItem key={item.name}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItem>
          </NavLink>
        ))}
      </List>

      <div style={{ flexGrow: 1 }}></div>
      <Divider />
      <List>
        <ListItem
          className="link-sidebar"
          key="settings"
          component={NavLink}
          to="/reviewersettings"
        >
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
        <ListItem
          className="link-sidebar"
          key="logout"
          sx={{ cursor: "pointer" }}
          onClick={handleLogout}
        >
          <ListItemIcon>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Drawer>
  );

  const menuDrawer = (
    // menu drawer
    <Drawer
      variant="temporary"
      anchor="left"
      open={isMenuOpen}
      onClose={() => setIsMenuOpen(false)}
    >
      <DrawerHeader>
        <div className="menu-trigger">
          <img
            src={
              imageUrl ||
              (currentUser && hasPhotoURL ? currentUser.photoURL : userIcon)
            }
            alt="Profile"
            width={30}
            height={30}
          />
          <Typography className="text-sm ml-3">{userName}</Typography>
        </div>
      </DrawerHeader>
      <List>
        {SidenavItem.map((item, index) => (
          <NavLink
            to={item.path}
            key={index}
            className="link-sidebar"
            onClick={() => {
              setValue(index);
              setSelectedItem(item.name);
            }}
          >
            <ListItem key={item.name}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.name} />
            </ListItem>
          </NavLink>
        ))}
      </List>

      <div style={{ flexGrow: 1 }}></div>
      <Divider />
      <List>
        <ListItem
          className="link-sidebar"
          key="settings"
          component={NavLink}
          to="/reviewersettings"
        >
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
        <ListItem
          className="link-sidebar"
          key="logout"
          sx={{ cursor: "pointer" }}
          onClick={handleLogout}
        >
          <ListItemIcon>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Drawer>
  );

  return (
    <ClickAwayListener onClickAway={handleClose2}>
      <Main drawerWidth={drawerWidth}>
        {drawer}
        {menuDrawer}
        <div className="main-content">
          <Toolbar />
          {children}
        </div>
      </Main>
    </ClickAwayListener>
  );
};

export default Reviewersidebar;
