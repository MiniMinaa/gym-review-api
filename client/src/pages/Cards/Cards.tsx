import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Cards.css";
import ReviewForm from "../../components/ReviewForm/ReviewForm";
import StarRating, { averageRating } from "../../components/StarRating";

function Cards() {
  const { id } = useParams();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchPlace = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:4000/places/${id}`);
        if (!response.ok) throw new Error("Failed to fetch place");
        const data = await response.json();
        if (!cancelled) setPlace(data);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPlace();
    return () => { cancelled = true; };
  }, [id, refreshCount]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!place) return <div>Place not found.</div>;

  return (
    <div className="place-details-container">
      {place.imageUrl && (
        <img
          src={place.imageUrl}
          alt={place.name}
          className="place-hero-image"
        />
      )}
      <h1>{place.name}</h1>
      <p>Location: {place.location}</p>
      {place.description && (
        <p className="place-description">{place.description}</p>
      )}
      <div className="place-ratings">
        <StarRating
          rating={averageRating(place.reviews)}
          reviewCount={place.reviews?.length ?? 0}
        />
      </div>
      <div className="reviews-section">
        <h2>Reviews</h2>
        {place.reviews?.length > 0 ? (
          place.reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                {review.authorAvatar && (
                  <img
                    src={review.authorAvatar}
                    alt=""
                    className="review-avatar"
                  />
                )}
                <div className="review-author-info">
                  <span className="review-author">{review.author}</span>
                  {review.authorPronouns && (
                    <span className="review-pronouns">{review.authorPronouns}</span>
                  )}
                </div>
              </div>
              <p>{review.comment}</p>
              <span>Rating: {review.rating}/5</span>
            </div>
          ))
        ) : (
          <p>No reviews yet.</p>
        )}
      </div>

      <ReviewForm
        placeId={id}
        onReviewSubmitted={() => setRefreshCount((c) => c + 1)}
      />
    </div>
  );
}

export default Cards;
