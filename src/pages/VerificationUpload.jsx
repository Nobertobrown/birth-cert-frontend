import { useState } from "react";
import { useNavigate } from "react-router";
import WalletConnectButton from "../components/WalletConnectButton";
import VerifyPaymentButton from "../components/VerifyPaymentButton";

const API_ENDPOINT = import.meta.env.VITE_API_URL;

export default function VerificationUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [prepared, setPrepared] = useState(null); // { certId, sessionId } | { result: 'not_found' }
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("certificate", file);

      const res = await fetch(`${API_ENDPOINT}/api/verify/prepare`, { method: "POST", body: formData });
      const data = await res.json();

      if (data.result === "not_found") {
        // Couldn't even extract a certId — no point asking for payment.
        navigate("/verify/result", { state: { result: "not_found" } });
        return;
      }

      setPrepared(data); // { sessionId, certId }
    } catch (err) {
      console.error("Upload failed", err);
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleResult = (result) => {
    navigate("/verify/result", { state: { result } });
  };

  return (
    <div className="max-w-md mx-auto mt-12 flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Verify a certificate</h1>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files[0])}
        className="border rounded-lg p-2"
      />

      {!prepared && (
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50"
        >
          {uploading ? "Processing..." : "Upload certificate"}
        </button>
      )}

      {prepared && (
        <>
          <p className="text-sm text-gray-600">Certificate ID found: {prepared.certId}</p>
          <WalletConnectButton />
          <VerifyPaymentButton
            certId={prepared.certId}
            sessionId={prepared.sessionId}
            onResult={handleResult}
          />
        </>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
