import React, { useState, useContext } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { StatusContext } from "../application/StatusContext";

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
  /*   const [showSuccess, setShowSuccess] = useState(false); */

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = new FormData();

    if (firstFile) {
      form.append("firstFile", firstFile);
    }

    if (secondFile) {
      form.append("secondFile", secondFile);
    }
    if (thirdFile) {
      form.append("thirdFile", thirdFile);
    }
    if (fourthFile) {
      form.append("fourthFile", fourthFile);
    }
    if (fifthFile) {
      form.append("fifthFile", fifthFile);
    }
    if (sixthFile) {
      form.append("sixthFile", sixthFile);
    }
    if (seventhFile) {
      form.append("seventhFile", seventhFile);
    }
    if (eightFile) {
      form.append("eightFile", eightFile);
    }
    if (ninthFile) {
      form.append("ninethFile", ninthFile);
    }

    try {
      const response = await fetch("http://localhost:8080/files", {
        method: "POST",
        headers: {
          // "Content-Type": "multipart/form-data",
          filefolder: "folder",
        },
        body: form,
      });
      const data = await response.json();
      console.log(data);
      /*       setShowSuccess(true); */
      /* navigate("/applicant"); */
    } catch (error) {
      console.error(error);
    }
  };

  const handleConfirmSubmit = () => {
    setShowConfirmation(false);
    navigate("/application");
    handleStatusChange("Your application is in process for initial review");
    console.log("Status updated in Initial.jsx");
    handleSubmit();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setShowConfirmation(true);
      }}
    >
      <div className="sub-containerr">
        <div className="sub-title">
          <h1 class="text-lg font-bold">Initial Process</h1>
          <hr />
          <br />
          <div className="files">
            <div className="form">
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
                  multiple
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
                  multiple
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
                  multiple
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
                  multiple
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
                  multiple
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
                  multiple
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
                  multiple
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
                  multiple
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
                  multiple
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
                    type="submit"
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
                </div>
              </div>
              <Dialog
                open={showConfirmation}
                onClose={() => setShowConfirmation(false)}
              >
                <DialogTitle>Confirm Submit</DialogTitle>
                <DialogContent>
                  <Typography variant="body1">
                    Are you sure you want to submit the form?
                  </Typography>
                </DialogContent>
                <DialogActions>
                  <Button
                    sx={{ color: "maroon" }}
                    onClick={() => setShowConfirmation(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    sx={{ color: "maroon" }}
                    onClick={handleConfirmSubmit}
                    autoFocus
                  >
                    Submit
                  </Button>
                </DialogActions>
              </Dialog>
              {/*               <Dialog open={showSuccess} onClose={() => setShowSuccess(false)}>
                <DialogTitle>Success</DialogTitle>
                <DialogContent>
                  <Typography variant="body1">
                    You have successfully submitted the form!
                  </Typography>
                </DialogContent>
                <DialogActions>
                  <Button
                    sx={{ color: "maroon" }}
                    onClick={() => setShowSuccess(false)}
                  >
                    Close
                  </Button>
                </DialogActions>
              </Dialog> */}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export default Initial;
