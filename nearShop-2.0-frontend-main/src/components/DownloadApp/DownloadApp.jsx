
import { useEffect, useState } from "react";
import { FaDownload, FaEllipsisV } from "react-icons/fa";
import "./DownloadApp.css";

const DownloadApp = () => {
  const [showDownload, setShowDownload] = useState(false);

  useEffect(() => {
    if (!showDownload) return;

    const timer = setTimeout(() => {
      setShowDownload(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [showDownload]);

  return (
    <div className="download-widget">

      {showDownload ? (
        <a
          href="/downloads/getNearShop.apk"
          download="getNearShop.apk"
          className="download-action"
          aria-label="Download NearShop App"
        >
          <FaDownload />
        </a>
      ) : (
        <button
          className="download-dots"
          onClick={() => setShowDownload(true)}
          aria-label="Show download button"
        >
          <FaEllipsisV />
        </button>
      )}

    </div>
  );
};

export default DownloadApp;
