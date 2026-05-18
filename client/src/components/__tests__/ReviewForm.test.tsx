import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ReviewForm from "../ReviewForm/ReviewForm";
import { useAuth0 } from "@auth0/auth0-react";
import "@testing-library/jest-dom";

// Mock useAuth0 with proper token handling
const mockGetAccessTokenSilently = vi.fn().mockResolvedValue("mock-token");

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: vi.fn(() => ({
    isAuthenticated: true,
    getAccessTokenSilently: mockGetAccessTokenSilently,
    getAccessTokenWithPopup: vi.fn(),
    getIdTokenClaims: vi.fn(),
    loginWithRedirect: vi.fn(),
    loginWithPopup: vi.fn(),
    logout: vi.fn(),
    handleRedirectCallback: vi.fn(),
    isLoading: false,
    user: { name: "Test User" },
    error: undefined,
  })),
}));

// Mock global fetch
vi.stubGlobal("fetch", vi.fn());

describe("ReviewForm Component", () => {
  const mockPlaceId = "1";

  beforeEach(() => {
    vi.resetAllMocks();
    mockGetAccessTokenSilently.mockResolvedValue("mock-token");
  });

  it("renders the form with select, textarea, and submit button", () => {
    render(<ReviewForm placeId={mockPlaceId} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Submit Review/i }),
    ).toBeInTheDocument();
  });

  it("does not submit if rating is invalid (less than 1)", async () => {
    const { container } = render(<ReviewForm placeId={mockPlaceId} />);
    const form = container.querySelector("form");
    fireEvent.submit(form!);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("does not submit if rating is invalid (greater than 5)", async () => {
    const { container } = render(<ReviewForm placeId={mockPlaceId} />);
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "6" } });
    const form = container.querySelector("form");
    fireEvent.submit(form!);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("submits the form with valid rating and comment", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);

    const { container } = render(<ReviewForm placeId={mockPlaceId} />);
    const select = screen.getByRole("combobox");
    const textarea = screen.getByRole("textbox");
    const form = container.querySelector("form");

    fireEvent.change(select, { target: { value: "5" } });
    fireEvent.change(textarea, { target: { value: "Great place!" } });
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/places/${mockPlaceId}/reviews`),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            author: "Test User",
            rating: 5,
            comment: "Great place!",
          }),
        }),
      );
    });
  });

  it("uses the Auth0 user name as the author when authenticated", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);

    const { container } = render(<ReviewForm placeId={mockPlaceId} />);
    expect(screen.getByText(/Posting as/i)).toBeInTheDocument();
    expect(screen.getByText("Test User")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "4" } });
    fireEvent.submit(container.querySelector("form")!);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/places/${mockPlaceId}/reviews`),
        expect.objectContaining({
          body: expect.stringContaining('"author":"Test User"'),
        }),
      );
    });
  });
});
