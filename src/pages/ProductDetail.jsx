import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiStar, FiShoppingCart, FiZap } from "react-icons/fi";
import api from "../utils/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import "./ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const { addToCart } = useCart();
  const { user } = useAuth();

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data.product);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setActiveImg(0);
    setQty(1);

    api
      .get(`/products/${id}`)
      .then(({ data }) => {
        if (isMounted) setProduct(data.product);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleBuyNow = () => {
    if (!user) {
      navigate("/login", { state: { from: `/products/${id}` } });
      return;
    }
    addToCart(product, qty);
    navigate("/cart");
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login", { state: { from: `/products/${id}` } });
      return;
    }
    if (!reviewComment.trim()) {
      toast.error("Please write a comment");
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post(`/products/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
      });
      toast.success("Review submitted!");
      setReviewComment("");
      fetchProduct();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <Loader />;
  if (!product) return <div className="container" style={{ padding: 60 }}>Product not found.</div>;

  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <div className="container product-detail">
      <div className="product-detail-grid">
        <div className="product-gallery">
          <div className="product-gallery-main">
            <img src={product.images[activeImg]} alt={product.name} />
          </div>
          {product.images.length > 1 && (
            <div className="product-gallery-thumbs">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  className={i === activeImg ? "active" : ""}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={img} alt={`${product.name} ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-info">
          <p className="product-info-brand">{product.brand}</p>
          <h1>{product.name}</h1>

          <div className="product-info-rating">
            <span className="rating-badge">
              {product.rating?.toFixed(1) || "New"} <FiStar size={12} fill="#fff" />
            </span>
            <span className="muted">{product.numReviews} ratings</span>
          </div>

          <div className="product-info-price">
            <span className="price-now">₹{product.price.toLocaleString("en-IN")}</span>
            {product.mrp > product.price && (
              <>
                <span className="price-mrp">₹{product.mrp.toLocaleString("en-IN")}</span>
                <span className="price-discount">{discount}% off</span>
              </>
            )}
          </div>

          <p className="product-info-desc">{product.description}</p>

          <p className={`stock-indicator ${product.stock === 0 ? "out" : "in"}`}>
            {product.stock === 0 ? "Out of stock" : `In stock (${product.stock} available)`}
          </p>

          {product.stock > 0 && (
            <div className="qty-selector">
              <span>Quantity</span>
              <div className="qty-controls">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))}>+</button>
              </div>
            </div>
          )}

          <div className="product-info-actions">
            <button
              className="btn btn-outline"
              disabled={product.stock === 0}
              onClick={() => addToCart(product, qty)}
            >
              <FiShoppingCart size={18} /> Add to Cart
            </button>
            <button
              className="btn btn-primary"
              disabled={product.stock === 0}
              onClick={handleBuyNow}
            >
              <FiZap size={18} /> Buy Now
            </button>
          </div>
        </div>
      </div>

      <div className="product-reviews">
        <h2>Customer Reviews</h2>

        {product.reviews.length === 0 ? (
          <p className="muted">No reviews yet. Be the first to review this product!</p>
        ) : (
          <div className="review-list">
            {product.reviews.map((review) => (
              <div key={review._id} className="review-item">
                <div className="review-item-header">
                  <strong>{review.name}</strong>
                  <span className="rating-badge small">
                    {review.rating} <FiStar size={10} fill="#fff" />
                  </span>
                </div>
                <p>{review.comment}</p>
              </div>
            ))}
          </div>
        )}

        <form className="review-form" onSubmit={handleReviewSubmit}>
          <h3>Write a review</h3>
          <div className="review-star-select">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setReviewRating(star)}
                aria-label={`Rate ${star} stars`}
              >
                <FiStar
                  size={22}
                  fill={star <= reviewRating ? "#ffc145" : "none"}
                  stroke={star <= reviewRating ? "#ffc145" : "#c8c8c8"}
                />
              </button>
            ))}
          </div>
          <textarea
            placeholder="Share your experience with this product..."
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            rows={3}
          />
          <button type="submit" className="btn btn-secondary" disabled={submittingReview}>
            {submittingReview ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductDetail;
