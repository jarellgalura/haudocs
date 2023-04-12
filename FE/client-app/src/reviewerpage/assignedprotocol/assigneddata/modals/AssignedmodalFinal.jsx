import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  updateDoc,
  getDocs,
  query,
  where,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore/lite";
import { db, auth } from "../../../../firebase";
import { getFirestore } from "firebase/firestore/lite";
import { onAuthStateChanged } from "firebase/auth";
import CircularProgress from "@mui/material/CircularProgress";

const AssignedmodalFinal = (props) => {
  const navigate = useNavigate();
  const [value, setValue] = React.useState(0);
  const [files, setfiles] = useState(null);
  const [open, setOpen] = useState(false);
  const { handleCloseModal } = props;
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userName, setUserName] = useState(null);
  const [filesUploaded, setFilesUploaded] = useState(false);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const db = getFirestore();
    const submissionsRef = collection(db, "submissions");
    const q = query(
      submissionsRef,
      where("protocol_no", "==", props.protocol_no)
    );

    getDocs(q).then((querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const files = data[0].final_files
        .filter((file) => file.forReview)
        .map((file, index) => ({
          id: index + 1,
          name: data[0].name,
          date_sent: new Date(
            data[0].date_sent.seconds * 1000 +
              data[0].date_sent.nanoseconds / 1000000
          ).toLocaleString(),
          ...file,
        }));
      setSubmissions(files);
      setLoading(false);
      console.log(files);
    });
  }, [auth.currentUser.uid]);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setIsSubmitEnabled(true);
    setSelectedFiles(files);
    const newFileUploads = [...files];

    for (let i = 0; i < files.length; i++) {
      newFileUploads.push(files[i]);
    }

    setfiles(newFileUploads);
    setFilesUploaded(true);

    const fileNames = files.map((file) => file.name).join(", ");
    document.getElementById("multiple_files").value = fileNames;
  };

  const columns = [
    { field: "fieldname", headerName: "DocumentName", flex: 1 },

    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => (
        <Button style={downloadStyle} onClick={() => handleDownload(params)}>
          Download
        </Button>
      ),
    },
  ];

  const handleDownload = async (params) => {
    console.log(params.row.downloadLink);
    window.open(
      `${process.env.REACT_APP_BACKEND_URL}${params.row.downloadLink}`,
      "_blank"
    );
  };

  function handlesSuccess() {
    setShowSuccess(true);
    setShowConfirmation(false);
  }

  async function handleSubmit() {
    // Create a new FormData instance
    const form = new FormData();
    setShowConfirmation(false);
    setShowSuccess(true);

    // Append the files to the FormData instance
    files.forEach((fileObj, index) => {
      if (fileObj.file) {
        form.append(`file_${index}`, fileObj.file);
      }
    });

    // Perform the fetch request
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/files`,
        {
          method: "POST",
          headers: {
            filefolder: `${auth.currentUser.uid}/final`,
          },
          body: form,
        }
      );

      const data = await response.json();
      console.log(data);

      const submissionsRef = collection(db, "submissions");
      const q = query(
        submissionsRef,
        where("protocol_no", "==", props.protocol_no)
      );
      const querySnapshot = await getDocs(q);

      // Check if the submission exists
      if (!querySnapshot.empty) {
        // Get the first matching document (there should be only one)
        const docSnapshot = querySnapshot.docs[0];

        // Get the current date as a UNIX timestamp
        const currentDate = Date.now();

        // Offset the current date to GMT+8
        const offsetHours = 8;
        const offsetMilliseconds = offsetHours * 60 * 60 * 1000;
        const currentDateGMT8 = currentDate + offsetMilliseconds;

        // Add the offset current date to each file in the data.files array
        const filesWithDate = data.files.map((file) => ({
          ...file,
          upload_date: currentDateGMT8, // Add the offset current date as a UNIX timestamp
        }));

        const existingReviewerFiles = docSnapshot.data().rev_final_files || [];

        // Concatenate the existing and new files arrays
        const updatedReviewerFiles =
          existingReviewerFiles.concat(filesWithDate);

        const submissionRef = doc(db, "submissions", docSnapshot.id);
        await updateDoc(submissionRef, {
          rev_final_files: updatedReviewerFiles,
        });

        console.log("Document updated with ID: ", docSnapshot.id);
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
            message: `Reviewer ${userName} has submitted final review for protocol ${props.protocol_no}.`,
            read: false,
            recipientEmail: email,
            senderEmail: auth.currentUser.email,
            timestamp: serverTimestamp(),
          };
          await setDoc(doc(notificationsRef), newNotification);
        });
      } else {
        console.log("No submission found with the given protocol_no");
      }
    } catch (error) {
      console.log(error);
      return false;
    }

    navigate("/reviewerstatus");
    setOpen(false);
  }

  const downloadStyle = {
    color: "maroon",
  };

  const closeStyle = {
    color: "maroon",
    borderColor: "maroon",
  };

  const submitStyle = {
    color: "white",
    backgroundColor: "maroon",
  };

  return (
    <div style={{ height: 400 }}>
      <DataGrid
        classes={{ header: "custom-header" }}
        rows={submissions}
        columns={columns}
        loading={loading}
        loadingOverlay={
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress />
          </div>
        }
        autoWidth
        disableHorizontalScroll
        pageSize={5}
        rowsPerPageOptions={[5]}
      />
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          setShowConfirmation(true);
        }}
      >
        <input
          class="mt-[1rem] block w-full mb-5 text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          id="multiple_files"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileUpload}
        />
        <div className="flex items-end justify-end space-x-2 pb-[2rem]">
          <Button
            onClick={handleCloseModal}
            style={closeStyle}
            variant="outlined"
          >
            Close
          </Button>
          <Button
            onClick={() => setShowConfirmation(true)}
            id="sub"
            variant="contained"
            disabled={!filesUploaded}
          >
            Forward
          </Button>
        </div>
        <Dialog
          open={showConfirmation}
          onClose={() => setShowConfirmation(false)}
        >
          <DialogTitle>Confirm Forward</DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Are you sure you want to submit the files?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              sx={{ color: "maroon" }}
              onClick={() => setShowConfirmation(false)}
            >
              Cancel
            </Button>
            <Button sx={{ color: "maroon" }} onClick={handleSubmit} autoFocus>
              SUBMIT
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={showSuccess}
          onClose={() => {
            setShowSuccess(false);
            navigate("/reviewerstatus");
          }}
        >
          <DialogTitle>Success!</DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              You have successfully transferred the files.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              sx={{ color: "maroon" }}
              onClick={() => {
                navigate("/reviewerstatus");
                setOpen(false);
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </div>
  );
};

export default AssignedmodalFinal;
