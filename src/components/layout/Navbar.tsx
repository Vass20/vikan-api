"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, MessageSquare, Search, Menu, X, User, LogOut, ShieldAlert, Award, Sun, Moon } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { logout as reduxLogout } from "@/lib/redux/slices/authSlice";
import { useGetMyProfileQuery, useGetNotificationsQuery, useMarkNotificationReadMutation, useMarkAllNotificationsReadMutation } from "@/lib/redux/api";

export const VikanLogo = ({ className = "", imgClassName = "h-13 md:h-16" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src="/logo.png"
        alt="Vikan Matrimony Logo"
        className={`${imgClassName} w-auto object-contain`}
      />
    </div>
  );
};

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  
  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const { data: myProfile } = useGetMyProfileQuery(undefined, { skip: !currentUser });

  const { data: apiNotifications = [] } = useGetNotificationsQuery(undefined, { skip: !currentUser });
  const [markReadApi] = useMarkNotificationReadMutation();
  const [markAllReadApi] = useMarkAllNotificationsReadMutation();

  const notifications = apiNotifications;

  const markNotificationRead = async (id: string) => {
    try {
      await markReadApi(id).unwrap();
    } catch (err) {
      console.error("Failed to mark notification read", err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await markAllReadApi().unwrap();
    } catch (err) {
      console.error("Failed to mark all notifications read", err);
    }
  };

  const {
    chats,
    logout: zustandLogout,
    themeMode,
    toggleTheme
  } = useAppStore();

  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Mobile menu
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Avoid hydration mismatches
  useEffect(() => {
    setMounted(true);
    // Sync initial theme class
    if (typeof window !== "undefined") {
      const root = window.document.documentElement;
      if (themeMode === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [themeMode]);

  if (!mounted) {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <VikanLogo />
          <div className="h-6 w-24 bg-muted/40 rounded animate-pulse" />
        </div>
      </header>
    );
  }

  const unreadNotifications = notifications.filter((n) => !n.isRead).length;
  
  // Calculate unread chats
  const unreadChats = Object.values(chats).reduce((count, chat) => {
    const lastMsgs = chat.messages;
    if (lastMsgs.length > 0) {
      const lastMsg = lastMsgs[lastMsgs.length - 1];
      if (lastMsg.senderId !== currentUser?.id && !lastMsg.isRead) {
        return count + 1;
      }
    }
    return count;
  }, 0);

  const handleLogout = () => {
    dispatch(reduxLogout());
    zustandLogout();
    router.push("/");
  };

  const isSuperAdmin = currentUser?.email === "admin@vikan.com";

  const navLinks = currentUser
    ? isSuperAdmin
      ? [
          { href: "/admin", label: "Admin" }
        ]
      : [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/search", label: "Search" },
          { href: "/chat", label: "Messages", badge: unreadChats },
          { href: "/membership", label: "Membership" }
        ]
    : [
        { href: "/", label: "Home" }
      ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/90 backdrop-blur-md luxury-shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href={currentUser ? (isSuperAdmin ? "/admin" : "/dashboard") : "/"} className="flex-shrink-0 cursor-pointer">
            <VikanLogo />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center text-sm font-medium transition-colors hover:text-brand-gold ${
                    isActive ? "text-brand-navy font-bold dark:text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                  {link.badge ? (
                    <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-bold bg-brand-gold text-brand-navy rounded-full">
                      {link.badge}
                    </span>
                  ) : null}
                  {isActive && (
                    <span className="absolute bottom-[-28px] left-0 right-0 h-0.5 bg-brand-gold rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions Menu */}
          <div className="flex items-center gap-4">


            {currentUser && !isSuperAdmin ? (
              <>
                {/* Search Quick Button */}
                <Link href="/search" className="hidden sm:inline-flex p-2 rounded-full text-muted-foreground hover:bg-muted/50 transition-colors">
                  <Search className="h-5 w-5" />
                </Link>

                {/* Chat Quick Button */}
                <Link href="/chat" className="p-2 rounded-full text-muted-foreground hover:bg-muted/50 transition-colors relative cursor-pointer" title="Messages">
                  <MessageSquare className="h-5 w-5" />
                  {unreadChats > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-gold animate-pulse" />
                  )}
                </Link>

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowUserMenu(false);
                    }}
                    className="p-2 rounded-full text-muted-foreground hover:bg-muted/50 transition-colors relative cursor-pointer"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadNotifications > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive animate-ping" />
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-3 w-80 glass-premium rounded-xl shadow-xl border border-brand-gold/30 p-2 z-50">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                        <span className="font-serif text-sm font-bold text-brand-navy dark:text-foreground">
                          Notifications ({unreadNotifications})
                        </span>
                        {unreadNotifications > 0 && (
                          <button
                            onClick={markAllNotificationsRead}
                            className="text-xs text-brand-gold hover:underline cursor-pointer font-support"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto mt-1 flex flex-col scrollbar-thin">
                        {notifications.length === 0 ? (
                          <span className="text-xs text-muted-foreground text-center py-6 font-support">
                            No notifications yet.
                          </span>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                markNotificationRead(n.id);
                                if (n.link) router.push(n.link);
                                setShowNotifications(false);
                              }}
                              className={`p-2.5 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer text-left border-b border-border/40 last:border-0 ${
                                !n.isRead ? "bg-brand-gold/5 dark:bg-brand-navy/30 font-semibold" : ""
                              }`}
                            >
                              <div className="flex justify-between items-start gap-1">
                                <span className="text-xs text-foreground block font-sans">
                                  {n.title}
                                </span>
                                <span className="text-[9px] text-muted-foreground font-support">
                                  {n.timestamp}
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5 font-support leading-tight">
                                {n.body}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : null}

            {currentUser ? (
              <>
                {/* Profile Avatar Menu */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowUserMenu(!showUserMenu);
                      setShowNotifications(false);
                    }}
                    className="flex items-center gap-2 p-1 rounded-full border border-border/80 hover:border-brand-gold transition-all duration-300 cursor-pointer"
                  >
                    {myProfile?.photos?.[0] && !avatarError ? (
                      <img
                        src={myProfile.photos[0]}
                        alt={currentUser.name}
                        onError={() => setAvatarError(true)}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-brand-gold/20 text-brand-gold border border-brand-gold/30 flex items-center justify-center text-xs font-bold font-serif uppercase">
                        {currentUser?.name?.charAt(0) || "U"}
                      </div>
                    )}
                  </button>

                  {/* Profile Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-3 w-56 glass-premium rounded-xl shadow-xl border border-brand-gold/30 p-2 z-50">
                      <div className="px-3 py-2 border-b border-border">
                        <span className="font-semibold text-xs text-foreground block truncate">
                          {currentUser.name}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                          {myProfile?.isPremium ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold gold-gradient text-brand-navy font-support uppercase">
                              <Award className="h-2.5 w-2.5" /> Premium
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground font-support">
                              Free Account
                            </span>
                          )}
                          {myProfile?.isVerified && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-navy text-brand-ivory dark:bg-brand-gold dark:text-brand-navy font-support uppercase">
                              ★ Verified
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-1.5 flex flex-col gap-0.5">
                        <Link
                          href={`/profile/${myProfile?.id || currentUser.id}`}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-muted/40 transition-colors"
                        >
                          <User className="h-4 w-4 text-muted-foreground" />
                          My Profile
                        </Link>
                        <Link
                          href="/verification"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs hover:bg-muted/40 transition-colors"
                        >
                          <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                          Verification Status
                        </Link>
                        <hr className="border-border my-1" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-xs text-destructive hover:bg-destructive/5 transition-colors cursor-pointer"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2.5">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="secondary" size="sm">
                    Register Free
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg md:hidden text-muted-foreground hover:bg-muted/50 cursor-pointer"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-md px-4 py-4 space-y-3"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="flex justify-between items-center px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted/30 transition-colors text-foreground"
            >
              <span>{link.label}</span>
              {link.badge ? (
                <span className="px-2 py-0.5 text-xs bg-brand-gold text-brand-navy rounded-full font-bold">
                  {link.badge}
                </span>
              ) : null}
            </Link>
          ))}

          {!currentUser && (
            <div className="pt-4 border-t border-border flex flex-col gap-2.5">
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full">
                  Login
                </Button>
              </Link>
              <Link href="/register" onClick={() => setIsOpen(false)}>
                <Button variant="secondary" className="w-full">
                  Register Free
                </Button>
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </header>
  );
};
