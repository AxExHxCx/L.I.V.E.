import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Map, Package, Cpu, Zap, Radio, Users, Wifi } from 'lucide-react';

const navItems = [
  { path: '/', icon: Map, label: 'MAP' },
  { path: '/inventory', icon: Package, label: 'VAULT' },
  { path: '/schematics', icon: Cpu, label: 'SCHEMATICS' },
  { path: '/ai-lab', icon: Zap, label: 'A.I. LAB' },
  { path: '/minions', icon: Users, label: 'MINIONS' },
  { path: '/darknet', icon: Wifi, label: 'DARKNET' },
];

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      {/* Top bar */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0 bg-card/80 backdrop-blur-sm z-50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Radio className="w-6 h-6 text-primary" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full animate-ping" />
          </div>
          <div>
            <h1 className="font-heading text-sm font-bold tracking-widest text-primary leading-none">
              L.I.V.E.
            </h1>
            <p className="font-body text-[10px] text-muted-foreground tracking-wider leading-none mt-0.5">
              LIVE • INTERACTIVE • VILLAINOUS • E-SYSTEM
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 font-body text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          SYSTEM ACTIVE
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="h-16 border-t border-border flex items-center shrink-0 bg-card/90 backdrop-blur-sm z-50 overflow-x-auto px-2 gap-1">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 shrink-0 flex-1 min-w-[52px] ${
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span className="font-heading text-[9px] tracking-wider">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}