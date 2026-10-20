import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import "./GetNewRole.css";
import { LINKS } from "../../../constants/LinksUtility";
import Loading from "../../Loading/Loading";


const GetNewRole = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");


  const [otp, setOtp] = useState("");
  const [role, setRole] = useState(""); // default role
  const [password, setPassword] = useState("");
  const [signUpSuccess, setSignupSuccess] = useState("");
  const [otpSent,setOptSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [haveAccount,setHaveAccount] = useState(true);
  const [haveAllRoles,setHaveAllRoles] =useState(false);
  const [newRole,setNewRole] = useState("");
  const navigator = useNavigate();

  // ---------------- SEND OTP ----------------
  const sendOtp = async () => {
    setError("");

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return setError("Enter valid 10 digit mobile number");
    }

    try {
      setLoading(true);
      console.log('sending');
      const res = await axios.post(`${LINKS.API_BASE_URL}/auth/send-otp-forRole`, { mobile, role });
      console.log(res.data);
      setOptSent(true);
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
      const res = await axios.post(`${LINKS.API_BASE_URL}/auth/verify-otp`, { mobile, otp, role ,verifyingforRoleAccess:true});

      if(res.data == 'Role added')
      {
        alert("New Role Added you can login!!");
        navigator('/login');
      }
      else alert("Role not added!!")


    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleCheck = async (mobile) => {
  if (mobile.length === 10) {
    setLoading(true);
    try {
      const res = await axios.get(
        `${LINKS.API_BASE_URL}/auth/getUserRoles`,
        {
          params: { mobile: mobile }
        }
      );

      console.log(res.data);
      if(res.data.length == 0){
        setHaveAccount(false);
        setTimeout(()=>{
            setHaveAccount(true);
        },5000);
      }
      else if(res.data.length == 2){
        setHaveAllRoles(true);
        setTimeout(()=>{
            setHaveAllRoles(false);
        },5000);
      }
      else{
        if(res.data[0] == 'customer'){
            const x = 'shopkeeper';
            setRole(x);
        }
        else{
            const x = 'customer';
            setRole(x);
        }
        
      }
      console.log('ROle check ' + role)
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  }
};

  return (
    <div className="auth-container">
        {loading && (<Loading></Loading>)}
      <form className="auth-form" onSubmit={verifyOtp}>
        <h2>Get New Role here!!</h2>

        {error && <p className="error-text">{error}</p>}
          <>
            <input
              type="tel"
              placeholder="Enter Mobile Number"
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value);
                handleRoleCheck(e.target.value);
            }}
              required
            />
            {!haveAccount && (<p>You dont have account first sign up!!</p>)}
            {haveAllRoles && (<p>You already have Customer and Shopkeeer account to to login page!!</p>)}
            {!role == "" && (<p>Proceed to become a {role}!!</p>)}
            {otpSent && (
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
            <div className="button-container">
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
            </div>
            </>
            )}
            

            <button type="button" disabled={false} onClick={sendOtp}>
              {false ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
          <>

            <div className="signup-message">
              <p className="signup-p">{signUpSuccess}</p>
            </div>
            
          </>

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

export default GetNewRole;
