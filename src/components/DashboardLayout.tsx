import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Activity, AlertTriangle, LayoutDashboard, Package, Users, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

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
  const [showIntro, setShowIntro] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const timeout = setTimeout(() => setShowIntro(false), 1550);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="app-shell flex min-h-screen flex-col bg-background">
      <AnimatePresence>
        {showIntro ? (
          <motion.div
            key="drcc-intro"
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.45 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center"
            >
              <motion.p
                className="text-6xl font-black tracking-[0.4em] text-primary sm:text-7xl"
                animate={{ textShadow: ["0 0 0px hsl(0 72% 50%)", "0 0 22px hsl(0 72% 50% / 0.8)", "0 0 0px hsl(0 72% 50%)"] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                DRCC
              </motion.p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                Disaster Response Control Center
              </p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Top Bar */}
      <motion.header
        className="border-b border-border bg-card/80 backdrop-blur"
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.1 }}
      >
        <div className="flex h-11 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 4 }}
            >
              <Activity className="h-4 w-4 text-primary" />
            </motion.div>
            <span className="text-xs font-bold uppercase tracking-widest text-foreground">
              DRCC <span className="ml-1 text-muted-foreground">Disaster Response Control Center</span>
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
      </motion.header>

      {/* Content */}
      <main className="flex-1 p-2 sm:p-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
