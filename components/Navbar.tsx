"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import AccountModal from "./AccountModal";
import Button from "./Button";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/properties", label: "Properties" },
  { href: "/news", label: "News" },
  { href: "/contact", label: "Contact" },
];

const SERVICE_LINKS = [
  { href: "/parking", label: "Parking" },
  { href: "/workforce", label: "Workforce" },
  { href: "/facilities", label: "Facilities" },
];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export default function Navbar({ themeControl }: { themeControl?: React.ReactNode }) {
  const { user, logout, openModal } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  }

  React.useEffect(() => {
    document.body.classList.toggle("mobile-open", mobileMenuOpen);
    return () => document.body.classList.remove("mobile-open");
  }, [mobileMenuOpen]);

  React.useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    const hasHeroBlend = pathname === "/" || pathname === "/about" || pathname === "/news";
    document.body.classList.toggle("has-hero-header", hasHeroBlend);

    const updateScrolled = () => setScrolled(window.scrollY > 24);
    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });

    return () => {
      document.body.classList.remove("has-hero-header");
      window.removeEventListener("scroll", updateScrolled);
    };
  }, [pathname]);

  const isServiceActive = SERVICE_LINKS.some((l) => pathname?.startsWith(l.href));
  const hasHeroBlend = pathname === "/" || pathname === "/about" || pathname === "/news";

  return (
    <header className={`site-header${hasHeroBlend ? " site-header--hero" : ""}${scrolled || mobileMenuOpen ? " is-scrolled" : ""}`}>
      <div className="container navbar">
        <Link href="/" className="brand">
          <Image src="/assets/logo.png" alt="Marajo Group" className="site-logo" width={140} height={40} priority />
          <span className="visually-hidden">Marajo Group</span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          <span className="hamb" />
        </button>

        <nav className="nav-links">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={`nav-link${pathname === l.href ? " active" : ""}`}>
              {l.label}
            </Link>
          ))}

          <div
            className={`nav-dropdown${dropdownOpen ? " open" : ""}`}
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button
              type="button"
              className={`nav-link nav-dropdown-toggle${isServiceActive ? " active" : ""}`}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              onClick={() => setDropdownOpen((o) => !o)}
              onFocus={() => setDropdownOpen(true)}
            >
              Services
              <svg className="dropdown-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {dropdownOpen && (
              <ul className="nav-dropdown-menu" role="menu" onClick={() => setDropdownOpen(false)}>
                {SERVICE_LINKS.map((l) => (
                  <li role="none" key={l.href}>
                    <Link className="nav-dropdown-item" href={l.href} role="menuitem" onClick={() => setDropdownOpen(false)}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </nav>

        <form onSubmit={handleSearch} className="nav-search" role="search">
          <input
            type="search"
            placeholder="Search…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="nav-search-input"
            aria-label="Search"
          />
        </form>

        <div className="header-actions">
          {themeControl}
          {!user ? (
            <Button type="button" onClick={() => openModal("login")} className="btn-primary nav-login-button">
              Log In
            </Button>
          ) : (
            <div className="user-menu">
              <button
                type="button"
                onClick={() => setUserMenuOpen((o) => !o)}
                className="user-avatar"
                aria-haspopup="true"
                aria-expanded={userMenuOpen}
              >
                {initials(user.name || user.email)}
              </button>
              {userMenuOpen && (
                <div className="user-dropdown-menu" onMouseLeave={() => setUserMenuOpen(false)}>
                  <p className="user-dropdown-email">{user.email}</p>
                  <button
                    type="button"
                    className="user-dropdown-item"
                    onClick={() => {
                      setAccountOpen(true);
                      setUserMenuOpen(false);
                    }}
                  >
                    My Account
                  </button>
                  <button
                    type="button"
                    className="user-dropdown-item user-dropdown-item-danger"
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                    }}
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AccountModal open={accountOpen} onClose={() => setAccountOpen(false)} />
    </header>
  );
}
