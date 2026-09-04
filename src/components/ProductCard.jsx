import { Link } from "react-router-dom";
import { FiStar, FiShoppingCart } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.stock === 0) {
      toast.error("This product is out of stock");
      return;
    }
    addToCart(product, 1);
  };

  return (
    <Link to={`/products/${product._id}`} className="product-card card">
      {discount > 0 && <span className="deal-ribbon">{discount}% OFF</span>}
      <div className="product-card-img">
        <img src={product.images[0]} alt={product.name} loading="lazy" />
      </div>
      <div className="product-card-body">
        <p className="product-card-brand">{product.brand}</p>
        <h3 className="product-card-name">{product.name}</h3>

        <div className="product-card-rating">
          <FiStar size={13} fill="#ffc145" stroke="#ffc145" />
          <span>{product.rating?.toFixed(1) || "New"}</span>
          {product.numReviews > 0 && <span className="muted">({product.numReviews})</span>}
        </div>

        <div className="product-card-price">
          <span className="price-now">₹{product.price.toLocaleString("en-IN")}</span>
          {product.mrp > product.price && (
            <span className="price-mrp">₹{product.mrp.toLocaleString("en-IN")}</span>
          )}
        </div>

        <button
          className="btn btn-primary product-card-cta"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          <FiShoppingCart size={16} />
          {product.stock === 0 ? "Out of stock" : "Add to cart"}
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
