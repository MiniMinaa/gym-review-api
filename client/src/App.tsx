import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import "./App.css";
import Home from "./pages/Home/Home";
import Browse from "./pages/Browse/Browse";
import Login from "./pages/Login";
import Profile from "./pages/Profile/Profile";
import Cards from "./pages/Cards/Cards";
import Review from "./pages/Review/Review";
import { Auth0Provider, type AppState } from "@auth0/auth0-react";

function AppWithAuth() {
  const navigate = useNavigate();

  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        scope: "openid profile email",
      }}
      onRedirectCallback={(appState?: AppState) => {
        navigate(appState?.returnTo ?? "/", { replace: true });
      }}
    >
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo" aria-label="Safe Space — home">
            Safe Space
          </Link>
          <div className="navbar-links">
            <Link to="/places" className="navbar-link">
              Browse
            </Link>
            <Link to="/profile" className="navbar-link">
              Profile
            </Link>
            <Link to="/login" className="navbar-link">
              Login
            </Link>
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/places" element={<Browse />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/places/:id" element={<Cards />} />
        <Route path="/places/:id/review" element={<Review />} />
      </Routes>
    </Auth0Provider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppWithAuth />
    </BrowserRouter>
  );
}

export default App;
