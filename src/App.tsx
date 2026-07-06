import { Route, Routes } from "react-router-dom";
import LandingPage from "./landing/LandingPage";
import BoardPage from "./board/BoardPage";

/**
 * App component that serves as the root component and router for the application
 *
 * @component
 * @returns {JSX.Element} The application with routing configuration
 */
function App() {
  return (
    <Routes>
      <Route element={<LandingPage />} path="/" />
      <Route element={<BoardPage />} path="/board" />
    </Routes>
  );
}

export default App;
