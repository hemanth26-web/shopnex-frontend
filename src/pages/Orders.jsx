import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import Loader from "../components/Loader";
import "./Orders.css";

const statusColors = {
  Pending: "pending",
  Processing: "processing",
  Shipped: "shipped",
  Delivered: "delivered",
  Cancelled: "cancelled",
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/orders/myorders");
        setOrders(data.orders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="container orders-page">
      <h1>My Orders</h1>

      {orders.length === 0 ? (
        <div className="orders-empty">
          <p>You haven't placed any orders yet.</p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <Link to={`/orders/${order._id}`} key={order._id} className="order-card card">
              <div className="order-card-top">
                <div>
                  <p className="order-id">Order #{order._id.slice(-8).toUpperCase()}</p>
                  <p className="order-date">
                    Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className={`order-status ${statusColors[order.status]}`}>
                  {order.status}
                </span>
              </div>
              <div className="order-card-items">
                {order.orderItems.slice(0, 4).map((item, i) => (
                  <img key={i} src={item.image} alt={item.name} />
                ))}
                {order.orderItems.length > 4 && (
                  <span className="order-more-items">+{order.orderItems.length - 4}</span>
                )}
              </div>
              <div className="order-card-bottom">
                <span>{order.orderItems.length} item(s)</span>
                <span className="order-total">₹{order.totalPrice.toLocaleString("en-IN")}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
