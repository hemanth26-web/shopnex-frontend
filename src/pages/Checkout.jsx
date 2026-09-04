import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import "./Checkout.css";

// Dynamically loads the Razorpay checkout script
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [placingOrder, setPlacingOrder] = useState(false);

  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    pincode: "",
    phone: user?.phone || "",
  });

  useEffect(() => {
    if (user?.addresses?.length > 0) {
      const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setAddress({
        street: defaultAddr.street,
        city: defaultAddr.city,
        state: defaultAddr.state,
        pincode: defaultAddr.pincode,
        phone: defaultAddr.phone,
      });
    }
  }, [user]);

  const shipping = cartTotal > 999 ? 0 : 49;
  const tax = Math.round(cartTotal * 0.02 * 100) / 100;
  const grandTotal = cartTotal + shipping + tax;

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!address.street || !address.city || !address.state || !address.pincode || !address.phone) {
      toast.error("Please fill all address fields");
      return;
    }

    setPlacingOrder(true);

    try {
      // Step 1: Create order in our DB
      const orderItems = cartItems.map((item) => ({
        product: item.product,
        qty: item.qty,
      }));

      const { data: orderData } = await api.post("/orders", {
        orderItems,
        shippingAddress: address,
        paymentMethod: "razorpay",
      });

      const dbOrder = orderData.order;

      // Step 2: Create Razorpay order
      const { data: rzpData } = await api.post(`/orders/${dbOrder._id}/razorpay`);

      // Step 3: Load Razorpay checkout script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway. Check your connection.");
        setPlacingOrder(false);
        return;
      }

      // Step 4: Open Razorpay checkout modal
      const options = {
        key: rzpData.keyId,
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: "ShopNex",
        description: `Order #${dbOrder._id.slice(-8)}`,
        order_id: rzpData.razorpayOrderId,
        prefill: {
          name: user.name,
          email: user.email,
          contact: address.phone,
        },
        theme: { color: "#ff5630" },
        handler: async (response) => {
          try {
            await api.post(`/orders/${dbOrder._id}/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            clearCart();
            toast.success("Payment successful! Order placed.");
            navigate(`/orders/${dbOrder._id}`);
          } catch {
            toast.error("Payment verification failed. Contact support.");
          }
        },
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled");
            setPlacingOrder(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
      setPlacingOrder(false);
    }
  };

  if (cartItems.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="container checkout-page">
      <h1>Checkout</h1>

      <form className="checkout-layout" onSubmit={handlePlaceOrder}>
        <div className="checkout-form-section">
          <h3>Shipping Address</h3>

          <div className="form-row">
            <label>Street Address</label>
            <input
              type="text"
              name="street"
              className="input-field"
              value={address.street}
              onChange={handleAddressChange}
              placeholder="House no., street, locality"
              required
            />
          </div>

          <div className="form-row-grid">
            <div className="form-row">
              <label>City</label>
              <input
                type="text"
                name="city"
                className="input-field"
                value={address.city}
                onChange={handleAddressChange}
                required
              />
            </div>
            <div className="form-row">
              <label>State</label>
              <input
                type="text"
                name="state"
                className="input-field"
                value={address.state}
                onChange={handleAddressChange}
                required
              />
            </div>
          </div>

          <div className="form-row-grid">
            <div className="form-row">
              <label>Pincode</label>
              <input
                type="text"
                name="pincode"
                className="input-field"
                value={address.pincode}
                onChange={handleAddressChange}
                required
              />
            </div>
            <div className="form-row">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="input-field"
                value={address.phone}
                onChange={handleAddressChange}
                required
              />
            </div>
          </div>

          <h3 className="payment-heading">Payment Method</h3>
          <div className="payment-method-box">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg"
              alt="Razorpay"
            />
            <p>Pay securely with Cards, UPI, Netbanking & Wallets via Razorpay</p>
          </div>
        </div>

        <div className="checkout-summary">
          <h3>Order Summary</h3>
          {cartItems.map((item) => (
            <div className="checkout-summary-item" key={item.product}>
              <span>
                {item.name} × {item.qty}
              </span>
              <span>₹{(item.price * item.qty).toLocaleString("en-IN")}</span>
            </div>
          ))}
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

          <button type="submit" className="btn btn-primary place-order-btn" disabled={placingOrder}>
            {placingOrder ? <span className="spinner" /> : `Pay ₹${grandTotal.toLocaleString("en-IN")}`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
