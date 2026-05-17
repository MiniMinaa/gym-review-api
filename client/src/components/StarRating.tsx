import "./StarRating.css";

interface StarRatingProps {
  rating: number | null;
  reviewCount?: number;
}

export default function StarRating({ rating, reviewCount }: StarRatingProps) {
  if (rating === null || Number.isNaN(rating)) {
    return <span className="star-rating star-rating--empty">No ratings yet</span>;
  }

  const rounded = Math.round(rating);
  const stars = "★".repeat(rounded) + "☆".repeat(5 - rounded);

  return (
    <span
      className="star-rating"
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
    >
      <span className="star-rating__stars" aria-hidden="true">{stars}</span>
      <span className="star-rating__value">{rating.toFixed(1)}/5</span>
      {reviewCount !== undefined && (
        <span className="star-rating__count">
          {" "}({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
        </span>
      )}
    </span>
  );
}

export function averageRating(reviews?: { rating: number }[]): number | null {
  if (!reviews || reviews.length === 0) return null;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}
