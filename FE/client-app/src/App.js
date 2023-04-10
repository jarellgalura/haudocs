import React, { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  Dashboard,
  Application,
  Download,
  Setting,
  Submission,
  Logout,
  ReSubmission,
  Inbox,
} from "./pages";
import { AuthContextProvider } from "./context/AuthContext";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import ProtectedRoute from "./login/ProtectedRoute";
import { Navigate } from "react-router-dom";
import Signin from "./login/auth/Signin";
import Signup from "./login/auth/Signup";
import VerifyEmail from "./login/verifyemail/VerifyEmail";
import { AuthProvider } from "./context/Authvalue";
import Forgotpassword from "./login/auth/Forgotpassword";
import {
  ReviewerDashboard,
  Reviewstatus,
  Reviewerlogout,
  Reviewersettings,
  AssignedProtocol,
} from "./reviewerpage";
import {
  AdminDashboard,
  AdminApplication,
  AdminArchiving,
  Adminsubmissions,
  AdminUsers,
  AdminLogout,
  AdminSettings,
} from "./adminpages";
import { db } from "./firebase";
import { doc, getDoc } from "firebase/firestore/lite";
import LandingPage from "./components/Landingpage";
import LoadingPage from "./components/Loadingpage";
import "./index.css";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [timeActive, setTimeActive] = useState(false);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setCurrentUser(user);
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setRole(userData.role);
        } else {
          console.log("User document not found");
        }
      } else {
        setCurrentUser(null);
        setRole("");
        console.log("User not logged in");
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setTimeActive(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [timeActive]);

  if (loading) {
    return (
      <div>
        <LoadingPage />
      </div>
    );
  }

  return (
    <AuthContextProvider>
      <AuthProvider value={{ role, currentUser, timeActive, setTimeActive }}>
        <BrowserRouter>
          <Routes>
            <Route
              path="*"
              element={
                currentUser && role ? (
                  <>
                    {role === "admin" && (
                      <Navigate to="/admindashboard" replace />
                    )}
                    {role === "scientist" && (
                      <Navigate to="/reviewerdashboard" replace />
                    )}
                    {role === "non-scientist" && (
                      <Navigate to="/reviewerdashboard" replace />
                    )}
                    {role === "applicant" && (
                      <Navigate to="/dashboard" replace />
                    )}
                  </>
                ) : currentUser || role ? null : (
                  <LandingPage />
                )
              }
            />

            <Route
              path="/Signin"
              element={
                !currentUser || !currentUser.emailVerified ? (
                  <Signin />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            <Route
              path="/Signup"
              element={
                !currentUser || !currentUser.emailVerified ? (
                  <Signup />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route path="/verifyemail" element={<VerifyEmail />} />
            <Route path="/forgotpassword" element={<Forgotpassword />} />

            {/* APPLICANTS ROUTES */}
            <Route
              path="/dashboard"
              element={
                role === "applicant" ? (
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/application"
              element={
                role === "applicant" ? (
                  <ProtectedRoute>
                    <Application />
                  </ProtectedRoute>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/download"
              element={
                role === "applicant" ? (
                  <ProtectedRoute>
                    <Download />
                  </ProtectedRoute>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/setting"
              element={
                role === "applicant" ? (
                  <ProtectedRoute>
                    <Setting />
                  </ProtectedRoute>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/submission"
              element={
                role === "applicant" ? (
                  <ProtectedRoute>
                    <Submission />
                  </ProtectedRoute>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/resubmission"
              element={
                role === "applicant" ? (
                  <ProtectedRoute>
                    <ReSubmission />
                  </ProtectedRoute>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/inbox"
              element={
                role === "applicant" ? (
                  <ProtectedRoute>
                    <Inbox />
                  </ProtectedRoute>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/logout"
              element={
                role === "applicant" ? (
                  <ProtectedRoute>
                    <Logout />
                  </ProtectedRoute>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            {/* ADMIN ROUTES */}
            <Route
              path="/admindashboard"
              element={
                role === "admin" ? (
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/adminapplication"
              element={
                role === "admin" ? (
                  <ProtectedRoute>
                    <AdminApplication />
                  </ProtectedRoute>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/adminarchiving"
              element={
                role === "admin" ? (
                  <ProtectedRoute>
                    <AdminArchiving />
                  </ProtectedRoute>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/adminsubmissions"
              element={
                role === "admin" ? (
                  <ProtectedRoute>
                    <Adminsubmissions />
                  </ProtectedRoute>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/adminusers"
              element={
                role === "admin" ? (
                  <ProtectedRoute>
                    <AdminUsers />
                  </ProtectedRoute>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/adminsettings"
              element={
                role === "admin" ? (
                  <ProtectedRoute>
                    <AdminSettings />
                  </ProtectedRoute>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/adminlogout"
              element={
                role === "admin" ? (
                  <ProtectedRoute>
                    <AdminLogout />
                  </ProtectedRoute>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            {/* REVIEWER ROUTES */}
            <Route
              path="/reviewerdashboard"
              element={
                role === "scientist" || role === "non-scientist" ? (
                  <ProtectedRoute>
                    <ReviewerDashboard />
                  </ProtectedRoute>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/reviewerstatus"
              element={
                role === "scientist" || role === "non-scientist" ? (
                  <ProtectedRoute>
                    <Reviewstatus />
                  </ProtectedRoute>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/assignedprotocol"
              element={
                role === "scientist" || role === "non-scientist" ? (
                  <ProtectedRoute>
                    <AssignedProtocol />
                  </ProtectedRoute>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/reviewersettings"
              element={
                role === "scientist" || role === "non-scientist" ? (
                  <ProtectedRoute>
                    <Reviewersettings />
                  </ProtectedRoute>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/reviewerlogout"
              element={
                role === "scientist" || role === "non-scientist" ? (
                  <ProtectedRoute>
                    <Reviewerlogout />
                  </ProtectedRoute>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </AuthContextProvider>
  );
}

export default App;
