import { useLocation, Link } from "react-router";

const API_ENDPOINT = import.meta.env.VITE_API_URL;

export default function IssuanceResult() {
  const location = useLocation();
  const certId = location.state?.certId;

  if (!certId) {
    return (
      <div className="max-w-md mx-auto mt-12 text-center">
        <p className="text-gray-600">No certificate to show.</p>
        <Link to="/apply" className="text-blue-600 hover:underline">
          Apply for one
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12 flex flex-col gap-4">
      <div className="border border-green-300 bg-green-50 rounded-lg p-6">
        <h1 className="text-lg font-semibold text-green-800">
          Certificate issued successfully
        </h1>
        <p className="text-sm text-green-700 mt-2">
          Certificate ID: <span className="font-mono">{certId}</span>
        </p>
      </div>

      <a
        href={`${API_ENDPOINT}/api/certificates/${certId}/download`}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-center hover:bg-blue-700 transition"
      >
        Download certificate PDF
      </a>

      <Link to="/" className="text-sm text-blue-600 hover:underline text-center">
        Back to home
      </Link>
    </div>
  );
}
