import React from "react";
import "./Loader.css";

const Loader = ({ loading }) => {
  if (!loading) return null;

  return (
    <div className="loader-overlay">
      <div className="spinner"></div>
    </div>
  );
};

export default Loader;
