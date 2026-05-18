import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Cards from "../Cards/Cards";
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
  })),
}));


// Mock global fetch
vi.stubGlobal("fetch", vi.fn());

describe("Cards Page", () => {
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
    renderWithRouter(<Cards />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it("shows error message if fetch fails", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("Failed to fetch place"));
    renderWithRouter(<Cards />);

    await waitFor(() => {
      expect(
        screen.getByText(/Error: Failed to fetch place/i),
      ).toBeInTheDocument();
    });
  });

  it("shows 'Place not found' if API returns null/undefined", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(null),
    } as Response);

    renderWithRouter(<Cards />);

    await waitFor(() => {
      expect(screen.getByText(/Place not found\./i)).toBeInTheDocument();
    });
  });

  it("renders place details and reviews when fetch succeeds", async () => {
    const mockPlace = {
      id: 1,
      name: "Queer Community Center",
      location: "Stockholm",
      reviews: [
        { id: 1, comment: "Great place!", rating: 5 },
        { id: 2, comment: "Very welcoming", rating: 4 },
      ],
    };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPlace),
    } as Response);

    renderWithRouter(<Cards />, "/places/1");

    await waitFor(() => {
      expect(screen.getByText("Queer Community Center")).toBeInTheDocument();
      expect(screen.getByText("Location: Stockholm")).toBeInTheDocument();
      expect(screen.getByText("4.5/5")).toBeInTheDocument();
      expect(screen.getByLabelText("4.5 out of 5 stars")).toBeInTheDocument();
      expect(screen.getByText("Great place!")).toBeInTheDocument();
      expect(screen.getByText("Rating: 5/5")).toBeInTheDocument();
      expect(screen.getByText("Very welcoming")).toBeInTheDocument();
      expect(screen.getByText("Rating: 4/5")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Leave a Review/i })).toBeInTheDocument();
    });
  });

  it("shows 'No reviews yet' if place has no reviews", async () => {
    const mockPlace = {
      id: 1,
      name: "New Space",
      location: "Gothenburg",
      reviews: [],
    };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPlace),
    } as Response);

    renderWithRouter(<Cards />, "/places/1");

    await waitFor(() => {
      expect(screen.getByText("New Space")).toBeInTheDocument();
      expect(screen.getByText("Location: Gothenburg")).toBeInTheDocument();
      expect(screen.getByText("No ratings yet")).toBeInTheDocument();
      expect(screen.getByText("No reviews yet.")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Leave a Review/i })).toBeInTheDocument();
    });
  });
});
