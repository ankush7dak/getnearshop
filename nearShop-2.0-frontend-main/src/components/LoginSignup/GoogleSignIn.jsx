
// import { GoogleLogin } from "@react-oauth/google";
// import axios from "axios";
// import { useContext, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import { LINKS } from "../../constants/LinksUtility";
// import { AuthContext } from "../../contexts/authcontext/AuthProvider";
// import { HOME_BY_ROLE } from "../../constants/HomeByRole";
// import { SocialLogin } from "@capgo/capacitor-social-login";


// const initializeGoogleLogin = async () => {
//   await SocialLogin.initialize({
//     google: {
//       webClientId: "YOUR_WEB_CLIENT_ID",
//     },
//   });
// };

// const GoogleSignIn = () => {
//   const { setUser } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const [loginRole, setLoginRole] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const API = LINKS.API_BASE_URL;

//   const handlecheck = ()=>{
//     if(loginRole == "")
//         setError("Please Select a role Before signing in with Google!!")
//         return;
//   }

//   const handleSuccess = async (credentialResponse) => {
//     if (loginRole == "") {
//       setError("Please select a role before signing in with Google.");
//       return;
//     }

//     if (!credentialResponse?.credential) {
//       setError("Google authentication failed. Please try again.");
//       return;
//     }

//     try {
//       setLoading(true);
//       setError("");

//       // STEP 1: Verify Google token and selected role
//       const res = await axios.post(
//         `${API}/auth/google/verify`,
//         {
//           credential: credentialResponse.credential,
//         },
//         {
//           withCredentials: true,
//           params :{role: loginRole}
//         }
//       );

//       // STEP 2: Fetch actual role using NearShop JWT cookie
//       const roleResponse = await axios.get(
//         `${API}/auth/getUserRole`,
//         {
//           withCredentials: true
//         }
//       );

//       const actualRole = String(roleResponse.data)
//         .trim()
//         .toLowerCase();

//       if (!actualRole || !HOME_BY_ROLE[actualRole]) {
//         throw new Error("Invalid user role received from server.");
//       }

//       // STEP 3: Verify selected role
//       if (actualRole !== loginRole.toLowerCase()) {
//         throw new Error(
//           "Selected role does not match your account."
//         );
//       }

//       // STEP 4: Update authentication context
//       setUser(actualRole);

//       // STEP 5: Check shopkeeper registration
//       if (actualRole === "shopkeeper") {
//         const registrationResponse = await axios.get(
//           `${API}/api/shop/isShopRegistered`,
//           {
//             withCredentials: true
//           }
//         );

//         const isNotRegistered =
//           registrationResponse.data === 0 ||
//           registrationResponse.data === "0" ||
//           registrationResponse.data === false;

//         if (isNotRegistered) {
//           navigate("/shopkeeper/registration", {
//             replace: true
//           });
//           return;
//         }
//       }

//       // STEP 6: Navigate to dashboard
//       navigate(HOME_BY_ROLE[actualRole], {
//         replace: true
//       });

//     } catch (err) {
//       console.error("Google login failed:", {
//         status: err.response?.status,
//         response: err.response?.data,
//         message: err.message
//       });

//       if (err.response?.status === 401) {
//         setError("Authentication failed. Please try again.");
//       } else if (err.response?.status === 403) {
//         setError("You are not authorized to access this resource.");
//       } else if (err.response?.data) {
//         const data = err.response.data;

//         setError(
//           typeof data === "string"
//             ? data
//             : data.message || "Something went wrong."
//         );
//       } else {
//         setError(err.message || "Unable to connect to server.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="google-signin-container">

      

//       <div className="google-button-wrapper" onClick={handlecheck}>
//        <GoogleLogin
//           onSuccess={handleSuccess}
//           onError={() => setError("Google login failed. Please try again.")}
//           text="signin_with"
//           shape="rectangular"
//           theme="outline"
//           size="large"
//         />  
//       </div>

//       <div className="google-role-selection">
    
//         <select className="selectRole"
//           value={loginRole}
//           onChange={(e) => setLoginRole(e.target.value)}
//           required
//           disabled={loading}
//         >
//           <option value="Select Role ">Select Role first!!</option>
//           <option value="customer">Customer</option>
//           <option value="shopkeeper">Shopkeeper</option>
//           <option value="admin">Admin</option>
//         </select>
//         {/* <div className="google-role-options">
//           {["customer", "shopkeeper", "admin"].map((role) => (
//             <button
//               key={role}
//               type="button"
//               className={`google-role-button ${
//                 loginRole === role ? "selected" : ""
//               }`}
//               onClick={() => {
//                 setLoginRole(role);
//                 setError("");
//               }}
//             >
//               {role.charAt(0).toUpperCase() + role.slice(1)}
//             </button>
//           ))}
//         </div> */}
//       </div>
//       {loading && (
//         <p className="google-loading">Signing in...</p>
//       )}

//       {error && (
//         <p className="google-error">{error}</p>
//       )}

//       <h2>Or</h2>

      

//     </div>
//   );
// };

// export default GoogleSignIn;


import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Capacitor } from "@capacitor/core";
import { GoogleLogin } from "@react-oauth/google";
import { SocialLogin } from "@capgo/capacitor-social-login";
import { useNavigate } from "react-router-dom";

import { LINKS } from "../../constants/LinksUtility";
import { AuthContext } from "../../contexts/authcontext/AuthProvider";
import { HOME_BY_ROLE } from "../../constants/HomeByRole";

const GoogleSignIn = () => {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loginRole, setLoginRole] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pluginReady, setPluginReady] = useState(false);

  const initialized = useRef(false);

  const API = LINKS.API_BASE_URL;
  const isNative = Capacitor.isNativePlatform();

  // Initialize native Google login only once
  useEffect(() => {
    if (!isNative || initialized.current) return;

    const initialize = async () => {
      try {
        await SocialLogin.initialize({
          google: {
            webClientId: LINKS.google_client_id,
            mode: "online",
          },
        });

        initialized.current = true;
        setPluginReady(true);
      } catch (err) {
        console.error("Social Login initialization failed:", err);
        setError("Unable to initialize Google Login.");
      }
    };

    initialize();
  }, [isNative]);

  // Common authentication function for Android and Web
  const authenticateWithBackend = async (googleIdToken) => {
    if (!loginRole) {
      setError("Please select a role before signing in.");
      return;
    }

    if (!googleIdToken) {
      setError("Google authentication failed. ID token missing.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // STEP 1: Verify Google ID token
      await axios.post(
        `${API}/auth/google/verify`,
        {
          credential: googleIdToken,
        },
        {
          withCredentials: true,
          params: { role: loginRole },
        }
      );

      // STEP 2: Fetch actual role using JWT cookie
      const roleResponse = await axios.get(
        `${API}/auth/getUserRole`,
        {
          withCredentials: true,
        }
      );

      const actualRole = String(roleResponse.data)
        .trim()
        .toLowerCase();

      if (!actualRole || !HOME_BY_ROLE[actualRole]) {
        throw new Error("Invalid user role received from server.");
      }

      // STEP 3: Validate selected role
      if (actualRole !== loginRole.toLowerCase()) {
        throw new Error("Selected role does not match your account.");
      }

      // STEP 4: Update authentication context
      setUser(actualRole);

      // STEP 5: Shopkeeper registration check
      if (actualRole === "shopkeeper") {
        const registrationResponse = await axios.get(
          `${API}/api/shop/isShopRegistered`,
          {
            withCredentials: true,
          }
        );

        const isNotRegistered =
          registrationResponse.data === 0 ||
          registrationResponse.data === "0" ||
          registrationResponse.data === false;

        if (isNotRegistered) {
          navigate("/shopkeeper/registration", {
            replace: true,
          });
          return;
        }
      }

      // STEP 6: Navigate to dashboard
      navigate(HOME_BY_ROLE[actualRole], {
        replace: true,
      });

    } catch (err) {
      console.error("Google authentication failed:", err);

      if (err.response?.status === 401) {
        setError("Authentication failed. Please try again.");
      } else if (err.response?.status === 403) {
        setError("You are not authorized.");
      } else {
        setError(
          err.response?.data?.message ||
          (typeof err.response?.data === "string"
            ? err.response.data
            : err.message) ||
          "Unable to connect to server."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Android native Google login
  const handleNativeGoogleLogin = async () => {
    if (!loginRole) {
      setError("Please select a role before signing in.");
      return;
    }

    if (!pluginReady) {
      setError("Google Login is still initializing. Please try again.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await SocialLogin.login({
        provider: "google",
        options: {
          scopes: ["email", "profile"],
        },
      });

      const idToken = response.result?.idToken;

      await authenticateWithBackend(idToken);

    } catch (err) {
      console.error("Native Google login failed:", err);

      setError(
        err.message || "Native Google Sign-In failed."
      );

      setLoading(false);
    }
  };

  // Web Google login
  const handleWebGoogleSuccess = async (credentialResponse) => {
    await authenticateWithBackend(
      credentialResponse?.credential
    );
  };

  return (
    <div className="google-signin-container">

      <div className="google-role-selection">
        <select
          className="selectRole"
          value={loginRole}
          onChange={(e) => {
            setLoginRole(e.target.value);
            setError("");
          }}
          disabled={loading}
        >
          <option value="">Select Role first!!</option>
          <option value="customer">Customer</option>
          <option value="shopkeeper">Shopkeeper</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="google-button-wrapper">

        {isNative ? (
          <button
            type="button"
            onClick={handleNativeGoogleLogin}
            disabled={loading || !pluginReady || !loginRole}
          >
            {loading
              ? "Signing in..."
              : !pluginReady
              ? "Initializing Google..."
              : "Sign in with Google"}
          </button>
        ) : (
           (
            <GoogleLogin
              onSuccess={handleWebGoogleSuccess}
              onError={() =>
                setError("Google login failed. Please try again.")
              }
              text="signin_with"
              shape="rectangular"
              theme="outline"
              size="large"
              
            />
          )
        )}

      </div>

      {loading && (
        <p className="google-loading">Signing in...</p>
      )}

      {error && (
        <p className="google-error">{error}</p>
      )}

      <p>Or</p>

    </div>
  );
};

export default GoogleSignIn;

