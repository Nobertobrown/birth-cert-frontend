import { useState, useEffect } from "react";
import { Contract, formatEther } from "ethers";
import { useWallet } from "../hooks/useWallet";
import ABI from "../config/contractABI.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const API_ENDPOINT = import.meta.env.VITE_API_URL;
// const ABI = [
//   "function payVerificationFee(string certId) payable",
//   "function verificationFee() view returns (uint256)",
// ];

/**
 * Pays the verification fee for a given certId, then hands off to the
 * backend's confirmVerification step. Structurally identical to
 * PaymentButton (Phase 7) — same pattern, different contract function
 * and a sessionId instead of a certHash as the extra payload.
 */
export default function VerifyPaymentButton({ certId, sessionId, onResult }) {
  const { isConnected, isCorrectNetwork, getSigner } = useWallet();
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [feeWei, setFeeWei] = useState(null);

  useEffect(() => {
    async function loadFee() {
      try {
        const signer = await getSigner();
        const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);
        const fee = await contract.verificationFee();
        setFeeWei(fee);
      } catch (err) {
        console.error("Could not load verification fee", err);
      }
    }
    if (isConnected && isCorrectNetwork) loadFee();
  }, [isConnected, isCorrectNetwork, getSigner]);

  const handlePay = async () => {
    setError(null);
    setStatus("paying");
    try {
      const signer = await getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx = await contract.payVerificationFee(certId, { value: feeWei });
      setStatus("confirming");
      await tx.wait();

      const res = await fetch(`${API_ENDPOINT}/api/verify/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (!res.ok) throw new Error("Backend verification failed");

      const data = await res.json();
      setStatus("done");
      onResult(data.result);
    } catch (err) {
      console.error(err);
      setError(err.message || "Payment failed");
      setStatus("error");
    }
  };

  const disabled =
    !isConnected || !isCorrectNetwork || !feeWei || status === "paying" || status === "confirming";

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handlePay}
        disabled={disabled}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50 hover:bg-purple-700 transition"
      >
        {status === "paying" && "Confirm in MetaMask..."}
        {status === "confirming" && "Verifying..."}
        {(status === "idle" || status === "error") &&
          (feeWei ? `Pay ${formatEther(feeWei)} ETH & verify` : "Loading fee...")}
        {status === "done" && "Verified ✓"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
