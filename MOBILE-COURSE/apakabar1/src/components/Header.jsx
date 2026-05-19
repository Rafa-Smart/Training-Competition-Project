export default function Header({ title, showBack, onBack }) {
  return (
    <header className="header">
      {showBack && (
        <button className="back-btn" onClick={onBack} aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
      )}
      <h1 className="header-title">{title}</h1>
    </header>
  );
}