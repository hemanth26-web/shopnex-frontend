import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMail, FiArrowRight } from "react-icons/fi";
import api from "../utils/api";
import toast from "react-hot-toast";
import "./Auth.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
      toast.success("Reset link sent! Check your email.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-content">
          <h1>
            Shop<span>Nex</span>
          </h1>
          <p>Everything you need, delivered to your door.</p>
          <div className="auth-blob auth-blob-1" />
          <div className="auth-blob auth-blob-2" />
          <div className="auth-blob auth-blob-3" />
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-card">
          <h2>Forgot password</h2>
          <p className="auth-subtitle">
            {sent
              ? "Check your inbox for the reset link"
              : "Enter your email and we'll send you a reset link"}
          </p>

          {!sent && (
            <form onSubmit={handleSubmit}>
              <div className="auth-input-group">
                <FiMail className="auth-input-icon" size={18} />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary auth-submit-btn" disabled={loading}>
                {loading ? <span className="spinner" /> : <>Send reset link <FiArrowRight /></>}
              </button>
            </form>
          )}

          <p className="auth-switch">
            Remembered your password? <Link to="/login">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;