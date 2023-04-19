import React, { useState, useEffect } from "react";
import FormData from "form-data";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  DialogContentText,
  Box,
} from "@mui/material";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  setDoc,
} from "firebase/firestore/lite";
import { db, auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import CircularProgressWithLabel from "@mui/material/CircularProgress";

const Resubmission = ({ onSubmitted }) => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [userName, setUserName] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate("/application");
  };

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

  function generateId(length) {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  async function handleSubmit() {
    setLoading(true);
    const submissionsRef = collection(db, "submissions");
    const q = query(
      submissionsRef,
      where("uid", "==", auth.currentUser.uid),
      where("ForResubmission", "==", true)
    );
    const querySnapshot = await getDocs(q);
    const form = new FormData();
    form.append("file", file);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/files`,
        {
          method: "POST",
          headers: {
            filefolder: `${auth.currentUser.uid}/resubmission`,
          },
          body: form,
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            setUploadProgress(progress);
          },
        }
      );
      const data = await response.json();
      console.log(data);

      const finalFiles = data.files.map((file) => ({
        id: generateId(16),
        status: "final",
        forReview: false,
        ...file,
      }));

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, {
          final_files: [
            ...querySnapshot.docs[0].data().final_files,
            ...finalFiles,
          ],
          status: "final",
        });
        setLoading(false);
        console.log("Document updated with ID: ", docRef.id);
        const notificationsRef = collection(db, "notifications");
        const adminUsersQuery = query(
          collection(db, "users"),
          where("role", "==", "admin")
        );
        const adminUsersSnapshot = await getDocs(adminUsersQuery);
        const adminEmails = adminUsersSnapshot.docs.map(
          (doc) => doc.data().email
        );

        adminEmails.forEach(async (email) => {
          const newNotification = {
            id: doc(notificationsRef).id,
            message: `Applicant ${userName} has submissions for final review.`,
            role: "applicant",
            read: false,
            recipientEmail: email,
            senderEmail: auth.currentUser.email,
            timestamp: serverTimestamp(),
          };
          await setDoc(doc(notificationsRef), newNotification);
        });
        onSubmitted();
      } else {
        const newSubmissionRef = await addDoc(submissionsRef, {
          uid: auth.currentUser.uid,
          status: "final",
          final_files: finalFiles,
        });
        console.log("New document created with ID: ", newSubmissionRef.id);
      }
    } catch (error) {
      console.log(error);
      return false;
    }
    return true;
  }

  const handleConfirmSubmit = async () => {
    const success = await handleSubmit();
    if (success) {
      setShowConfirmation(false);
      setShowSuccess(true);
    }
  };

  const handleOpenConfirmation = () => {
    setShowConfirmation(true);
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleOpenConfirmation();
      }}
    >
      <div className="sub-containerr">
        <div className="sub-title">
          <h1 class="text-lg font-bold">Resubmission</h1>
          <hr />
          <br />
          <div className="files">
            <div className="form">
              <article className="upload">
                <label
                  class="block mb-5 text-lg font-medium text-gray-900 dark:text-white"
                  for="file_input"
                >
                  1. Revised Manuscript
                </label>
                <input
                  class="block w-full mb-5 text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                  id="multiple_files"
                  accept=".pdf,.doc,.docx"
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files[0];
                    const fileName = file.name.toLowerCase();
                    const fileExtension = fileName.substring(
                      fileName.lastIndexOf(".") + 1
                    );

                    if (!["pdf", "doc", "docx"].includes(fileExtension)) {
                      alert(
                        "Please upload a file with a .pdf, .doc or .docx extension"
                      );
                      event.target.value = null; // Clear the input field
                    } else {
                      setFile(file);
                    }
                  }}
                />
              </article>
              <article className="upload">
                <label
                  class="block mb-5 text-lg font-medium text-gray-900 dark:text-white"
                  for="file_input"
                >
                  2. HAU-IRB FORM 2(B): Registration and Application Form
                </label>
                <input
                  class="block w-full mb-5 text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                  id="multiple_files"
                  accept=".pdf,.doc,.docx"
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files[0];
                    const fileName = file.name.toLowerCase();
                    const fileExtension = fileName.substring(
                      fileName.lastIndexOf(".") + 1
                    );

                    if (!["pdf", "doc", "docx"].includes(fileExtension)) {
                      alert(
                        "Please upload a file with a .pdf, .doc or .docx extension"
                      );
                      event.target.value = null; // Clear the input field
                    } else {
                      setFile(file);
                    }
                  }}
                />
              </article>
              <article className="upload">
                <label
                  class="block mb-5 text-lg font-medium text-gray-900 dark:text-white"
                  for="file_input"
                >
                  3. HAU-IRB FORM 3.3(A): Amendment Review Form{" "}
                </label>
                <input
                  class="block w-full mb-5 text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                  id="multiple_files"
                  accept=".pdf,.doc,.docx"
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files[0];
                    const fileName = file.name.toLowerCase();
                    const fileExtension = fileName.substring(
                      fileName.lastIndexOf(".") + 1
                    );

                    if (!["pdf", "doc", "docx"].includes(fileExtension)) {
                      alert(
                        "Please upload a file with a .pdf, .doc or .docx extension"
                      );
                      event.target.value = null; // Clear the input field
                    } else {
                      setFile(file);
                    }
                  }}
                />
              </article>
              <article className="upload">
                <label
                  class="block mb-5 text-lg font-medium text-gray-900 dark:text-white"
                  for="file_input"
                >
                  4. Others
                </label>
                <input
                  class="block w-full mb-5 text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                  id="multiple_files"
                  accept=".pdf,.doc,.docx"
                  type="file"
                  onChange={(event) => {
                    const file = event.target.files[0];
                    const fileName = file.name.toLowerCase();
                    const fileExtension = fileName.substring(
                      fileName.lastIndexOf(".") + 1
                    );

                    if (!["pdf", "doc", "docx"].includes(fileExtension)) {
                      alert(
                        "Please upload a file with a .pdf, .doc or .docx extension"
                      );
                      event.target.value = null; // Clear the input field
                    } else {
                      setFile(file);
                    }
                  }}
                />
              </article>
              <div class="w-full">
                <div class="flex space-x-4 items-center justify-end px-3 py-2 border-t dark:border-gray-600">
                  <button
                    type="submit"
                    id="sub"
                    class="inline-flex items-center py-2.5 px-[3rem] text-xs font-medium text-center text-white bg-maroon hover:bg-red-800 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900"
                  >
                    Submit
                  </button>
                </div>
              </div>
              <Dialog open={showConfirmation} onClose={handleCloseConfirmation}>
                <DialogTitle>Confirm Submission</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Are you sure you want to submit all the files?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  {loading ? (
                    <>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <CircularProgressWithLabel
                          value={uploadProgress}
                          thickness={4}
                        />
                        <DialogContentText sx={{ marginLeft: "10px" }}>
                          Submitting...
                        </DialogContentText>
                      </Box>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={handleCloseConfirmation}
                        sx={{ color: "maroon" }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleConfirmSubmit}
                        sx={{ color: "maroon" }}
                      >
                        Yes
                      </Button>
                    </>
                  )}
                </DialogActions>
              </Dialog>
              <Dialog open={showSuccess}>
                <DialogTitle>Success</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Documents successfully submitted.
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button sx={{ color: "maroon" }} onClick={handleSuccessClose}>
                    OK
                  </Button>
                </DialogActions>
              </Dialog>

              <Dialog open={showAlert} onClose={() => setShowAlert(false)}>
                <DialogTitle>{"Sorry"}</DialogTitle>
                <DialogContent>
                  <div>You have already submitted the initial form.</div>
                </DialogContent>
                <DialogActions>
                  <Button
                    sx={{ color: "maroon" }}
                    onClick={() => setShowAlert(false)}
                  >
                    OK
                  </Button>
                </DialogActions>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Resubmission;
