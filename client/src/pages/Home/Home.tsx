import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Welcome to Safe Space</h1>
        <p>
          A community-driven platform for underrepresented groups to rate and
          review the spaces where they actually feel safe, seen, and welcomed.
        </p>
      </header>

      <section className="home-cta">
        <Link to="/places" className="cta-button">
          Browse Spaces
        </Link>
      </section>

      <section className="home-features">
        <h2>Why Safe Space?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Rate Safety</h3>
            <p>
              Share your experiences to help others find inclusive and safe
              spaces.
            </p>
          </div>
          <div className="feature-card">
            <h3>Discover Community Reviews</h3>
            <p>Read reviews from people with similar needs and concerns.</p>
          </div>
          <div className="feature-card">
            <h3>Support Local Businesses</h3>
            <p>
              Highlight spaces that prioritize inclusivity and accessibility.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
