const TABS = [
  {
    id: "home",
    label: "Home",
    icon: "🏚️",
  },
  {
    id: "discover",
    label: "Discover",
    icon: "🔍",
  },
  {
    id: "bookmark",
    label: "Bookmark",
    icon: "🔖",
  },
  {
    id: "settings",
    label: "Settings",
    icon: "🧿",
  },
];
export default Navbar = ({ tab, setTab }) => {
  return (
    <nav className="nav" role="navigation">
      {TABS.map(({ id, label, icon }) => {
        return (
          <button
            key={id}
            className={`nav-btn ${tab == id ? "active" : ""}`}
            onClick={() => setTab(id)}
          >
            {icon}
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
};
