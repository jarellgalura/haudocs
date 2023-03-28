import React, { useState } from "react";
import "../LoginForm.css";
import Card from "../../components/card/Card";
import { auth } from "../../firebase";
import { sendEmailVerification } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { useAuthValue } from "../../context/Authvalue";
import bgimage from "../../assets/bg.jpg";
import { registerWithEmailAndPassword } from "../../firebase";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessages, setErrorMessages] = useState("");
  const navigate = useNavigate();
  const [confirmPassword, setConfirmPassword] = useState("");
  const { setTimeActive } = useAuthValue();
  const [name, setname] = useState("");
  const [lastname, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const nameRegex = /^[A-Za-z]+$/;
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;

  const validatePassword = () => {
    let isValid = true;
    if (password !== "" && confirmPassword !== "") {
      if (password !== confirmPassword) {
        isValid = false;
        setErrorMessages("Passwords do not match");
      }
    }
    return isValid;
  };

  const validateName = () => {
    let isValid = true;
    if (!name.match(nameRegex)) {
      isValid = false;
      setErrorMessages("Invalid name format");
    }
    return isValid;
  };

  const validatePasswordFormat = () => {
    let isValid = true;
    if (!password.match(passwordRegex)) {
      isValid = false;
      setErrorMessages(
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number"
      );
    }
    return isValid;
  };

  const errors = {
    email: "Invalid email",
    password: "Invalid password",
    noUsername: "Please enter your username",
    noPassword: "Please enter your password",
  };

  const register = () => {
    if (!name || !lastname || !email || !password || !confirmPassword) {
      setErrorMessages("Please fill out all required fields.");
      return;
    }

    if (validateName() && validatePassword() && validatePasswordFormat()) {
      registerWithEmailAndPassword(name, lastname, email, password)
        .then(() => {
          sendEmailVerification(auth.currentUser)
            .then(() => {
              setTimeActive(true);
              navigate("/verifyemail");
            })
            .catch((err) => alert(err.message));
        })
        .catch((err) => setErrorMessages(err.message));
    }
  };

  const renderErrorMsg = (name) =>
    errorMessages &&
    errorMessages[name] === "noUsername" && (
      <p className="error_msg">{errors.noUsername}</p>
    );

  {
    renderErrorMsg("email");
  }
  {
    renderErrorMsg("password");
  }

  const myStyle = {
    backgroundImage: `url(${bgimage})`,
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    width: "100%",
    height: "100%",
    position: "fixed",
  };

  return (
    <div style={myStyle}>
      <Card>
        <h1 className="title">
          Sign Up for HAUDOCS <p>Create a free account</p>{" "}
        </h1>
        <div className="signup-inputs_container">
          <hr className="hrline"></hr>
          <p className="text-base mb-4 mt-6 text-black">
            Welcome! Please Enter your details
          </p>
          {errorMessages && <div className="auth__error">{errorMessages}</div>}
          <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
            <TextField
              label="First Name"
              className="textfield"
              required
              variant="outlined"
              fullWidth
              id="name"
              name="name"
              margin="normal"
              autoComplete="name"
              autoFocus
              value={name}
              onChange={(e) => setname(e.target.value)}
            />

            <TextField
              label="Last Name"
              className="textfield"
              required
              variant="outlined"
              fullWidth
              id="lastname"
              name="lastname"
              margin="normal"
              autoComplete="lastname"
              autoFocus
              value={lastname}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <TextField
            label="Email Address"
            className="textfield"
            variant="outlined"
            margin="normal"
            fullWidth
            id="email"
            name="email"
            autoComplete="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {renderErrorMsg("username")}
          {renderErrorMsg("noUsername")}

          <TextField
            className="textfield"
            margin="normal"
            label="Password"
            fullWidth
            required
            name="password"
            id="password"
            autoComplete="current-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {renderErrorMsg("password")}
          {renderErrorMsg("noPassword")}

          <TextField
            className="textfield"
            margin="normal"
            label="Confirm Password"
            fullWidth
            required
            name="password"
            id="confirmpassword"
            autoComplete="current-password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                  >
                    {showConfirmPassword ? (
                      <MdVisibilityOff />
                    ) : (
                      <MdVisibility />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {renderErrorMsg("password")}
          {renderErrorMsg("noPassword")}
        </div>
        <input
          onClick={register}
          id="sub"
          type="submit"
          value="Signup"
          className="login_button"
          disabled={
            !name || !lastname || !email || !password || !confirmPassword
          }
        />
        <div className="w-full flex items-center justify-center">
          <p className="text-sm font-normal text-black mt-5">
            Already have an account?{" "}
            <Link to="/Signin">
              <a className="font-semibold underline underline-offset-2 cursor-pointer">
                Login here
              </a>
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default Signup;
