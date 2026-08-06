import { useLocation, Link } from "react-router";

const MESSAGES = {
  authentic: {
    title: "Certificate is authentic",
    detail: "The uploaded file's hash matches the record stored on the blockchain.",
    color: "text-green-700 bg-green-50 border-green-300",
  },
  altered: {
    title: "Certificate has been altered",
    detail: "A certificate with this ID exists on-chain, but the uploaded file's hash does not match it.",
    color: "text-red-700 bg-red-50 border-red-300",
  },
  not_found: {
    title: "Certificate does not exist",
    detail: "No matching certificate ID could be found, either in the file or on the blockchain.",
    color: "text-gray-700 bg-gray-50 border-gray-300",
  },
};

export default function VerificationResult() {
  const location = useLocation();
  const result = location.state?.result || "not_found";
  const info = MESSAGES[result];

  return (
    <div className="max-w-md mx-auto mt-12 flex flex-col gap-4">
      <div className={`border rounded-lg p-6 ${info.color}`}>
        <h1 className="text-lg font-semibold">{info.title}</h1>
        <p className="text-sm mt-2">{info.detail}</p>
      </div>
      <Link to="/verify" className="text-sm text-blue-600 hover:underline">
        Verify another certificate
      </Link>
    </div>
  );
}
