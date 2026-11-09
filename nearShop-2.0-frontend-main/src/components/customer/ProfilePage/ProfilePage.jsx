
import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import "./ProfilePage.css";
import { LINKS } from "../../../constants/LinksUtility";

const EMPTY_PROFILE = {
  customerId: "",
  name: "",
  email: "",
  phone: "",
  gender: "",
  dob: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  profileImageUrl: ""
};

const EMPTY_PASSWORD = {
  oldPassword: "",
  newPassword: "",
  confirmPassword: ""
};

const getErrorMessage = (err, fallback) => {
  const data = err.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  return data?.message || data?.error || err.message || fallback;
};

const normalizeDate = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    const match = value.match(/^\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const normalizeProfile = (data = {}) => ({
  customerId: data.customerId ?? "",
  name: data.name ?? "",
  email: data.email ?? "",
  phone: data.phone ?? data.mobile ?? "",
  gender: data.gender ?? "",
  dob: normalizeDate(data.dob),
  address: data.address ?? "",
  city: data.city ?? "",
  state: data.state ?? "",
  pincode: data.pincode ?? "",
  profileImageUrl: data.profileImageUrl ?? ""
});

export default function ProfilePage() {
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [originalProfile, setOriginalProfile] = useState(EMPTY_PROFILE);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState(EMPTY_PASSWORD);

  // Profile image states
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef(null);

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${LINKS.API_BASE_URL}/api/customer/profile`,
        { withCredentials: true }
      );

      const data = normalizeProfile(response.data);

      setProfile(data);
      setOriginalProfile(data);
    } catch (err) {
      setError(
        getErrorMessage(err, "Unable to load your profile. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Clean up temporary preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Handle profile field changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Select profile image
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setError("");
    setMessage("");

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Profile image must be smaller than 5 MB.");
      e.target.value = "";
      return;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Save profile and image together
  const handleSave = async (e) => {
    e?.preventDefault();

    if (!profile.name.trim()) {
      setError("Full name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const formData = new FormData();

      formData.append("name", profile.name.trim());
      formData.append("gender", profile.gender || "");
      formData.append("dob", profile.dob || "");
      formData.append("address", profile.address.trim());
      formData.append("city", profile.city.trim());
      formData.append("state", profile.state.trim());
      formData.append("pincode", profile.pincode.trim());

      // Add image only when a new image is selected
      if (selectedImage) {
        formData.append("profileImage", selectedImage);
      }

      const response = await axios.put(
        `${LINKS.API_BASE_URL}/api/customer/profile`,
        formData,
        {
          withCredentials: true
        }
      );

      const updated = normalizeProfile({
        ...profile,
        ...response.data,
        // Retain existing image if backend does not return a new URL
        profileImageUrl:
          response.data?.profileImageUrl ?? profile.profileImageUrl
      });

      setProfile(updated);
      setOriginalProfile(updated);

      setSelectedImage(null);
      setPreviewUrl("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setIsEditing(false);
      setMessage("Profile updated successfully.");

    } catch (err) {
      setError(getErrorMessage(err, "Unable to save profile changes."));
    } finally {
      setSaving(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setProfile(originalProfile);
    setSelectedImage(null);
    setPreviewUrl("");
    setIsEditing(false);
    setError("");
    setMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Password handling
  const handlePasswordInput = (e) => {
    const { name, value } = e.target;

    setPasswordData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangePassword = async (e) => {
    e?.preventDefault();

    const { oldPassword, newPassword, confirmPassword } = passwordData;

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must contain at least 8 characters.");
      return;
    }

    if (newPassword === oldPassword) {
      setError("New password must differ from your old password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    try {
      setChangingPassword(true);
      setError("");
      setMessage("");

      await axios.post(
        `${LINKS.API_BASE_URL}/api/customer/change-password`,
        {
          oldPassword,
          newPassword
        },
        { withCredentials: true }
      );

      setShowPasswordModal(false);
      setPasswordData({ ...EMPTY_PASSWORD });
      setMessage("Password updated successfully.");

    } catch (err) {
      setError(getErrorMessage(err, "Unable to change password."));
    } finally {
      setChangingPassword(false);
    }
  };

  const closePasswordModal = () => {
    if (changingPassword) return;

    setShowPasswordModal(false);
    setPasswordData({ ...EMPTY_PASSWORD });
    setError("");
  };

  if (loading) {
    return (
      <div className="profile-container-1">
        Loading profile...
      </div>
    );
  }

  const displayedImage =
    previewUrl ||
    profile.profileImageUrl ||
    "https://i.pravatar.cc/150";

  return (
    <div className="profile-container-1">
      <h2 className="page-title">My Profile</h2>

      {error && (
        <div className="profile-error" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="profile-success" role="status">
          {message}
        </div>
      )}

      <div className="nearshop-profile-page">
        <div className="profile-card">

          {/* Profile Image */}
          <div className="avatar-section">

            <div className="profile-image-wrapper">
              <img
                src={displayedImage}
                alt="Profile"
                className="profile-avatar"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "https://i.pravatar.cc/150";
                }}
              />

              {isEditing && (
                <>
                  <button
                    type="button"
                    className="change-photo-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={saving}
                  >
                    Change Photo
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                  />
                </>
              )}
            </div>

            {selectedImage && (
              <small className="selected-image-name">
                {selectedImage.name}
              </small>
            )}

            <button
              type="button"
              className="password-btn"
              onClick={() => {
                setError("");
                setMessage("");
                setPasswordData({ ...EMPTY_PASSWORD });
                setShowPasswordModal(true);
              }}
            >
              Change Password
            </button>
          </div>

          <form className="profile-form" onSubmit={handleSave}>

            <div className="form-group">
              <label htmlFor="customerId">Customer ID</label>
              <input
                id="customerId"
                value={profile.customerId}
                disabled
              />
            </div>

            {[
              ["name", "Full Name"],
              ["phone", "Mobile Number"],
              ["city", "City"],
              ["state", "State"],
              ["pincode", "PIN Code"]
            ].map(([field, label]) => (
              <div className="form-group" key={field}>
                <label htmlFor={field}>{label}</label>
                <input
                  id={field}
                  name={field}
                  value={profile[field]}
                  onChange={handleChange}
                  disabled={!isEditing || field === "phone"}
                  maxLength={field === "pincode" ? 6 : undefined}
                />
              </div>
            ))}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={profile.email}
                disabled
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={profile.gender}
                onChange={handleChange}
                disabled={!isEditing}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dob">Date of Birth</label>
              <input
                id="dob"
                type="date"
                name="dob"
                value={profile.dob}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            <div className="form-group full">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={profile.address}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            {!isEditing ? (
              <button
                type="button"
                className="save-btn"
                onClick={() => {
                  setError("");
                  setMessage("");
                  setIsEditing(true);
                }}
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  type="submit"
                  className="save-btn"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>
              </>
            )}

          </form>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="password-modal-overlay">
          <div
            className="password-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="change-password-title"
          >
            <h3 id="change-password-title">Change Password</h3>

            <form onSubmit={handleChangePassword}>
              <input
                type="password"
                placeholder="Old Password"
                name="oldPassword"
                value={passwordData.oldPassword}
                onChange={handlePasswordInput}
                autoComplete="current-password"
                required
              />

              <input
                type="password"
                placeholder="New Password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordInput}
                autoComplete="new-password"
                minLength={8}
                required
              />

              <input
                type="password"
                placeholder="Confirm New Password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordInput}
                autoComplete="new-password"
                minLength={8}
                required
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closePasswordModal}
                  disabled={changingPassword}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={changingPassword}
                >
                  {changingPassword
                    ? "Updating..."
                    : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
