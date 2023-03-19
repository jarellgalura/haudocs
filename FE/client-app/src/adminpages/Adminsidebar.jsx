import React from "react";
import { FaTh, FaUserAlt } from "react-icons/fa";
import { AiOutlineFileSync, AiFillSetting } from "react-icons/ai";
import { FiLogOut } from "react-icons/fi";
import { RiFileTransferFill } from "react-icons/ri";
import { BsFillArchiveFill } from "react-icons/bs";
import { NavLink } from "react-router-dom";
import "./adminsidebar.css";
import Navbar from "../components/navbar/Navbar";
import { GoFileSymlinkDirectory } from "react-icons/go";
import { UserAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Adminsidebar = ({ children }) => {
  const { logout } = UserAuth();
  const navigate = useNavigate();

  const AdminsidenavItem = [
    {
      path: "/admindashboard",
      name: "Dashboard",
      icon: <FaTh />,
    },
    {
      path: "/adminapplication",
      name: "Review Status",
      icon: <AiOutlineFileSync />,
    },
    {
      path: "/adminsubmissions",
      name: "Submissions",
      icon: <GoFileSymlinkDirectory />,
    },
    {
      path: "/admintransfer",
      name: "Transfer",
      icon: <RiFileTransferFill />,
    },
    {
      path: "/adminarchiving",
      name: "Archiving",
      icon: <BsFillArchiveFill />,
    },
    {
      path: "/adminusers",
      name: "Users",
      icon: <FaUserAlt />,
    },
  ];
  return (
    <div className="container">
      <div className="sidebar">
        <Navbar />
        <div className="top_section"></div>
        {AdminsidenavItem.map((item, index) => (
          <NavLink to={item.path} key={index} className="link-adminsidebar">
            <div className="icon-admin">{item.icon}</div>
            <div className="link_text">{item.name}</div>
          </NavLink>
        ))}
      </div>
      <div className="main-content">
        <main>{children}</main>
      </div>
    </div>
  );
};

export default Adminsidebar;
