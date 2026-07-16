"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import AccountModal from "./AccountModal";
import Button from "./Button";
import Container from "./Container";

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
  { href: "/cafeteria", label: "Cafeteria" },
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLFormElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/properties?q=${encodeURIComponent(searchQuery.trim())}`);
    closeSearch();
    setMobileMenuOpen(false);
  }

  function closeSearch() {
    setSearchOpen(false);
    setSearchQuery("");
    searchInputRef.current?.blur();
  }

  function openSearch() {
    setSearchOpen(true);
    window.requestAnimationFrame(() => searchInputRef.current?.focus());
  }

  function previewSearch() {
    setSearchOpen(true);
  }

  function handleSearchMouseLeave() {
    if (document.activeElement !== searchInputRef.current) closeSearch();
  }

  React.useEffect(() => {
    if (!searchOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) closeSearch();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSearch();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [searchOpen]);

  React.useEffect(() => {
    document.body.classList.toggle("mobile-open", mobileMenuOpen);
    return () => document.body.classList.remove("mobile-open");
  }, [mobileMenuOpen]);

  React.useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    const isPropertyDetail = Boolean(pathname?.startsWith("/properties/"));
    const hasHeroBlend = pathname === "/" || pathname === "/about" || pathname === "/properties" || pathname === "/news" || pathname === "/contact" || isPropertyDetail;
    document.body.classList.toggle("has-hero-header", hasHeroBlend);
    document.body.classList.toggle("has-property-hero-header", isPropertyDetail);

    const updateScrolled = () => {
      const propertyHeroThreshold = Math.min(window.innerHeight * 0.78, 720);
      setScrolled(window.scrollY > (isPropertyDetail ? propertyHeroThreshold : 24));
    };
    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });

    return () => {
      document.body.classList.remove("has-hero-header");
      document.body.classList.remove("has-property-hero-header");
      window.removeEventListener("scroll", updateScrolled);
    };
  }, [pathname]);

  const isServiceActive = SERVICE_LINKS.some((l) => pathname?.startsWith(l.href));
  const isPropertyDetail = Boolean(pathname?.startsWith("/properties/"));
  const hasHeroBlend = pathname === "/" || pathname === "/about" || pathname === "/properties" || pathname === "/news" || pathname === "/contact" || isPropertyDetail;

  return (
    <header className={`site-header${hasHeroBlend ? " site-header--hero" : ""}${isPropertyDetail ? " site-header--property" : ""}${scrolled || mobileMenuOpen ? " is-scrolled" : ""}`}>
      <Container className="navbar">
        <Link href="/" className="brand">
          <img src="/assets/logo.png" alt="Marajo Group" className="site-logo" width={42} height={49} fetchPriority="high" />
          <span className="visually-hidden">Marajo Group</span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-controls="site-navigation"
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          <span className="hamb" />
        </button>

        <nav id="site-navigation" className="nav-links" aria-label="Primary navigation">
          <form onSubmit={handleSearch} className="nav-mobile-search" role="search" aria-label="Mobile site search">
            <input
              type="search"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="nav-mobile-search-input"
              aria-label="Search"
            />
            <button type="submit" className="nav-mobile-search-button" aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </button>
          </form>

          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={`nav-link${pathname === l.href ? " active" : ""}`}>
              {l.label}
            </Link>
          ))}

          <div className={`nav-dropdown${dropdownOpen ? " open" : ""}`}>
            <button
              type="button"
              className={`nav-link nav-dropdown-toggle${isServiceActive ? " active" : ""}`}
              aria-controls="services-menu"
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
              onClick={() => setDropdownOpen((o) => !o)}
            >
              Services
              <svg className="dropdown-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            {dropdownOpen && (
              <ul id="services-menu" className="nav-dropdown-menu" role="menu" onClick={() => setDropdownOpen(false)}>
                {SERVICE_LINKS.map((l) => (
                  <li role="none" key={l.href}>
                    <Link
                      className="nav-dropdown-item"
                      href={l.href}
                      role="menuitem"
                      onClick={() => setDropdownOpen(false)}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="nav-mobile-footer" aria-label="Mobile account controls">
            {!user ? (
              <button
                type="button"
                className="nav-mobile-account-button"
                onClick={() => {
                  openModal("login");
                  setMobileMenuOpen(false);
                }}
              >
                Log In
              </button>
            ) : (
              <div className="nav-mobile-account-actions">
                <button
                  type="button"
                  className="nav-mobile-account-button"
                  onClick={() => {
                    setAccountOpen(true);
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="user-avatar nav-mobile-avatar" aria-hidden="true">
                    {initials(user.name || user.email)}
                  </span>
                  My Account
                </button>
                <button
                  type="button"
                  className="nav-mobile-logout-button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </nav>

        <div className="nav-utilities">
        <form
          ref={searchRef}
          onSubmit={handleSearch}
          className={`nav-search${searchOpen ? " is-open" : ""}`}
          role="search"
          aria-label="Property search"
          onMouseEnter={() => {
            if (window.matchMedia("(hover: hover)").matches) previewSearch();
          }}
          onMouseLeave={handleSearchMouseLeave}
        >
          <input
            ref={searchInputRef}
            type="search"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="nav-search-input"
            aria-label="Search properties"
            tabIndex={searchOpen ? 0 : -1}
          />
          <button
            type={searchOpen ? "submit" : "button"}
            className="nav-search-trigger"
            aria-label={searchOpen ? "Search properties" : "Open property search"}
            aria-expanded={searchOpen}
            onClick={searchOpen ? undefined : openSearch}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </button>
          {searchOpen && (
            <button type="button" className="nav-search-close" aria-label="Close property search" onClick={closeSearch}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          )}
        </form>

        <div className="header-actions">
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
                  {themeControl && (
                    <div className="user-dropdown-theme">
                      <span>Appearance</span>
                      {themeControl}
                    </div>
                  )}
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
      </Container>

      <AccountModal open={accountOpen} onClose={() => setAccountOpen(false)} themeControl={themeControl} />
    </header>
  );
}
