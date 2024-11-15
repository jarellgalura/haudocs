import React, { useState, useContext, useEffect } from "react";
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
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  setDoc,
  doc,
} from "firebase/firestore/lite";
import { db, auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getDoc } from "firebase/firestore/lite";
import CircularProgressWithLabel from "@mui/material/CircularProgress";

function Initial({ onSubmitted }) {
  const navigate = useNavigate();
  const [firstFile, setFirstFile] = useState(null);
  const [secondFile, setSecondFile] = useState(null);
  const [thirdFile, setThirdFile] = useState(null);
  const [fourthFile, setFourthFile] = useState(null);
  const [fifthFile, setFifthFile] = useState(null);
  const [sixthFile, setSixthFile] = useState(null);
  const [seventhFile, setSeventhFile] = useState(null);
  const [eightFile, setEightFile] = useState(null);
  const [ninthFile, setNinthFile] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
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

  async function handleSubmit() {
    setLoading(true);
    const submissionsRef = collection(db, "submissions");
    const q = query(
      submissionsRef,
      where("uid", "==", auth.currentUser.uid),
      where("status", "==", "initial")
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      // User has already submitted initial form
      setShowAlert(true);
      return false;
    }

    const form = new FormData();

    if (firstFile) {
      form.append("Research Proposal", firstFile);
    }

    if (secondFile) {
      form.append("Informed consent/assent form", secondFile);
    }
    if (thirdFile) {
      form.append(
        "Questionnaire/s/Tools (Quantitative), Interview Guide (Qualitative)",
        thirdFile
      );
    }
    if (fourthFile) {
      form.append(
        "NCIP clearance (for studies involving indigenous groups)(if needed)",
        fourthFile
      );
    }
    if (fifthFile) {
      form.append(
        "HAU-IRB FORM 2(B): Registration and Application Form",
        fifthFile
      );
    }
    if (sixthFile) {
      form.append("HAU-IRB FORM 4.1(A): Protocol Assessment Form", sixthFile);
    }
    if (seventhFile) {
      form.append(
        "HAU-IRB FORM 4.1(B): Informed Consent Assessment Form",
        seventhFile
      );
    }
    if (eightFile) {
      form.append("Curriculum Vitae", eightFile);
    }
    if (ninthFile) {
      form.append("Others", ninthFile);
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/files`,
        {
          method: "POST",
          headers: {
            filefolder: `${auth.currentUser.uid}/initial`,
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

      try {
        const initialFiles = data.files.map((file) => ({
          id: generateId(16),
          forReview: false,
          ...file,
        }));

        const docRef = await addDoc(collection(db, "submissions"), {
          uid: auth.currentUser.uid,
          status: "initial",
          initial_files: initialFiles,
          continuing_files: [],
          final_files: [],
          resubmission_files: [],
          rev_initial_files: [],
          rev_continuing_files: [],
          rev_final_files: [],
          name: userName,
          email: currentUser.email,
          date_sent: serverTimestamp(),
          rev_date_sent: serverTimestamp(),
          due_date: "",
          protocol_no: "",
          reviewer: "",
          review_type: "",
          research_type: "",
          decision: "",
          school: "",
          completed: false,
        });
        setLoading(false);
        console.log("Document written with ID: ", docRef.id);
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
            message: `Applicant ${userName} has submissions for initial review.`,
            role: "applicant",
            read: false,
            recipientEmail: email,
            senderEmail: auth.currentUser.email,
            timestamp: serverTimestamp(),
          };
          await setDoc(doc(notificationsRef), newNotification);
        });

        onSubmitted();
      } catch (e) {
        console.log("Error adding document: ", e);
      }
    } catch (error) {
      console.log(error);
      return false;
    }
    return true;
  }

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate("/application");
  };

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
          <h1 class="text-lg font-bold">Initial Process</h1>
          <hr />
          <br />
          <div className="files">
            <div className="form shadow-2xl">
              <article className="upload">
                <label
                  class="block mb-5 text-lg font-medium text-gray-900 dark:text-white"
                  for="file_input"
                >
                  1. Research Proposal*
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
                  2. Informed consent/assent form*
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
                  3. Questionnaire/s/Tools (Quantitative), Interview Guide
                  (Qualitative)*
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
                  4. NCIP clearance (for studies involving indigenous groups)(if
                  needed)
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
                  5. Accomplished HAU-IRB Forms*
                </label>
                <h1 className="text-base mb-2">
                  HAU-IRB FORM 2(B): Registration and Application Form
                </h1>
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
                <h1 className="text-base mb-2">
                  HAU-IRB FORM 4.1(A): Protocol Assessment Form*
                </h1>
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
                <h1 className="text-base mb-2">
                  HAU-IRB FORM 4.1(B): Informed Consent Assessment Form*
                </h1>
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
              <article className="upload">
                <label
                  class="block mb-5 text-lg font-medium text-gray-900 dark:text-white"
                  for="file_input"
                >
                  6. Curriculum Vitae*
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
                      setEightFile(file);
                    }
                  }}
                />
              </article>
              <article className="upload">
                <label
                  class="block mb-5 text-lg font-medium text-gray-900 dark:text-white"
                  for="file_input"
                >
                  7. Others
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
                      setNinthFile(file);
                    }
                  }}
                />
              </article>
              <div class="w-full mb-4">
                <div class="flex space-x-4 items-center justify-end px-3 py-2 border-t dark:border-gray-600">
                  <button
                    id="sub"
                    disabled={
                      !firstFile ||
                      !secondFile ||
                      !thirdFile ||
                      !fifthFile ||
                      !sixthFile ||
                      !seventhFile ||
                      !eightFile
                    }
                    class="inline-flex items-center py-2.5 px-[3rem] text-xs font-medium text-center text-white bg-maroon rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900"
                  >
                    Submit
                  </button>
                  <Dialog
                    open={showConfirmation}
                    onClose={handleCloseConfirmation}
                  >
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
                      <Button
                        sx={{ color: "maroon" }}
                        onClick={handleSuccessClose}
                      >
                        OK
                      </Button>
                    </DialogActions>
                  </Dialog>

                  <Dialog open={showAlert} onClose={() => setShowAlert(false)}>
                    <DialogTitle>Sorry</DialogTitle>
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
        </div>
      </div>
    </form>
  );
}

export default Initial;
