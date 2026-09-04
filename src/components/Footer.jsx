import "./Footer.css";

const Footer = () => (
  <footer className="footer">
    <div className="container footer-inner">
      <div className="footer-col">
        <h4>
          Shop<span>Nex</span>
        </h4>
        <p>Your everyday marketplace for electronics, fashion, home, and more.</p>
      </div>
      <div className="footer-col">
        <h5>Company</h5>
        <a href="#">About Us</a>
        <a href="#">Careers</a>
        <a href="#">Contact</a>
      </div>
      <div className="footer-col">
        <h5>Help</h5>
        <a href="#">Payments</a>
        <a href="#">Shipping</a>
        <a href="#">Returns</a>
      </div>
      <div className="footer-col">
        <h5>Policy</h5>
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Use</a>
      </div>
    </div>
    <p className="footer-bottom">
      © {new Date().getFullYear()} ShopNex — Built as a portfolio project by Hemanth Kumar
    </p>
  </footer>
);

export default Footer;
