import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import "./ReviewForm.css";

type ReviewProps = {
  placeId: string;
  onReviewSubmitted?: () => void;
};

function ReviewForm({ placeId, onReviewSubmitted }: ReviewProps) {
  const { isAuthenticated, user } = useAuth0();
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [authorInput, setAuthorInput] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;

    const author = isAuthenticated ? (user?.name ?? "") : authorInput.trim();
    if (!author) return;

    setStatus("submitting");

    try {
      const response = await fetch(`http://localhost:4000/places/${placeId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author, rating, comment }),
      });

      if (!response.ok) throw new Error("Failed to submit review");

      setStatus("success");
      setRating(null);
      setComment("");
      setAuthorInput("");
      onReviewSubmitted?.();
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="review-form">
      <h2>Leave a Review</h2>
      {status === "success" && (
        <p className="form-feedback form-feedback--success">
          Your review has been submitted. Thank you!
        </p>
      )}
      {status === "error" && (
        <p className="form-feedback form-feedback--error">
          Something went wrong. Please try again.
        </p>
      )}
      <form onSubmit={handleSubmit}>
        {isAuthenticated ? (
          <p className="posting-as">
            Posting as <strong>{user?.name}</strong>
          </p>
        ) : (
          <div className="form-group">
            <label htmlFor="review-author">Your name</label>
            <input
              id="review-author"
              type="text"
              value={authorInput}
              onChange={(e) => setAuthorInput(e.target.value)}
              required
              placeholder="Your name"
              className="author-input"
            />
          </div>
        )}
        <div className="form-group">
          <label htmlFor="review-rating">Rating</label>
          <select
            id="review-rating"
            className="rating-select"
            value={rating ?? ""}
            onChange={(e) => setRating(e.target.value ? Number(e.target.value) : null)}
            required
          >
            <option value="" disabled>
              Select a rating
            </option>
            <option value="1">1 — Poor</option>
            <option value="2">2 — Below average</option>
            <option value="3">3 — Average</option>
            <option value="4">4 — Good</option>
            <option value="5">5 — Excellent</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="review-comment">Comment (optional)</label>
          <textarea
            id="review-comment"
            className="comment-textarea"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
          />
        </div>
        <button
          type="submit"
          className="submit-button"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Submitting…" : "Submit Review"}
        </button>
      </form>
    </div>
  );
}

export default ReviewForm;
