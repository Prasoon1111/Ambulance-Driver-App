function LoadingSkeleton({ rows = 3 }) {
  return (
    <div className="loading-skeleton" aria-label="Loading placeholder">
      {Array.from({ length: rows }).map((_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}

export default LoadingSkeleton;
