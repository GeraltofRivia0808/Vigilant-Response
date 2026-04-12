import { NavLink, Outlet } from "react-router-dom";
import { Activity, AlertTriangle, LayoutDashboard, Package, Users, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "DASHBOARD" },
  { to: "/alerts", icon: AlertTriangle, label: "ALERTS" },
  { to: "/resources", icon: Package, label: "RESOURCES" },
  { to: "/volunteers", icon: Users, label: "VOLUNTEERS" },
];

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="mono text-xs text-muted-foreground">
      {time.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
      {" "}
      <span className="text-foreground font-medium">{time.toLocaleTimeString("en-US", { hour12: false })}</span>
      {" UTC"}
    </span>
  );
}

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top Bar */}
      <header className="border-b border-border bg-card">
        <div className="flex h-11 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-foreground">
              Disaster Response Control Center
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                    isActive
                      ? "bg-primary/15 text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`
                }
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <LiveClock />
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-success">Active</span>
            </div>
            <button
              className="md:hidden p-1 text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="md:hidden border-t border-border bg-card p-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider ${
                    isActive ? "text-primary bg-primary/10" : "text-muted-foreground"
                  }`
                }
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 p-2 sm:p-3">
        <Outlet />
      </main>
    </div>
  );
}
