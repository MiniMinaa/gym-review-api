import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PacmanLoader } from "react-spinners";
import "./Browse.css";
import StarRating, { averageRating } from "../../components/StarRating";

interface Review {
  id: number;
  rating: number;
}

interface Place {
  id: number;
  name: string;
  location: string;
  description?: string;
  imageUrl?: string;
  venueType: string;
  tags: string[];
  reviews: Review[];
}

const VENUE_TYPE_LABELS: Record<string, string> = {
  cafe: "Cafe",
  restaurant: "Restaurant",
  bar: "Bar",
  nightclub: "Nightclub",
  gym: "Gym",
  studio: "Studio",
  pool: "Pool",
  library: "Library",
  bookstore: "Bookstore",
  theatre: "Theatre",
  cinema: "Cinema",
  gallery: "Gallery",
  park: "Park",
  salon: "Salon",
  clinic: "Clinic",
  coworking: "Coworking",
  hostel: "Hostel",
  "record-store": "Record Store",
};

const TAG_GROUPS: Record<string, string[]> = {
  Accessibility: [
    "wheelchair-accessible",
    "step-free",
    "accessible-bathroom",
    "automatic-doors",
    "large-print",
    "captions",
    "pool-hoist",
    "adaptive-routes",
  ],
  "Sensory / Neurodivergent": [
    "sensory-friendly",
    "quiet-space",
    "low-noise",
  ],
  "Identity-affirming": [
    "lgbtq-owned",
    "lgbtq-affirming",
    "trans-friendly",
    "trans-affirming",
    "sapphic-owned",
    "bipoc-owned",
    "bipoc-affirming",
    "women-owned",
  ],
  "Sober & Class-conscious": [
    "alcohol-free",
    "sober-friendly",
    "sliding-scale",
    "free-entry",
  ],
  "Parents & Caregivers": [
    "chest-feeding-friendly",
    "changing-table-all-genders",
    "family-bathroom",
    "stroller-accessible",
    "high-chairs",
    "kids-welcome",
  ],
};

const TAG_LABELS: Record<string, string> = {
  "wheelchair-accessible": "Wheelchair accessible",
  "step-free": "Step-free entrance",
  "accessible-bathroom": "Accessible bathroom",
  "automatic-doors": "Automatic doors",
  "large-print": "Large-print",
  captions: "Captioned content",
  "pool-hoist": "Pool hoist",
  "adaptive-routes": "Adaptive routes",
  "sensory-friendly": "Sensory-friendly hours",
  "quiet-space": "Quiet space",
  "low-noise": "Low-noise",
  "lgbtq-owned": "LGBTQ+-owned",
  "lgbtq-affirming": "LGBTQ+-affirming",
  "trans-friendly": "Trans-friendly",
  "trans-affirming": "Trans-affirming",
  "sapphic-owned": "Sapphic-owned",
  "bipoc-owned": "BIPOC-owned",
  "bipoc-affirming": "BIPOC-affirming",
  "women-owned": "Women-owned",
  "alcohol-free": "Alcohol-free",
  "sober-friendly": "Sober-friendly",
  "sliding-scale": "Sliding-scale pricing",
  "free-entry": "Free entry",
  "chest-feeding-friendly": "Chest/breastfeeding-friendly",
  "changing-table-all-genders": "Changing table (all genders)",
  "family-bathroom": "Family bathroom",
  "stroller-accessible": "Stroller-accessible",
  "high-chairs": "High chairs",
  "kids-welcome": "Kids welcome",
};

const SIDEBAR_KEY = "browse:sidebarOpen";

const parseList = (s: string | null): string[] =>
  s ? s.split(",").filter(Boolean) : [];

function Browse() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(
    () => localStorage.getItem(SIDEBAR_KEY) !== "false",
  );

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:4000";

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/places`);
        if (!response.ok) throw new Error("Failed to fetch places");
        const data = await response.json();
        setPlaces(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  // Filter state is derived from the URL so browser back/forward restores it.
  const searchQuery = searchParams.get("q") ?? "";
  const selectedCities = useMemo(
    () => new Set(parseList(searchParams.get("cities"))),
    [searchParams],
  );
  const selectedVenueTypes = useMemo(
    () => new Set(parseList(searchParams.get("types"))),
    [searchParams],
  );
  const selectedTags = useMemo(
    () => new Set(parseList(searchParams.get("tags"))),
    [searchParams],
  );
  const minRating = Number(searchParams.get("minRating") ?? "0");

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
    setSearchParams(next, { replace: false });
  };

  const setSearchQuery = (q: string) => setParam("q", q || null);

  const toggleInUrlSet = (key: string, value: string) => {
    const current = new Set(parseList(searchParams.get(key)));
    if (current.has(value)) current.delete(value);
    else current.add(value);
    setParam(key, current.size ? Array.from(current).join(",") : null);
  };

  const setMinRating = (r: number) =>
    setParam("minRating", r > 0 ? String(r) : null);

  const clearAllFilters = () => setSearchParams(new URLSearchParams());

  const toggleSidebar = () => {
    const next = !sidebarOpen;
    setSidebarOpen(next);
    localStorage.setItem(SIDEBAR_KEY, String(next));
  };

  const cities = useMemo(
    () => Array.from(new Set(places.map((p) => p.location))).sort(),
    [places],
  );

  const sortedPlaces = useMemo(
    () => [...places].sort((a, b) => a.name.localeCompare(b.name)),
    [places],
  );

  const filteredPlaces = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return sortedPlaces.filter((place) => {
      if (q && !place.name.toLowerCase().includes(q)) return false;
      if (selectedCities.size && !selectedCities.has(place.location)) return false;
      if (selectedVenueTypes.size && !selectedVenueTypes.has(place.venueType))
        return false;
      if (selectedTags.size) {
        for (const tag of selectedTags) {
          if (!place.tags?.includes(tag)) return false;
        }
      }
      if (minRating > 0) {
        const avg = averageRating(place.reviews);
        if (avg === null || avg < minRating) return false;
      }
      return true;
    });
  }, [
    sortedPlaces,
    searchQuery,
    selectedCities,
    selectedVenueTypes,
    selectedTags,
    minRating,
  ]);

  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return sortedPlaces
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 5);
  }, [sortedPlaces, searchQuery]);

  const activeFilterCount =
    selectedCities.size +
    selectedVenueTypes.size +
    selectedTags.size +
    (minRating > 0 ? 1 : 0) +
    (searchQuery ? 1 : 0);

  if (loading)
    return (
      <div className="loading-message">
        <PacmanLoader cssOverride={{}} margin={2} size={25} />
      </div>
    );
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div
      className={`browse-layout${sidebarOpen ? "" : " sidebar-collapsed"}`}
    >
      {sidebarOpen && (
        <aside className="filter-sidebar" aria-label="Filters">
          <div className="filter-header">
            <h3>Filters</h3>
            <div className="filter-header-actions">
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  className="filter-clear"
                  onClick={clearAllFilters}
                >
                  Clear ({activeFilterCount})
                </button>
              )}
              <button
                type="button"
                className="sidebar-toggle"
                onClick={toggleSidebar}
                aria-label="Hide filters"
                title="Hide filters"
              >
                ‹
              </button>
            </div>
          </div>

          <details className="filter-section">
            <summary>
              City
              {selectedCities.size > 0 && (
                <span className="filter-count">{selectedCities.size}</span>
              )}
            </summary>
            <div className="filter-section-body">
              {cities.map((city) => (
                <label key={city} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedCities.has(city)}
                    onChange={() => toggleInUrlSet("cities", city)}
                  />
                  {city}
                </label>
              ))}
            </div>
          </details>

          <details className="filter-section">
            <summary>
              Venue type
              {selectedVenueTypes.size > 0 && (
                <span className="filter-count">{selectedVenueTypes.size}</span>
              )}
            </summary>
            <div className="filter-section-body">
              {Object.entries(VENUE_TYPE_LABELS).map(([key, label]) => (
                <label key={key} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedVenueTypes.has(key)}
                    onChange={() => toggleInUrlSet("types", key)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </details>

          <details className="filter-section">
            <summary>
              Minimum rating
              {minRating > 0 && <span className="filter-count">1</span>}
            </summary>
            <div className="filter-section-body">
              {[0, 3, 4, 5].map((r) => (
                <label key={r} className="filter-checkbox">
                  <input
                    type="radio"
                    name="minRating"
                    checked={minRating === r}
                    onChange={() => setMinRating(r)}
                  />
                  {r === 0 ? "Any" : `${r}+ stars`}
                </label>
              ))}
            </div>
          </details>

          {Object.entries(TAG_GROUPS).map(([group, tags]) => {
            const groupCount = tags.filter((t) => selectedTags.has(t)).length;
            return (
              <details key={group} className="filter-section">
                <summary>
                  {group}
                  {groupCount > 0 && (
                    <span className="filter-count">{groupCount}</span>
                  )}
                </summary>
                <div className="filter-section-body">
                  {tags.map((tag) => (
                    <label key={tag} className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedTags.has(tag)}
                        onChange={() => toggleInUrlSet("tags", tag)}
                      />
                      {TAG_LABELS[tag] || tag}
                    </label>
                  ))}
                </div>
              </details>
            );
          })}
        </aside>
      )}

      <main className="browse-main">
        {!sidebarOpen && (
          <button
            type="button"
            className="show-filters-button"
            onClick={toggleSidebar}
          >
            ›&nbsp;&nbsp;Show filters
            {activeFilterCount > 0 && (
              <span className="show-filters-badge">{activeFilterCount}</span>
            )}
          </button>
        )}

        <h1 className="places-title">Browse Spaces</h1>

        <div className="search-bar">
          <input
            type="search"
            placeholder="Search places by name…"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            className="search-input"
            aria-label="Search places"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="suggestions" role="listbox">
              {suggestions.map((p) => (
                <li
                  key={p.id}
                  role="option"
                  aria-selected="false"
                  onMouseDown={() => {
                    setSearchQuery(p.name);
                    setShowSuggestions(false);
                  }}
                >
                  <span className="suggestion-name">{p.name}</span>
                  <span className="suggestion-meta">
                    {p.location} ·{" "}
                    {VENUE_TYPE_LABELS[p.venueType] || p.venueType}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="results-count">
          {filteredPlaces.length} of {places.length} spaces
        </p>

        {filteredPlaces.length === 0 ? (
          <div className="no-places-message">
            {places.length === 0
              ? "No places found."
              : "No places match the current filters."}
          </div>
        ) : (
          <div className="places-grid">
            {filteredPlaces.map((place) => (
              <div key={place.id} className="place-card">
                {place.imageUrl && (
                  <img
                    src={place.imageUrl}
                    alt={place.name}
                    className="place-card-image"
                  />
                )}
                <h2 className="place-name">{place.name}</h2>
                <p className="place-location">{place.location}</p>
                <div className="place-ratings">
                  <StarRating
                    rating={averageRating(place.reviews)}
                    reviewCount={place.reviews?.length ?? 0}
                  />
                </div>
                <Link
                  to={`/places/${place.id}`}
                  className="place-details-link"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Browse;
