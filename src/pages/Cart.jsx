import { Link, useNavigate } from "react-router-dom";
import { FiTrash2, FiShoppingBag } from "react-icons/fi";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./Cart.css";

const Cart = () => {
  const { cartItems, updateQty, removeFromCart, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const shipping = cartTotal > 999 ? 0 : 49;
  const tax = Math.round(cartTotal * 0.02 * 100) / 100;
  const grandTotal = cartTotal + shipping + tax;

  const handleCheckout = () => {
    if (!user) {
      navigate("/login", { state: { from: "/checkout" } });
      return;
    }
    navigate("/checkout");
  };

  if (cartItems.length === 0) {
    return (
      <div className="container cart-empty">
        <FiShoppingBag size={56} />
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn btn-primary">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container cart-page">
      <h1>Shopping Cart ({cartItems.length})</h1>

      <div className="cart-layout">
        <div className="cart-items">
          {cartItems.map((item) => (
            <div className="cart-item" key={item.product}>
              <img src={item.image} alt={item.name} />
              <div className="cart-item-info">
                <h3>{item.name}</h3>
                <p className="cart-item-price">₹{item.price.toLocaleString("en-IN")}</p>
                <div className="cart-item-controls">
                  <div className="qty-controls">
                    <button
                      onClick={() => updateQty(item.product, Math.max(1, item.qty - 1))}
                    >
                      −
                    </button>
                    <span>{item.qty}</span>
                    <button
                      onClick={() =>
                        updateQty(item.product, Math.min(item.stock, item.qty + 1))
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="cart-remove-btn"
                    onClick={() => removeFromCart(item.product)}
                  >
                    <FiTrash2 size={16} /> Remove
                  </button>
                </div>
              </div>
              <p className="cart-item-subtotal">
                ₹{(item.price * item.qty).toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{cartTotal.toLocaleString("en-IN")}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
          </div>
          <div className="summary-row">
            <span>Tax</span>
            <span>₹{tax.toLocaleString("en-IN")}</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>₹{grandTotal.toLocaleString("en-IN")}</span>
          </div>
          <button className="btn btn-primary checkout-btn" onClick={handleCheckout}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
