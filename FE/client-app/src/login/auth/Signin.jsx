import React, { useState, useEffect } from "react";
import "../LoginForm.css";
import Card from "../../components/card/Card";
import "../../index.css";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../../firebase";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { useAuthValue } from "../../context/Authvalue";
import { FaUnlockAlt } from "react-icons/fa";
import bgimage from "../../assets/bg.jpg";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore/lite";
import TextField from "@mui/material/TextField";
import { FcGoogle } from "react-icons/fc";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import Checkbox from "@mui/material/Checkbox";

function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setTimeActive } = useAuthValue();
  const [errorMessages, setErrorMessages] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const isMobile = window.innerWidth < 1000;

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    const storedPassword = localStorage.getItem("password");

    if (storedEmail && storedPassword) {
      setEmail(storedEmail);
      setPassword(storedPassword);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        if (!user.emailVerified) {
          sendEmailVerification(user).then(() => {
            setTimeActive(true);
            navigate("/verifyemail");
          });
        } else {
          navigate("/");
        }
      }
    });

    return unsubscribe;
  }, [navigate, setTimeActive]);

  const Login = async (event) => {
    event.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);

      if (rememberMe) {
        localStorage.setItem("email", email);
        localStorage.setItem("password", password);
      } else {
        localStorage.removeItem("email");
        localStorage.removeItem("password");
      }
    } catch (error) {
      switch (error.code) {
        case "auth/user-not-found":
          setErrorMessages(
            "The email address entered does not match any account."
          );
          break;
        case "auth/wrong-password":
          setErrorMessages("The password entered is incorrect.");
          break;
        default:
          setErrorMessages(error.message);
          break;
      }
    }
  };

  const googleProvider = new GoogleAuthProvider();
  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;
      const q = query(collection(db, "users"), where("uid", "==", user.uid));
      const docs = await getDocs(q);
      if (docs.docs.length === 0) {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: user.displayName,
          authProvider: "google",
          email: user.email,
          createdAt: serverTimestamp(),
          role: "applicant",
        });
      }
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const myStyle = {
    backgroundImage: `url(${bgimage})`,
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    width: "100%",
    height: "100%",
    position: "fixed",
  };
  const handleClearError = () => {
    setErrorMessages("");
  };

  return (
    <div>
      <div style={myStyle}>
        <Card>
          <h1 className="title">Welcome to HAUDOCS!</h1>
          <form onSubmit={Login}>
            <div className="inputs_container">
              <hr className="hrline"></hr>
              <p className="subtitle mb-6">Login to your account</p>
              {errorMessages && (
                <div className="error-container">
                  <div className="error-message">{errorMessages}</div>
                  <button className="close-button" onClick={handleClearError}>
                    x
                  </button>
                </div>
              )}
              <TextField
                label="Email Address"
                className="textfield text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                name="email"
                autoComplete="email"
                autoFocus
              />

              <TextField
                label="Password"
                className="textfield text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                fullWidth
                name="password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                      >
                        {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <div className="flex">
                <div className="flex justify-start items-center">
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    color="primary"
                    className="remember-me"
                    inputProps={{ "aria-label": "Remember Me" }}
                  />
                  <label htmlFor="remember-me" className="remember-me-label">
                    Remember
                  </label>
                </div>
                <div className="text-black w-full underline underline-offset-2 items-center justify-end flex">
                  <FaUnlockAlt />
                  <Link to="/forgotpassword">Forgot Password?</Link>
                </div>
              </div>
            </div>
            <input type="submit" value="Login" className="login_button" />
            <div className="hau-signup">
              <div className="text-black">
                Dont have an account? Click{" "}
                <Link
                  className="text-black font-semibold underline underline-offset-2 cursor-pointer"
                  to="/signup"
                >
                  here
                </Link>{" "}
                to register
              </div>
            </div>
            <div className="w-full flex items-center justify-center relative py-6">
              <div className="w-full h-[1px] bg-black"></div>
              <p className="or text-lg absolute">or</p>
            </div>
          </form>
          <div>
            <button
              type="submit"
              className="google_button"
              onClick={signInWithGoogle}
            >
              <div className="flex items-start justify-start">
                <FcGoogle size={25} />
              </div>
              <div className="text-center">Continue With Google</div>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Signin;
