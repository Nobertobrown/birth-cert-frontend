import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./pages/Home.jsx";
import ApplicationForm from "./pages/ApplicationForm.jsx";
import IssuanceResult from "./pages/IssuanceResult.jsx";
import VerificationUpload from "./pages/VerificationUpload.jsx";
import VerificationResult from "./pages/VerificationResult.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/apply" element={<ApplicationForm />} />
        <Route path="/apply/result" element={<IssuanceResult />} />
        <Route path="/verify" element={<VerificationUpload />} />
        <Route path="/verify/result" element={<VerificationResult />} />
      </Routes>
    </BrowserRouter>
  );
}
