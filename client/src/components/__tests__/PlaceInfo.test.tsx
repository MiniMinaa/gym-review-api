import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PlaceInfo from "../PlaceInfo";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import "@testing-library/jest-dom";

// Mock useAuth0
vi.mock("@auth0/auth0-react", () => ({
  useAuth0: vi.fn(() => ({
    isAuthenticated: true,
    getAccessTokenSilently: vi.fn().mockResolvedValue("mock-token"),
    getAccessTokenWithPopup: vi.fn(),
    getIdTokenClaims: vi.fn(),
    loginWithRedirect: vi.fn(),
    loginWithPopup: vi.fn(),
    logout: vi.fn(),
    handleRedirectCallback: vi.fn(),
    isLoading: false,
    user: undefined,
    error: undefined,
    mfa: {
      getAuthenticators: vi.fn(),
      enroll: vi.fn(),
      challenge: vi.fn(),
      verify: vi.fn(),
      getEnrollmentFactors: vi.fn(),
      setMFAAuthDetails: vi.fn(),
    },
  })),
}));

// Mock ReviewForm to verify it receives the correct placeId prop
vi.mock("../../components/ReviewForm/ReviewForm", () => ({
  default: ({ placeId }: { placeId: string }) => (
    <div>ReviewForm for space {placeId}</div>
  ),
}));

// Mock global fetch
vi.stubGlobal("fetch", vi.fn());

describe("PlaceInfo Component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // Helper to render with MemoryRouter and route params
  const renderWithRouter = (
    ui: React.ReactElement,
    route: string = "/places/1",
  ) => {
    return render(
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/places/:id" element={ui} />
        </Routes>
      </MemoryRouter>,
    );
  };

  it("shows loading state initially", () => {
    vi.mocked(fetch).mockImplementation(() => new Promise(() => {}));
    renderWithRouter(<PlaceInfo />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it("shows error message if fetch fails", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("Failed to find data"));
    renderWithRouter(<PlaceInfo />);

    await waitFor(() => {
      expect(
        screen.getByText(/Error: Failed to find data/i),
      ).toBeInTheDocument();
    });
  });

  it("shows 'No space found' if the API returns null/undefined", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(null),
    } as Response);

    renderWithRouter(<PlaceInfo />);

    await waitFor(() => {
      expect(screen.getByText(/No space found\./i)).toBeInTheDocument();
    });
  });

  it("renders space details when fetch succeeds", async () => {
    const mockPlace = {
      id: 1,
      name: "Queer Community Center",
      location: "Stockholm",
      reviews: [
        { id: 1, rating: 4 },
        { id: 2, rating: 5 },
      ],
    };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPlace),
    } as Response);

    renderWithRouter(<PlaceInfo />, "/places/1");

    await waitFor(() => {
      expect(screen.getByText("Queer Community Center")).toBeInTheDocument();
      expect(screen.getByText("Location: Stockholm")).toBeInTheDocument();
      expect(screen.getByText("4.5/5")).toBeInTheDocument();
    });
  });

  it("renders ReviewForm with the correct space ID", async () => {
    const mockPlace = {
      id: 1,
      name: "Queer Community Center",
      location: "Stockholm",
      reviews: [{ id: 1, rating: 5 }],
    };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPlace),
    } as Response);

    renderWithRouter(<PlaceInfo />, "/places/1");

    await waitFor(() => {
      expect(screen.getByText(/ReviewForm for space 1/i)).toBeInTheDocument();
    });
  });
});
