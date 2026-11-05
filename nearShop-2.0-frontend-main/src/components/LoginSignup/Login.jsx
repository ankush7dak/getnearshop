
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { HOME_BY_ROLE } from "../../constants/HomeByRole";
import { LINKS } from "../../constants/LinksUtility";
import "./LoginSignup.css";

import { AuthContext } from "../../contexts/authcontext/AuthProvider";
import Loading from "../Loading/Loading";
import GoogleSignIn from "./GoogleSignIn";

const API = LINKS.API_BASE_URL.replace(/\/+$/, "");

const Login = () => {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loginRole, setLoginRole] = useState("customer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      // STEP 1: Authenticate user and receive JWT cookie
      const loginResponse = await axios.post(
        `${API}/auth/login`,
        {
          mobile: mobile.trim(),
          password,
          loginRole
        },
        {
          withCredentials: true
        }
      );

      if (loginResponse.data !== "Login Successful") {
        throw new Error(
          typeof loginResponse.data === "string"
            ? loginResponse.data
            : "Login failed"
        );
      }

      // STEP 2: Fetch authenticated user's actual role
      const roleResponse = await axios.get(
        `${API}/auth/getUserRole`,
        {
          withCredentials: true
        }
      );

      const actualRole = String(roleResponse.data)
        .trim()
        .toLowerCase();

      if (!actualRole || !HOME_BY_ROLE[actualRole]) {
        throw new Error("Invalid user role received from server");
      }

      // STEP 3: Verify selected role
      if (actualRole !== loginRole.toLowerCase()) {
        throw new Error("Selected role does not match your account");
      }

      // STEP 4: Update authentication context
      setUser(actualRole);

      // STEP 5: Check shopkeeper registration
      if (actualRole === "shopkeeper") {
        const registrationResponse = await axios.get(
          `${API}/api/shop/isShopRegistered`,
          {
            withCredentials: true
          }
        );

        const isNotRegistered =
          registrationResponse.data === 0 ||
          registrationResponse.data === "0" ||
          registrationResponse.data === false;

        if (isNotRegistered) {
          navigate("/shopkeeper/registration", {
            replace: true
          });
          return;
        }
      }

      // STEP 6: Navigate to appropriate dashboard
      navigate(HOME_BY_ROLE[actualRole], {
        replace: true
      });

    } catch (err) {
      console.error("Login error:", {
        status: err.response?.status,
        response: err.response?.data,
        message: err.message
      });

      if (err.response?.status === 401) {
        setError(
          "Authentication failed. Please check your credentials or login session."
        );
      } else if (err.response?.status === 403) {
        setError("You are not authorized to access this resource.");
      } else if (err.response?.data) {
        const data = err.response.data;

        setError(
          typeof data === "string"
            ? data
            : data.message || "Something went wrong"
        );
      } else {
        setError(err.message || "Unable to connect to server");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">

      {loading && <Loading />}
      <form
        onSubmit={handleLogin}
        className="auth-form"
      >
        

        <h2>Login</h2>
<GoogleSignIn></GoogleSignIn>
<h1>  </h1>
        {error && (
          <p className="error">{error}</p>
        )}

        <input
          type="tel"
          placeholder="Mobile"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          required
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />

        <select
          value={loginRole}
          onChange={(e) => setLoginRole(e.target.value)}
          required
          disabled={loading}
        >
          <option value="customer">Customer</option>
          <option value="shopkeeper">Shopkeeper</option>
          <option value="admin">Admin</option>
        </select>

        <button
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p>
          Already have an account!! Want to become customer
          or shopkeeper?{" "}
          <span onClick={() => navigate("/getNewRole")}>
            Click here
          </span>
        </p>

        <p>
          Don't have an account?{" "}
          <span onClick={() => navigate("/signup")}>
            Signup
          </span>
        </p>

      </form>
    </div>
  );
};

export default Login;
