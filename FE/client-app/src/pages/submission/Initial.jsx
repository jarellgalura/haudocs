import React, { useState, useContext, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  DialogContentText,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { StatusContext } from "../application/StatusContext";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
} from "firebase/firestore/lite";
import { db, auth } from "../../firebase";

function Initial() {
  const navigate = useNavigate();
  const { handleStatusChange } = useContext(StatusContext);
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

  async function handleSubmit() {
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
        }
      );
      const data = await response.json();
      console.log(data);

      try {
        const docRef = await addDoc(collection(db, "submissions"), {
          uid: auth.currentUser.uid,
          status: "initial",
          files: data.files,
          name: auth.currentUser.displayName,
          date_sent: serverTimestamp(),
          due_date: "",
          protocol_no: "",
          reviewer: "",
          review_type: "",
          decision: "",
          school: "",
        });
        console.log("Document written with ID: ", docRef.id);
      } catch (e) {
        console.log("Error adding document: ", e);
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
                  1. Research Proposal
                </label>
                <input
                  class="block w-full mb-5 text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                  id="multiple_files"
                  accept=".pdf,.doc,.docx"
                  type="file"
                  onChange={(event) => {
                    setFirstFile(event.target.files[0]);
                  }}
                />
              </article>
              <article className="upload">
                <label
                  class="block mb-5 text-lg font-medium text-gray-900 dark:text-white"
                  for="file_input"
                >
                  2. Informed consent/assent form
                </label>
                <input
                  class="block w-full mb-5 text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(event) => {
                    setSecondFile(event.target.files[0]);
                  }}
                />
              </article>
              <article className="upload">
                <label
                  class="block mb-5 text-lg font-medium text-gray-900 dark:text-white"
                  for="file_input"
                >
                  3. Questionnaire/s/Tools (Quantitative), Interview Guide
                  (Qualitative)
                </label>
                <input
                  class="block w-full mb-5 text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(event) => {
                    setThirdFile(event.target.files[0]);
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
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(event) => {
                    setFourthFile(event.target.files[0]);
                  }}
                />
              </article>
              <article className="upload">
                <label
                  class="block mb-5 text-lg font-medium text-gray-900 dark:text-white"
                  for="file_input"
                >
                  5. Accomplished HAU-IRB Forms
                </label>
                <h1 className="text-base mb-2">
                  HAU-IRB FORM 2(B): Registration and Application Form
                </h1>
                <input
                  class="block w-full mb-5 text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(event) => {
                    setFifthFile(event.target.files[0]);
                  }}
                />
                <h1 className="text-base mb-2">
                  HAU-IRB FORM 4.1(A): Protocol Assessment Form
                </h1>
                <input
                  class="block w-full mb-5 text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(event) => {
                    setSixthFile(event.target.files[0]);
                  }}
                />
                <h1 className="text-base mb-2">
                  HAU-IRB FORM 4.1(B): Informed Consent Assessment Form
                </h1>
                <input
                  class="block w-full mb-5 text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(event) => {
                    setSeventhFile(event.target.files[0]);
                  }}
                />
              </article>
              <article className="upload">
                <label
                  class="block mb-5 text-lg font-medium text-gray-900 dark:text-white"
                  for="file_input"
                >
                  6. Curriculum Vitae
                </label>
                <input
                  class="block w-full mb-5 text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(event) => {
                    setEightFile(event.target.files[0]);
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
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(event) => {
                    setNinthFile(event.target.files[0]);
                  }}
                />
              </article>
              <div class="w-full mb-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                <div class="px-4 py-2 bg-white rounded-t-lg dark:bg-gray-800">
                  <label for="comment" class="sr-only">
                    Your comment
                  </label>
                  <textarea
                    id="comment"
                    rows="4"
                    class="w-full px-0 text-sm text-gray-900 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400"
                    placeholder="Write a comment..."
                  ></textarea>
                </div>
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
                        onClick={() => setShowSuccess(false)}
                      >
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
        </div>
      </div>
    </form>
  );
}

export default Initial;
