import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./LoginSignup.css";
import { LINKS } from "../../constants/LinksUtility";
import { jwtDecode } from "jwt-decode";
import { accessToken } from "../../constants/constant";

const SignUp = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");


  const [otp, setOtp] = useState("45545");
  const [role, setRole] = useState("customer"); // default role
  const [password, setPassword] = useState("");
  const [signUpSuccess, setSignupSuccess] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---------------- SEND OTP ----------------
  const sendOtp = async () => {
    setError("");

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return setError("Enter valid 10 digit mobile number");
    }

    try {
      setLoading(true);
      console.log('sending');
      const res = await axios.post(`${LINKS.API_BASE_URL}/auth/send-otp`, { mobile, role });
      console.log(res.data);
      if (res.data == "User Already Exists") {
        setError("User Already Exists");
      }
      else setStep(2);
    } catch (err) {
      setError("Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- VERIFY OTP & LOGIN ----------------
  const verifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      return setError("Enter valid OTP");
    }

    try {
      setLoading(true);
      console.log('verifying' + mobile + " " + otp);
      const res = await axios.post(`${LINKS.API_BASE_URL}/auth/verify-otp`, { name,email,mobile, otp, password, role ,verifyingforRoleAccess:false});
      if (res.data == 'Signup Success') {
        setSignupSuccess("SignUp Successful!! proceed to login!!");
      }

    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={verifyOtp}>
        <h2>Login / Signup</h2>

        {error && <p className="error-text">{error}</p>}

        {/* ---------- STEP 1 ---------- */}
        {step === 1 && (
          <>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="tel"
              placeholder="Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="role-group">
              <label>
                <input
                  type="radio"
                  value="customer"
                  checked={role === "customer"}
                  onChange={(e) => setRole(e.target.value)}
                />
                Customer
              </label>

              <label>
                <input
                  type="radio"
                  value="shopkeeper"
                  checked={role === "shopkeeper"}
                  onChange={(e) => setRole(e.target.value)}
                />
                Shopkeeper
              </label>
            </div>

            <button type="button" disabled={loading} onClick={sendOtp}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        )}

        {/* ---------- STEP 2 ---------- */}
        {step === 2 && (
          <>
            <p className="otp-info">
              OTP sent to <b>{mobile}</b>
            </p>

            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength="6"
              required
            />
            {/* <input
              type="text"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength="15"
              required
            /> */}
            <div className="signup-message">
              <p className="signup-p">{signUpSuccess}</p>
            </div>
            {signUpSuccess =="" && <div className="button-container">
              <button disabled={loading}>
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>

              <button
                type="button"
                className="link-btn"
                disabled={loading}
                onClick={() => {
                  setOtp(""); // reset OTP field
                  sendOtp();
                }}
              >
                Resend OTP
              </button>
            </div>}
          </>
        )}

        <p>
          Already registered?{" "}
          <span className="link-span" onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default SignUp;
