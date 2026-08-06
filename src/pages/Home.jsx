import { Link } from "react-router";

export default function Home() {
  return (
    <div className="max-w-md mx-auto mt-20 flex flex-col items-center gap-6 text-center">
      <h1 className="text-2xl font-semibold">Blockchain birth certificates</h1>
      <p className="text-gray-600">
        Apply for a new digital birth certificate, or verify the authenticity
        of one you already have.
      </p>
      <div className="flex gap-4">
        <Link
          to="/apply"
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Apply for certificate
        </Link>
        <Link
          to="/verify"
          className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          Verify certificate
        </Link>
      </div>
    </div>
  );
}
