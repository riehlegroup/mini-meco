import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ForgotPassword from "./screens/Auth/ForgotPassword";
import ResetPassword from "./screens/Auth/ResetPassword";
import LoginScreen from "./screens/Auth/LoginScreen";
import Dashboard from "./components/Dashboard";
import CodeActivity from "./components/Projects/CodeActivity";
import Settings from "./components/Configuration/Settings";
import UserAdmin from "./components/Administration/UserAdmin";
import ProjectAdmin from "./components/Administration/ProjectAdmin";
import ProjectConfig from "./components/Configuration/ProjectConfig";
import Standups from "./components/Projects/Standups";
import Happiness from "./components/Projects/Happiness";
import ConfirmedEmail from "./screens/Auth/ConfirmedEmail";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/forgotPassword" element={<ForgotPassword />} />
          <Route path="/resetPassword" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="standups" element={<Standups />} />
          <Route path="happiness" element={<Happiness />} />
          <Route path="/code-activity" element={<CodeActivity />} />
          <Route path="settings" element={<Settings />} />
          <Route path="user-admin" element={<UserAdmin />} />
          <Route path="project-admin" element={<ProjectAdmin />} />
          <Route path="project-config" element={<ProjectConfig />} />
          <Route path="confirmedEmail" element={<ConfirmedEmail />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
