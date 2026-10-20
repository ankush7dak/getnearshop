import React, { useState } from "react";
import "./ProfilePage.css";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "Ankush Kumar",
    email: "ankush@email.com",
    phone: "+91 9876543210",
    address: "Gaya, Bihar",
    gender: "Male",
    dob: "1999-06-10",
    city: "Gaya",
    state: "Bihar",
    pincode: "823001"
  });

  const [isEditing, setIsEditing] = useState(false);

  /* ----------------- PASSWORD MODAL STATE ----------------- */

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordMode, setPasswordMode] = useState("OLD");

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    otp: ""
  });

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    console.log("Saved Profile:", profile);
    setIsEditing(false);
  };

  /* ----------------- PASSWORD HANDLERS ----------------- */

  const handlePasswordInput = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleChangePassword = () => {
    console.log("Password change mode:", passwordMode);
    console.log(passwordData);

    // 🔥 API CALL HERE:
    // /change-password-with-old
    // /change-password-with-otp

    setShowPasswordModal(false);
  };

  return (
    <div className="profile-container-1">
      <h2 className="page-title">My Profile</h2>

      <div className="nearshop-profile-page">
        <div className="profile-card">

          {/* Avatar */}
          <div className="avatar-section">
            <img src="https://i.pravatar.cc/150" alt="profile" />

            <button
              className="change-photo-btn"
              disabled={!isEditing}
            >
              Change Photo
            </button>

            {/* CHANGE PASSWORD BUTTON */}
            <button
              className="password-btn"
              onClick={() => setShowPasswordModal(true)}
            >
              Change Password
            </button>
          </div>

          {/* Info */}
          <div className="profile-form">

            {/* Fields remain same */}
            {["name","phone","city","state","pincode"].map((field) => (
              <div className="form-group" key={field}>
                <label>{field.toUpperCase()}</label>
                <input
                  name={field}
                  value={profile[field]}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            ))}

            {/* Email */}
            <div className="form-group">
              <label>Email</label>
              <input value={profile.email} disabled />
            </div>

            {/* Gender */}
            <div className="form-group">
              <label>Gender</label>
              <select
                name="gender"
                value={profile.gender}
                onChange={handleChange}
                disabled={!isEditing}
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            {/* DOB */}
            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={profile.dob}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            {/* Address */}
            <div className="form-group full">
              <label>Address</label>
              <textarea
                name="address"
                value={profile.address}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            {!isEditing ? (
              <button className="save-btn" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            ) : (
              <button className="save-btn" onClick={handleSave}>
                Save Changes
              </button>
            )}

          </div>
        </div>
      </div>

      {/* ================= PASSWORD POPUP ================= */}

      {showPasswordModal && (
        <div className="password-modal-overlay">

          <div className="password-modal">

            <h3>Change Password</h3>

            {/* MODE SWITCH */}
            <div className="password-tabs">

              <button
                className={passwordMode === "OLD" ? "active" : ""}
                onClick={() => setPasswordMode("OLD")}
              >
                Using Old Password
              </button>

              <button
                className={passwordMode === "OTP" ? "active" : ""}
                onClick={() => setPasswordMode("OTP")}
              >
                Using OTP
              </button>

            </div>

            {/* OLD PASSWORD FORM */}
            {passwordMode === "OLD" && (
              <>
                <input
                  type="password"
                  placeholder="Old Password"
                  name="oldPassword"
                  onChange={handlePasswordInput}
                />

                <input
                  type="password"
                  placeholder="New Password"
                  name="newPassword"
                  onChange={handlePasswordInput}
                />

                <input
                  type="password"
                  placeholder="Confirm Password"
                  name="confirmPassword"
                  onChange={handlePasswordInput}
                />
              </>
            )}

            {/* OTP FORM */}
            {passwordMode === "OTP" && (
              <>
                <input
                  placeholder="Enter OTP"
                  name="otp"
                  onChange={handlePasswordInput}
                />

                <input
                  type="password"
                  placeholder="New Password"
                  name="newPassword"
                  onChange={handlePasswordInput}
                />
              </>
            )}

            {/* ACTIONS */}
            <div className="modal-actions">

              <button
                className="cancel-btn"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </button>

              <button
                className="save-btn"
                onClick={handleChangePassword}
              >
                Update Password
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
