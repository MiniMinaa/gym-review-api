import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PacmanLoader } from "react-spinners";

export default function Login() {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      navigate("/profile", { replace: true });
      return;
    }
    loginWithRedirect({
      appState: { returnTo: "/profile" },
      authorizationParams: {
        screen_hint: "login",
        scope: "openid profile email",
      },
    });
  }, [isAuthenticated, isLoading, loginWithRedirect, navigate]);

  return isLoading ? (
    <PacmanLoader cssOverride={{}} margin={2} size={25} />
  ) : null;
}
