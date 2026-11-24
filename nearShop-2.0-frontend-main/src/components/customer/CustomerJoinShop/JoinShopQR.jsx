
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Html5Qrcode } from "html5-qrcode";
import {
  FaQrcode,
  FaCamera,
  FaTimes,
  FaCheckCircle,
  FaStore,
} from "react-icons/fa";

import { LINKS } from "../../../constants/LinksUtility";
import "./JoinShopQR.css";

export default function JoinShopQR() {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [shopId, setShopId] = useState("");
  const [consentOpen, setConsentOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [resultPopup, setResultPopup] = useState(null);
  

  const scannerRef = useRef(null);
  const scanHandledRef = useRef(false);
  const scannerElementId = "getnearshop-join-shop-qr-reader";

  // Extract shop ID from supported QR formats.
  const extractShopId = (decodedText) => {
    const value = String(decodedText || "").trim();

    // Format 1: Plain numeric shop ID.
    if (/^\d+$/.test(value)) {
      return value;
    }

    try {
      const url = new URL(value);

      // Format 2: Shop ID in query parameter.
      const queryShopId = url.searchParams.get("shopId");

      if (queryShopId && /^\d+$/.test(queryShopId)) {
        return queryShopId;
      }

      // Format 3: Shop ID in the final URL path segment.
      const segments = url.pathname.split("/").filter(Boolean);
      const lastSegment = segments.at(-1);

      if (lastSegment && /^\d+$/.test(lastSegment)) {
        return lastSegment;
      }
    } catch {
      // Unsupported QR content.
    }

    return null;
  };

  // Stop and release camera resources.
  const stopScanner = async () => {
    const scanner = scannerRef.current;

    if (!scanner) return;

    // Clear the reference immediately to prevent duplicate cleanup.
    scannerRef.current = null;

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }

      await scanner.clear();
    } catch (error) {
      console.debug("QR scanner cleanup:", error);
    }
  };

  // Process a successfully decoded QR.
  const handleScanSuccess = async (decodedText) => {
    if (scanHandledRef.current) return;

    scanHandledRef.current = true;

    const scannedShopId = extractShopId(decodedText);

    await stopScanner();
    setScannerOpen(false);

    if (!scannedShopId) {
      setMessage(
        "Invalid QR code. Please scan a valid GetNearShop QR code."
      );
      setMessageType("error");

      scanHandledRef.current = false;
      return;
    }

    setShopId(scannedShopId);
    setMessage("");
    setConsentOpen(true);
  };

  // Initialize scanner only when the scanner dialog opens.
  useEffect(() => {
    if (!scannerOpen) return;

    let cancelled = false;
    let scanner = null;
    let startPromise = null;
    let cleanupPromise = null;

    const cleanup = () => {
      if (cleanupPromise) return cleanupPromise;

      cleanupPromise = (async () => {
        cancelled = true;

        try {
          // Wait for camera initialization before releasing it.
          if (startPromise) {
            await startPromise;
          }

          if (scanner) {
            if (scanner.isScanning) {
              await scanner.stop();
            }

            await scanner.clear();
          }
        } catch (error) {
          console.debug("Scanner cleanup:", error);
        } finally {
          if (scannerRef.current === scanner) {
            scannerRef.current = null;
          }
        }
      })();

      return cleanupPromise;
    };

    const startScanner = async () => {
      try {
        scanner = new Html5Qrcode(scannerElementId);
        scannerRef.current = scanner;

        startPromise = scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 230, height: 230 },
            aspectRatio: 1,
          },
          (decodedText) => {
            if (cancelled || scanHandledRef.current) return;

            handleScanSuccess(decodedText);
          },
          () => {
            // Ignore unsuccessful frame decodes.
          }
        );

        await startPromise;

        if (cancelled) {
          await cleanup();
        }
      } catch (error) {
        console.error("Unable to start QR scanner:", error);

        if (!cancelled) {
          setMessage(
            "Unable to access the camera. Please allow camera permission and try again."
          );
          setMessageType("error");
          setScannerOpen(false);
        }

        await cleanup();
      }
    };

    startScanner();

    return () => {
      cleanup();
    };
    // Scanner is initialized only when the dialog opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scannerOpen]);

  const openScanner = () => {
    scanHandledRef.current = false;
    setMessage("");
    setMessageType("");
    setScannerOpen(true);
  };

  const closeConsent = () => {
    if (submitting) return;

    setConsentOpen(false);
    setShopId("");
    scanHandledRef.current = false;
  };

  // Join the scanned shop.
  const joinShop = async () => {
    if (!shopId || submitting) return;

    setSubmitting(true);
    setMessage("");

    try {

      const response = await axios.post(
        `${LINKS.API_BASE_URL}/api/shop/addNewCustomer/${
          shopId
        }`,
        {},
        { withCredentials: true }
      );

      setConsentOpen(false);

      const responseData = response.data;

      const resultStatus =response.data;
       
   

      if (
        resultStatus === "Customer is already mapped to your shop" 
        
      ) {
        setResultPopup({
          title: "Already Connected",
          message: "You are already connected to this shop.",
          type: "already",
        });
      } else if(resultStatus == "Connected successfully"){
        setResultPopup({
          title: "Successfully Joined!",
          message: "You are now connected to this shop.",
          type: "success",
        });
      }else {
        setResultPopup({
          title: "Error while joining!!",
          message: "Not able to join now try again later!!",
          type: "",
        });
      }
      
    } catch (error) {
      console.error("Join shop error:", error);

      const status = error.response?.status;

      const responseMessage =
        error.response?.data?.message ||
        (typeof error.response?.data === "string"
          ? error.response.data
          : "");

      if (status === 401 || status === 403) {
        setMessage(
          "Please log in as a customer to join this shop."
        );
      } else if (status === 404) {
        setMessage("Shop not found. Please scan a valid shop QR code.");
      } else {
        setMessage(
          responseMessage || "Unable to join this shop. Please try again."
        );
      }

      setMessageType("error");
      setConsentOpen(false);
    } finally {
      setSubmitting(false);
      scanHandledRef.current = false;
    }
  };

  return (
    <div className="join-shop-qr">

      {/* Scan button */}
      <button
        type="button"
        className="join-shop-qr__scan-button"
        onClick={openScanner}
        aria-label="Scan shop QR code"
      >
        <FaQrcode aria-hidden="true" />
        <span>Scan Shop QR</span>
      </button>

      {/* Error and status messages */}
      {message && (
        <div
          className={`join-shop-qr__message join-shop-qr__message--${messageType}`}
          role="alert"
        >
          {message}
        </div>
      )}

      {/* QR scanner dialog */}
      {scannerOpen && (
        <div
          className="join-shop-qr__overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Scan shop QR code"
        >
          <div className="join-shop-qr__dialog">
            <div className="join-shop-qr__header">
              <div>
                <h2>Scan Shop QR</h2>
                <p>
                  Point your camera at the shop's GetNearShop QR code.
                </p>
              </div>

              <button
                type="button"
                className="join-shop-qr__close"
                onClick={() => setScannerOpen(false)}
                aria-label="Close scanner"
              >
                <FaTimes />
              </button>
            </div>

            <div
              id={scannerElementId}
              className="join-shop-qr__reader"
            />

            <p className="join-shop-qr__hint">
              <FaCamera />
              Allow camera access if your browser asks.
            </p>
          </div>
        </div>
      )}

      {/* Join confirmation dialog */}
      {consentOpen && (
        <div
          className="join-shop-qr__overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="join-shop-title"
        >
          <div className="join-shop-qr__dialog join-shop-qr__consent">
            <div className="join-shop-qr__store-icon">
              <FaStore />
            </div>

            <h2 id="join-shop-title">Join this shop?</h2>

            <p>
              Do you want to become a customer of this shop on GetNearShop?
            </p>

            <small>Shop ID: {shopId}</small>

            <div className="join-shop-qr__actions">
              <button
                type="button"
                className="join-shop-qr__secondary"
                onClick={closeConsent}
                disabled={submitting}
              >
                No, Cancel
              </button>

              <button
                type="button"
                className="join-shop-qr__primary"
                onClick={joinShop}
                disabled={submitting}
              >
                {submitting ? "Joining..." : "Yes, Join Shop"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result dialog */}
      {resultPopup && (
        <div
          className="join-shop-qr__overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="join-shop-result-title"
        >
          <div className="join-shop-qr__dialog join-shop-qr__consent">
            <div className="join-shop-qr__store-icon">
              {resultPopup.type === "success" ? (
                <FaCheckCircle />
              ) : (
                <FaStore />
              )}
            </div>

            <h2 id="join-shop-result-title">
              {resultPopup.title}
            </h2>

            <p>{resultPopup.message}</p>

            <div className="join-shop-qr__actions">
              <button
                type="button"
                className="join-shop-qr__primary"
                onClick={() => {
                  setResultPopup(null);
                  setShopId("");
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
