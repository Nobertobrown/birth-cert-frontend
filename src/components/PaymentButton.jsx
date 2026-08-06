import { useState, useEffect } from "react";
import { Contract, formatEther } from "ethers";
import { useWallet } from "../hooks/useWallet";
import ABI from "../config/contractABI.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const API_ENDPOINT = import.meta.env.VITE_API_URL;
// const ABI = [
//   "function issueCertificate(string certId, bytes32 certHash) payable",
//   "function issuanceFee() view returns (uint256)",
// ];

/**
 * Calls issueCertificate() directly from the citizen's connected wallet.
 * The backend never touches this transaction — it only confirms the
 * result afterward via confirmCertificate() (Phase 7 controller).
 */
export default function PaymentButton({ certId, certHash, onSuccess }) {
  const { isConnected, isCorrectNetwork, getSigner } = useWallet();
  const [status, setStatus] = useState("idle"); // idle | paying | confirming | done | error
  const [error, setError] = useState(null);
  const [feeWei, setFeeWei] = useState(null);

  // Read the current fee straight from the contract rather than
  // hardcoding it — if updateFees() is ever called by the owner,
  // this button always reflects the true current price.
  useEffect(() => {
    async function loadFee() {
      try {
        const signer = await getSigner();
        const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);
        const fee = await contract.issuanceFee();
        setFeeWei(fee);
      } catch (err) {
        console.error("Could not load issuance fee", err);
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

      const tx = await contract.issueCertificate(certId, certHash, {
        value: feeWei,
      });

      setStatus("confirming");
      await tx.wait(); // wait for the transaction to be mined

      // Tell the backend the transaction happened so it can verify
      // on-chain and mark the certificate as issued.
      const res = await fetch(`${API_ENDPOINT}/api/certificates/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certId, txHash: tx.hash }),
      });
      if (!res.ok) throw new Error("Backend confirmation failed");

      setStatus("done");
      onSuccess(certId);
    } catch (err) {
      console.error(err);
      setError(err.message || "Payment failed");
      setStatus("error");
    }
  };

  const disabled =
    !isConnected ||
    !isCorrectNetwork ||
    !feeWei ||
    status === "paying" ||
    status === "confirming";

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handlePay}
        disabled={disabled}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 hover:bg-blue-700 transition"
      >
        {status === "paying" && "Confirm in MetaMask..."}
        {status === "confirming" && "Waiting for confirmation..."}
        {(status === "idle" || status === "error") &&
          (feeWei
            ? `Pay ${formatEther(feeWei)} ETH & issue`
            : "Loading fee...")}
        {status === "done" && "Issued ✓"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
