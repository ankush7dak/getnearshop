import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./logout.css"; // import the CSS file
import { LINKS } from "../../constants/LinksUtility";
import Loading from "../Loading/Loading";

const Logout = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loader, setLoader] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoader(true);
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(
        `${LINKS.API_BASE_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
      console.log(res.data);
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError("Something went wrong during logout");
    } finally {
      setLoader(false);
    }
    setLoading(false);
  };

  return (
    <>
      
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button className="logout" onClick={handleLogout} disabled={loader}>
        {loader ? "Logging out..." : "Logout"}
      </button>
    </>
  );
};

export default Logout;