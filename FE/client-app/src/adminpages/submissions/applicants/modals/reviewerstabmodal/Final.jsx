import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button } from "@mui/material";
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "../../../../../firebase";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import CircularProgress from "@mui/material/CircularProgress";

const Final = (props) => {
  const { handleCloseModal } = props;
  const [submissions, setSubmissions] = useState([]);
  const [isDownloadSuccessful, setIsDownloadSuccessful] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getFirestore();
    const submissionsRef = collection(db, "submissions");
    const q = query(submissionsRef, where("uid", "==", props.uid));

    getDocs(q).then((querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const files = data[0].rev_continuing_files.map((file, index) => ({
        id: index + 1,
        name: data[0].name,
        date_sent: new Date(
          data[0].date_sent.seconds * 1000 +
            data[0].date_sent.nanoseconds / 1000000
        ).toLocaleString(),
        ...file,
        sent_by: data[0].sent_by,
      }));
      setSubmissions(files);
      setLoading(false);
    });
  }, [props.uid]);

  const handleDownload = async (id) => {
    const fileRef = ref(storage, `Submissions/${id}.docx`);
    try {
      // Get the download URL for the file
      const downloadURL = await getDownloadURL(fileRef);
      window.open(downloadURL, "_blank");
      setIsDownloadSuccessful(true);
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    { field: "filename", headerName: "DocumentName", flex: 1 },
    { field: "sent_by", headerName: "Sent By", flex: 1 },
    { field: "date_sent", headerName: "Date Sent", wflex: 1 },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => (
        <Button style={downloadStyle} onClick={() => handleDownload(params.id)}>
          Download
        </Button>
      ),
    },
  ];

  const closeStyle = {
    color: "maroon",
    borderColor: "maroon",
  };

  const downloadStyle = {
    color: "maroon",
  };
  return (
    <div style={{ height: 400, width: "100%" }}>
      <DataGrid
        classes={{ header: "custom-header" }}
        rows={submissions}
        columns={columns}
        autoWidth
        disableHorizontalScroll
        pageSize={5}
        rowsPerPageOptions={[5]}
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
      />
      <div className="flex items-end justify-end mt-[1rem]">
        <Button
          onClick={handleCloseModal}
          style={closeStyle}
          variant="outlined"
        >
          Close
        </Button>
      </div>
    </div>
  );
};

export default Final;
