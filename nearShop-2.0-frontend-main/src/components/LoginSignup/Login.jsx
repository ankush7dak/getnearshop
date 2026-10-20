import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { HOME_BY_ROLE } from "../../constants/HomeByRole";
import { LINKS } from "../../constants/LinksUtility";
import "./LoginSignup.css";
import Loader from "../../Loader/Loader";
import { AuthContext } from "../../contexts/authcontext/AuthProvider";
import Loading from "../Loading/Loading";

const Login = () => {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loginRole, setLoginRole] = useState("customer"); // default role
  const [error, setError] = useState("");
  const [loader, setLoader] = useState(false);
  const { user, setUser } = useContext(AuthContext);
  const [loading,setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoader(true);
    setLoading(true);

    try {
      const res = await axios.post(
        `${LINKS.API_BASE_URL}/auth/login`,
        { mobile, password, loginRole }, // send role to backend
        { withCredentials: true }
      );
      console.log(res.data);
      if (res.data === "Login Successful") {
        const res2 = await axios.get(
          `${LINKS.API_BASE_URL}/auth/getUserRole`,
          { withCredentials: true }
        );
        const registered = await axios.get(
          `${LINKS.API_BASE_URL}/api/shop/isShopRegistered`,
          { withCredentials: true }
        );

        setUser(res2.data);
        if(res2.data == 'shopkeeper' && registered.data == 0){
          navigate('/shopkeeper/registration');
        }
        else
        navigate(HOME_BY_ROLE[res2.data.toLowerCase()]);
      }

      setLoader(false);
    } catch (err) {
      setError("Invalid credentials");
      setLoader(false);
    }finally{
      setLoader(false);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      {loading && (
            <Loading></Loading>
          )}
      <form onSubmit={handleLogin} className="auth-form">
        <h2>Login</h2>

        {error && <p className="error">{error}</p>}

        <input
          type="text"
          placeholder="Mobile"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* New Select Input for Role */}
        <select
          value={loginRole}
          onChange={(e) => setLoginRole(e.target.value)}
          required
        >
          <option value="customer">Customer</option>
          <option value="shopkeeper">Shopkeeper</option>
          <option value="admin">Admin</option>
        </select>

        {loader ? <Loader /> : <button type="submit" onClick={handleLogin}>Login</button>}
          <p>
          Already have an account!! want to become customer or shopkeeper{" "}
          <span onClick={() => navigate("/getNewRole")}>Click here</span>
        </p>
        <p>
          Don't have an account?{" "}
          <span onClick={() => navigate("/signup")}>Signup</span>
        </p>
      </form>
    </div>
  );
};

export default Login;