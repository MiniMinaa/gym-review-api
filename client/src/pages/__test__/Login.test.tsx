import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Login from "../Login";
import { useAuth0, Auth0ContextInterface, User } from "@auth0/auth0-react";
import { MfaApiClient } from "@auth0/auth0-spa-js";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("react-spinners", () => ({
  PacmanLoader: () => <div data-testid="pacman-loader" />,
}));

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: vi.fn(),
}));

// Helper function to create a complete mock for Auth0ContextInterface
const mockUseAuth0 = (
  overrides: Partial<Auth0ContextInterface<User>> = {},
): Auth0ContextInterface<User> => ({
  isAuthenticated: false,
  isLoading: true,
  user: undefined,
  getAccessTokenSilently: vi.fn().mockResolvedValue("mock-token"),
  getAccessTokenWithPopup: vi.fn().mockResolvedValue("mock-token"),
  getIdTokenClaims: vi.fn().mockResolvedValue({}),
  loginWithCustomTokenExchange: vi.fn().mockResolvedValue(undefined),
  exchangeToken: vi.fn().mockResolvedValue(undefined),
  loginWithRedirect: vi.fn().mockResolvedValue(undefined),
  loginWithPopup: vi.fn().mockResolvedValue(undefined),
  connectAccountWithRedirect: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn().mockResolvedValue(undefined),
  handleRedirectCallback: vi.fn().mockResolvedValue(undefined),
  getDpopNonce: vi.fn().mockResolvedValue(undefined),
  setDpopNonce: vi.fn().mockResolvedValue(undefined),
  generateDpopProof: vi.fn().mockResolvedValue(undefined),
  createFetcher: vi.fn().mockResolvedValue(undefined),
  getConfiguration: vi.fn().mockResolvedValue(undefined),
  mfa: {
    getAuthenticators: vi.fn(),
    enroll: vi.fn(),
    challenge: vi.fn(),
    verify: vi.fn(),
    getEnrollmentFactors: vi.fn(),
    setMFAAuthDetails: vi.fn(),
  } as unknown as MfaApiClient,
  error: undefined,
  ...overrides,
});

describe("Login Page", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockNavigate.mockClear();
  });

  it("shows PacmanLoader while loading", () => {
    vi.mocked(useAuth0).mockReturnValue(
      mockUseAuth0({ isAuthenticated: false, isLoading: true }),
    );

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("pacman-loader")).toBeInTheDocument();
  });

  it("calls loginWithRedirect when not authenticated and not loading", () => {
    const mockLoginWithRedirect = vi.fn();
    vi.mocked(useAuth0).mockReturnValue(
      mockUseAuth0({
        isAuthenticated: false,
        isLoading: false,
        loginWithRedirect: mockLoginWithRedirect,
      }),
    );

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    expect(mockLoginWithRedirect).toHaveBeenCalledWith({
      appState: { returnTo: "/profile" },
      authorizationParams: {
        screen_hint: "login",
        scope: "openid profile email",
      },
    });
  });

  it("redirects to /profile when authenticated (logout lives on Profile, not here)", () => {
    vi.mocked(useAuth0).mockReturnValue(
      mockUseAuth0({
        isAuthenticated: true,
        isLoading: false,
      }),
    );

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    expect(mockNavigate).toHaveBeenCalledWith("/profile", { replace: true });
    expect(
      screen.queryByRole("button", { name: /Logout/i }),
    ).not.toBeInTheDocument();
  });

  it("renders nothing when not authenticated and not loading", () => {
    vi.mocked(useAuth0).mockReturnValue(
      mockUseAuth0({
        isAuthenticated: false,
        isLoading: false,
      }),
    );

    const { container } = render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    expect(container.firstChild).toBeNull();
  });
});
