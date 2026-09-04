import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import "./Home.css";

const categories = [
  { name: "Electronics", emoji: "🎧" },
  { name: "Fashion", emoji: "👕" },
  { name: "Home & Kitchen", emoji: "🍳" },
  { name: "Books", emoji: "📚" },
  { name: "Beauty", emoji: "💄" },
  { name: "Sports", emoji: "🏸" },
  { name: "Toys", emoji: "🧸" },
  { name: "Grocery", emoji: "🛒" },
];

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get("/products/featured");
        setFeatured(data.products);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-text">
            <span className="hero-eyebrow">Mega Sale Live Now</span>
            <h1>
              Discover deals that <span>delight</span> you, every single day.
            </h1>
            <p>From electronics to everyday essentials — shop it all in one place.</p>
            <Link to="/products" className="btn btn-primary hero-cta">
              Start Shopping
            </Link>
          </div>
        </div>
      </section>

      <section className="container category-strip">
        {categories.map((cat) => (
          <Link
            to={`/products?category=${encodeURIComponent(cat.name)}`}
            key={cat.name}
            className="category-pill"
          >
            <span className="category-emoji">{cat.emoji}</span>
            <span>{cat.name}</span>
          </Link>
        ))}
      </section>

      <section className="container featured-section">
        <div className="section-heading">
          <h2>Featured for you</h2>
          <Link to="/products">View all →</Link>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="product-grid">
            {featured.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
