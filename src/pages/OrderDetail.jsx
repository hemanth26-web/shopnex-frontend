import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FiCheckCircle, FiPackage, FiTruck, FiHome } from "react-icons/fi";
import api from "../utils/api";
import Loader from "../components/Loader";
import "./OrderDetail.css";

const steps = ["Pending", "Processing", "Shipped", "Delivered"];
const stepIcons = [FiCheckCircle, FiPackage, FiTruck, FiHome];

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data.order);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <Loader />;
  if (!order) return <div className="container" style={{ padding: 60 }}>Order not found.</div>;

  const currentStep = order.status === "Cancelled" ? -1 : steps.indexOf(order.status);

  return (
    <div className="container order-detail-page">
      <h1>Order #{order._id.slice(-8).toUpperCase()}</h1>
      <p className="order-detail-date">
        Placed on{" "}
        {new Date(order.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      {order.status === "Cancelled" ? (
        <div className="order-cancelled-banner">This order has been cancelled.</div>
      ) : (
        <div className="order-tracker">
          {steps.map((step, i) => {
            const Icon = stepIcons[i];
            const isComplete = i <= currentStep;
            return (
              <div className="tracker-step" key={step}>
                <div className={`tracker-icon ${isComplete ? "complete" : ""}`}>
                  <Icon size={18} />
                </div>
                <span>{step}</span>
                {i < steps.length - 1 && (
                  <div className={`tracker-line ${i < currentStep ? "complete" : ""}`} />
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="order-detail-grid">
        <div className="order-detail-items card">
          <h3>Items</h3>
          {order.orderItems.map((item, i) => (
            <div className="order-detail-item" key={i}>
              <img src={item.image} alt={item.name} />
              <div>
                <p className="item-name">{item.name}</p>
                <p className="muted">Qty: {item.qty}</p>
              </div>
              <p className="item-price">₹{(item.price * item.qty).toLocaleString("en-IN")}</p>
            </div>
          ))}
        </div>

        <div className="order-detail-side">
          <div className="card order-detail-box">
            <h3>Shipping Address</h3>
            <p>{order.shippingAddress.street}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
              {order.shippingAddress.pincode}
            </p>
            <p>Phone: {order.shippingAddress.phone}</p>
          </div>

          <div className="card order-detail-box">
            <h3>Payment Summary</h3>
            <div className="summary-row">
              <span>Items</span>
              <span>₹{order.itemsPrice.toLocaleString("en-IN")}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{order.shippingPrice === 0 ? "FREE" : `₹${order.shippingPrice}`}</span>
            </div>
            <div className="summary-row">
              <span>Tax</span>
              <span>₹{order.taxPrice.toLocaleString("en-IN")}</span>
            </div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>₹{order.totalPrice.toLocaleString("en-IN")}</span>
            </div>
            <p className={`payment-status ${order.isPaid ? "paid" : "unpaid"}`}>
              {order.isPaid ? "✓ Payment Successful" : "Payment Pending"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
