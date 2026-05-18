import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import ReviewForm from "../../components/ReviewForm/ReviewForm";
import "./Review.css";

function Review() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [placeName, setPlaceName] = useState<string | null>(null);

  useEffect(() => {
    fetch(`http://localhost:4000/places/${id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setPlaceName(data.name))
      .catch(() => setPlaceName(null));
  }, [id]);

  return (
    <div className="review-page">
      <Link to={`/places/${id}`} className="review-page__back">
        ← Back to {placeName ?? "place"}
      </Link>
      <h1 className="review-page__title">
        Leave a review{placeName ? ` for ${placeName}` : ""}
      </h1>
      <ReviewForm
        placeId={id}
        onReviewSubmitted={() => navigate(`/places/${id}`)}
      />
    </div>
  );
}

export default Review;
