import React, { useState, useContext, useEffect } from "react";
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
  setDoc,
  updateDoc,
} from "firebase/firestore/lite";
import { db, auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import CircularProgressWithLabel from "@mui/material/CircularProgress";

const Continuing = ({ onSubmitted }) => {
  const navigate = useNavigate();
  const [firstFile, setFirstFile] = useState(null);
  const [secondFile, setSecondFile] = useState(null);
  const [thirdFile, setThirdFile] = useState(null);
  const [fourthFile, setFourthFile] = useState(null);
  const [fifthFile, setFifthFile] = useState(null);
  const [sixthFile, setSixthFile] = useState(null);
  const [seventhFile, setSeventhFile] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [userName, setUserName] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate("/application");
  };

  async function handleSubmit() {
    setLoading(true);
    const submissionsRef = collection(db, "submissions");
    const q = query(
      submissionsRef,
      where("uid", "==", auth.currentUser.uid),
      where("status", "==", "Initial Approved")
    );
    const querySnapshot = await getDocs(q);
    const form = new FormData();
    if (firstFile) {
      form.append("HAU-IRB 3.1(A): Progress Report Form", firstFile);
    }
    if (secondFile) {
      form.append(
        "HAU-IRB FORM 3.2(A): Early Termination Report Form",
        secondFile
      );
    }
    if (thirdFile) {
      form.append("HAU-IRB FORM 3.3(A): Amendment Review Form", thirdFile);
    }
    if (fourthFile) {
      form.append(
        "HAU-IRB FORM 3.4(A): Protocol Deviation/Violation Report Form",
        fourthFile
      );
    }
    if (fifthFile) {
      form.append("HAU-IRB FORM 3.5(A): Serious Adverse Event Form", fifthFile);
    }
    if (sixthFile) {
      form.append(
        "HAU-IRB FORM 3.5(B): Reportable Negative Events Form",
        sixthFile
      );
    }
    if (seventhFile) {
      form.append(
        "HAU-IRB FORM 3.6(A): Application for Continuing Review",
        seventhFile
      );
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/files`,
        {
          method: "POST",
          headers: {
            filefolder: `${auth.currentUser.uid}/continuing`,
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

      const continuingFiles = data.files.map((file) => ({
        id: generateId(16),
        status: "continuing",
        forReview: false,
        ...file,
      }));

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, {
          continuing_files: [
            ...querySnapshot.docs[0].data().continuing_files,
            ...continuingFiles,
          ],
          status: "continuing",
          date_sent: serverTimestamp(),
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
            message: `Applicant ${userName} has submissions for continuing review.`,
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
          status: "continuing",
          continuing_files: continuingFiles,
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

  useEffect(() => {
    // Check if at least one file has been uploaded
    const hasUploadedFile = [
      firstFile,
      secondFile,
      thirdFile,
      fourthFile,
      fifthFile,
      sixthFile,
      seventhFile,
    ].some((file) => file !== null);
    setIsButtonDisabled(!hasUploadedFile);
  }, [
    firstFile,
    secondFile,
    thirdFile,
    fourthFile,
    fifthFile,
    sixthFile,
    seventhFile,
  ]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleOpenConfirmation();
      }}
    >
      <div className="sub-containerr">
        <div className="sub-title">
          <h1 class="text-lg font-bold">Continuing Review</h1>
          <hr />
          <br />
          <div className="files">
            <div className="form shadow-2xl">
              <article className="upload">
                <label
                  class="block mb-5 text-lg font-medium text-gray-900 dark:text-white"
                  for="file_input"
                >
                  1. HAU-IRB 3.1(A): Progress Report Form
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
                      setFirstFile(file);
                    }
                  }}
                />
              </article>
              <article className="upload">
                <label
                  class="block mb-5 text-lg font-medium text-gray-900 dark:text-white"
                  for="file_input"
                >
                  2. HAU-IRB FORM 3.2(A): Early Termination Report Form
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
                      setSecondFile(file);
                    }
                  }}
                />
              </article>
              <article className="upload">
                <label
                  class="block mb-5 text-lg font-medium text-gray-900 dark:text-white"
                  for="file_input"
                >
                  3. HAU-IRB FORM 3.3(A): Amendment Review Form
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
                      setThirdFile(file);
                    }
                  }}
                />
              </article>
              <article className="ncip">
                <label
                  class="block mb-5 text-lg font-medium text-gray-900 dark:text-white"
                  for="file_input"
                >
                  4. HAU-IRB FORM 3.4(A): Protocol Deviation/Violation Report
                  Form
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
                      setFourthFile(file);
                    }
                  }}
                />
              </article>
              <article className="upload">
                <label
                  class="block mb-5 text-lg font-medium text-gray-900 dark:text-white"
                  for="file_input"
                >
                  5. HAU-IRB FORM 3.5(A): Serious Adverse Event Form
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
                      setFifthFile(file);
                    }
                  }}
                />
              </article>
              <article className="upload">
                <label
                  class="block mb-5 text-lg font-medium text-gray-900 dark:text-white"
                  for="file_input"
                >
                  6. HAU-IRB FORM 3.5(B): Reportable Negative Events Form
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
                      setSixthFile(file);
                    }
                  }}
                />
              </article>
              <article className="upload">
                <label
                  class="block mb-5 text-lg font-medium text-gray-900 dark:text-white"
                  for="file_input"
                >
                  7. HAU-IRB FORM 3.6(A): Application for Continuing Review
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
                      setSeventhFile(file);
                    }
                  }}
                />
              </article>
              <div class="w-full">
                <div class="flex space-x-4 items-center justify-end px-3 py-2 border-t dark:border-gray-600">
                  <button
                    className={`inline-flex items-center py-2.5 px-[3rem] text-xs font-medium text-center text-white bg-maroon hover:bg-red-800 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 ${
                      isButtonDisabled ? "btn-disabled" : ""
                    }`}
                    type="submit"
                    id="sub"
                    disabled={isButtonDisabled}
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

export default Continuing;
