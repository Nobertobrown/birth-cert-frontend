import { useState } from "react";
import { useNavigate } from "react-router";
import CertificateFormFields from "../components/CertificateFormFields";
import WalletConnectButton from "../components/WalletConnectButton";
import PaymentButton from "../components/PaymentButton";

const API_ENDPOINT = import.meta.env.VITE_API_URL;

export default function ApplicationForm() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: "", dob: "", placeOfBirth: "" });
  const [prepared, setPrepared] = useState(null); // { certId, certHash }
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // STEP 1 from Phase 7: generate the PDF + hash BEFORE any payment.
  // Only once this succeeds do we show the payment button.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${API_ENDPOINT}/api/certificates/prepare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Could not prepare certificate");
      const data = await res.json();
      setPrepared(data); // { certId, certHash }
    } catch (err) {
      console.error(err);
      setError("Something went wrong preparing your certificate. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = (certId) => {
    navigate("/apply/result", { state: { certId } });
  };

  return (
    <div className="max-w-md mx-auto mt-12 flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Apply for a birth certificate</h1>

      {!prepared && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <CertificateFormFields values={values} onChange={setValues} />
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50"
          >
            {submitting ? "Generating certificate..." : "Generate certificate"}
          </button>
        </form>
      )}

      {prepared && (
        <>
          <p className="text-sm text-gray-600">
            Certificate generated. Connect your wallet and pay the issuance fee
            to record it on the blockchain.
          </p>
          <WalletConnectButton />
          <PaymentButton
            certId={prepared.certId}
            certHash={prepared.certHash}
            onSuccess={handlePaymentSuccess}
          />
        </>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
