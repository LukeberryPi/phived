import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Daily, Home } from "src/components";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/daily" element={<Daily />} />
      </Routes>
    </BrowserRouter>
  );
}
