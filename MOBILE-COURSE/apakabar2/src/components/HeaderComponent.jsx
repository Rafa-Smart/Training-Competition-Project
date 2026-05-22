const HeaderComponent = ({ title, showBack, onback }) => {
  return (
    <header className="header">
      {showBack && (
        <button className="btn-back" onClick={onback}>
          ← back
        </button>
      )}
      <h1 className="header-title">{title}</h1>
    </header>
  );
};
export default HeaderComponent