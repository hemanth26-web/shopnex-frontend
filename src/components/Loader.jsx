const Loader = ({ size = 32 }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "60px 0",
    }}
  >
    <div
      style={{
        width: size,
        height: size,
        border: "3px solid var(--color-border)",
        borderTopColor: "var(--color-primary)",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }}
    />
  </div>
);

export default Loader;
