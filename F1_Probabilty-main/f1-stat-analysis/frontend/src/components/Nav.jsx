import { useNavigate, useLocation } from "react-router-dom";

export default function Nav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const link = (label, to, isHash = false) => {
    if (isHash) {
      return (
        <a
          key={label}
          href={to}
          className="text-sm text-white/60 hover:text-white transition-colors hidden md:inline"
        >
          {label}
        </a>
      );
    }
    return (
      <button
        key={label}
        onClick={() => navigate(to)}
        className={`text-sm transition-colors hidden md:inline ${
          pathname === to ? "text-white font-semibold" : "text-white/60 hover:text-white"
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-f1black/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-1">
            <div className="h-6 w-1 rounded bg-f1red" />
            <div className="h-4 w-1 rounded bg-f1red/50" />
          </div>
          <span className="font-bold text-white tracking-wide">F1 Stats</span>
        </button>

        <div className="flex items-center gap-6">
          {pathname === "/" && link("How it works", "#how-it-works", true)}
          {pathname === "/" && link("Features", "#features", true)}
          {link("Docs", "/docs")}
          {link("Analyze", "/analyze")}
          <button
            onClick={() => navigate("/analyze")}
            className="rounded-lg bg-f1red px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Launch →
          </button>
        </div>
      </div>
    </nav>
  );
}
