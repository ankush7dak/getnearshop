import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  FaStore,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaArrowLeft,
} from "react-icons/fa";
import { LINKS } from "../../../constants/LinksUtility";
import Loading from "../../Loading/Loading";
import "./CustomerJoinShop.css";

/**
 * Public shop landing page opened by scanning a shop's QR code.
 *
 * Expected backend contracts (adjust the two URLs below to match your controllers):
 * GET  /api/shop/public/{publicCode}
 *      -> { shopId, shopName, categoryName, address, logoUrl, isActive }
 * POST /api/customer/shop/join/{publicCode}
 *      -> { alreadyLinked: boolean, message?: string }
 *
 * A 409 response from the join endpoint is also treated as already linked.
 */
export default function CustomerJoinShop() {
  const { publicCode } = useParams();
  const navigate = useNavigate();

  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    let active = true;

    const fetchShop = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get(
          `${LINKS.API_BASE_URL}/api/shop/public/${encodeURIComponent(publicCode)}`,
          { withCredentials: true }
        );
        if (active) setShop(response.data?.shopDTO || response.data);
      } catch (err) {
        if (!active) return;
        setError(
          err.response?.data?.message ||
            (err.response?.status === 404
              ? "This shop link is invalid or the shop no longer exists."
              : "Unable to load shop details. Please try again.")
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    if (publicCode) fetchShop();
    else {
      setError("Shop code is missing from this link.");
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [publicCode]);

  const handleJoinShop = async () => {
    if (joining || !shop) return;

    setJoining(true);
    setError("");
    try {
      const response = await axios.post(
        `${LINKS.API_BASE_URL}/api/customer/shop/join/${encodeURIComponent(publicCode)}`,
        {},
        { withCredentials: true }
      );

      if (response.data?.alreadyLinked) {
        setPopup({
          type: "already",
          title: "Already registered",
          message: `You are already a customer of ${shop.shopName}.`,
        });
      } else {
        setPopup({
          type: "success",
          title: "Welcome to the shop!",
          message: `You are now connected with ${shop.shopName}.`,
        });
      }
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;

      if (status === 409 || data?.alreadyLinked) {
        setPopup({
          type: "already",
          title: "Already registered",
          message: `You are already a customer of ${shop.shopName}.`,
        });
      } else if (status === 401 || status === 403) {
        // Keep the scanned shop code so the app can return here after login.
        navigate(`/login?returnUrl=${encodeURIComponent(`/s/${publicCode}`)}`);
      } else {
        setError(
          data?.message || "We couldn't connect you to this shop. Please try again."
        );
      }
    } finally {
      setJoining(false);
    }
  };

  const closePopup = () => {
    const wasSuccess = popup?.type === "success";
    setPopup(null);
    if (wasSuccess) navigate(`/s/${publicCode}`);
  };

  if (loading) return <div className="join-shop-loading"><Loading /></div>;

  if (error && !shop) {
    return (
      <main className="join-shop-page">
        <section className="join-shop-card join-shop-error-card">
          <FaExclamationCircle className="join-shop-error-icon" />
          <h2>Shop not found</h2>
          <p>{error}</p>
          <button className="join-shop-secondary-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft /> Go Back
          </button>
        </section>
      </main>
    );
  }

  const shopAddress = [shop?.address, shop?.city, shop?.state]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="join-shop-page">
      <section className="join-shop-card">
        <div className="join-shop-brand">GETNEARSHOP</div>

        <div className="join-shop-logo-wrap">
          {shop?.logoUrl || shop?.logo || shop?.imageUrl ? (
            <img
              className="join-shop-logo"
              src={shop.logoUrl || shop.logo || shop.imageUrl}
              alt={`${shop.shopName} logo`}
            />
          ) : (
            <div className="join-shop-logo-placeholder"><FaStore /></div>
          )}
        </div>

        <p className="join-shop-eyebrow">You scanned a shop QR code</p>
        <h1>Become a customer of</h1>
        <h2 className="join-shop-name">{shop?.shopName || "this shop"}?</h2>

        {shop?.categoryName && <span className="join-shop-category">{shop.categoryName}</span>}

        {shopAddress && (
          <p className="join-shop-address"><FaMapMarkerAlt /> {shopAddress}</p>
        )}

        <p className="join-shop-description">
          Connect with this store to easily find its products and place orders on GetNearShop.
        </p>

        {error && <div className="join-shop-inline-error"><FaExclamationCircle /> {error}</div>}

        <div className="join-shop-actions">
          <button
            type="button"
            className="join-shop-primary-btn"
            onClick={handleJoinShop}
            disabled={joining || shop?.isActive === false}
          >
            {joining ? "Please wait..." : "Yes, Become a Customer"}
          </button>
          <button
            type="button"
            className="join-shop-secondary-btn"
            onClick={() => navigate(-1)}
            disabled={joining}
          >
            Not Now
          </button>
        </div>
        {shop?.isActive === false && (
          <p className="join-shop-closed-note">This shop is currently unavailable for joining.</p>
        )}
      </section>

      {popup && (
        <div className="join-shop-modal-backdrop" role="presentation">
          <section
            className="join-shop-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="join-shop-modal-title"
          >
            <div className={`join-shop-modal-icon ${popup.type}`}>
              <FaCheckCircle />
            </div>
            <h2 id="join-shop-modal-title">{popup.title}</h2>
            <p>{popup.message}</p>
            <button type="button" className="join-shop-primary-btn" onClick={closePopup}>
              Okay
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
