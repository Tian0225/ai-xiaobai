"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X, Search, ArrowRight, ChevronDown, LayoutDashboard, LogOut, UserCircle2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const navigation = [
  { name: "首页", href: "/" },
  { name: "教程", href: "/guide" },
  { name: "会员", href: "/membership" },
  { name: "代币", href: "/tokens" },
  { name: "商城", href: "/shop" },
  { name: "企业服务", href: "/enterprise" },
];

interface CurrentUser {
  email: string;
  isAdmin: boolean;
  tokenBalance: number;
}

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [loadingUser, setLoadingUser] = React.useState(true);
  const [currentUser, setCurrentUser] = React.useState<CurrentUser | null>(null);
  const [accountOpen, setAccountOpen] = React.useState(false);
  const [supabase] = React.useState(() => createClient());
  const accountMenuRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const loadCurrentUser = React.useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setCurrentUser(null);
        return;
      }

      setCurrentUser(payload.user ?? null);
    } catch {
      setCurrentUser(null);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  React.useEffect(() => {
    let active = true;

    if (active) {
      void loadCurrentUser();
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      setLoadingUser(true);
      void loadCurrentUser();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadCurrentUser, supabase]);

  React.useEffect(() => {
    if (!accountOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [accountOpen]);

  const handleSignOut = async () => {
    setAccountOpen(false);
    setIsOpen(false);
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const emailPrefix = currentUser?.email?.split("@")[0] ?? "用户";
  const avatarLabel = emailPrefix.slice(0, 1).toUpperCase();

  return (
    <header
      className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-300", scrolled ? "px-3 pt-3 sm:px-6" : "px-0 pt-0")}
    >
      <nav
        className={cn(
          "mx-auto max-w-7xl transition-all duration-300",
          scrolled ? "surface-glass rounded-2xl px-4 sm:px-6 lg:px-8" : "px-4 sm:px-6 lg:px-8"
        )}
      >
        <div className="flex h-[4.5rem] items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[linear-gradient(135deg,#0d3b3a,#3a7d6b)] text-lg text-white shadow-sm">
              AI
            </div>
            <div>
              <p className="font-display text-lg leading-tight text-[var(--brand-ink)]">AI-xiaobai</p>
              <p className="text-xs text-slate-500">小白学 AI，不焦虑</p>
            </div>
          </Link>

          <div className="hidden items-center space-x-7 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "text-[var(--brand-fresh)]"
                    : "text-slate-700 hover:text-[var(--brand-fresh)]"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden items-center space-x-4 md:flex">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 rounded-full text-slate-600"
              onClick={() => {
                document.dispatchEvent(
                  new KeyboardEvent("keydown", {
                    key: "k",
                    metaKey: true,
                  })
                );
              }}
            >
              <Search className="h-4 w-4" />
              <span className="rounded border border-slate-300 px-1.5 py-0.5 text-xs">⌘K</span>
            </Button>

            {loadingUser ? (
              <div className="h-9 w-32 animate-pulse rounded-full bg-[#d7e5df]" />
            ) : currentUser ? (
              <div className="relative" ref={accountMenuRef}>
                <button
                  type="button"
                  onClick={() => setAccountOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-full border border-[#c7ddd5] bg-white/80 px-2 py-1.5 transition hover:border-[var(--brand-fresh)]"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[#e3f0eb] text-xs font-semibold text-[var(--brand-fresh)]">
                    {avatarLabel}
                  </span>
                  <span className="max-w-[98px] truncate text-sm text-slate-700">{emailPrefix}</span>
                  <ChevronDown className={cn("h-4 w-4 text-slate-500 transition", accountOpen && "rotate-180")} />
                </button>

                {accountOpen && (
                  <div className="absolute right-0 top-12 w-64 rounded-2xl border border-[#c7ddd5] bg-white p-3 shadow-[0_24px_48px_-30px_rgba(13,59,58,0.55)]">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">已登录账号</p>
                    <p className="mt-1 truncate text-sm font-medium text-slate-800">{currentUser.email}</p>
                    <p className="mt-2 text-xs text-slate-500">代币余额</p>
                    <p className="text-sm font-semibold text-[var(--brand-fresh)]">{currentUser.tokenBalance}</p>

                    <div className="mt-3 space-y-1 border-t border-[#dce8e3] pt-3">
                      <Link
                        href="/membership"
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-[#edf7f2]"
                        onClick={() => setAccountOpen(false)}
                      >
                        <UserCircle2 className="h-4 w-4" />
                        会员中心
                      </Link>
                      <Link
                        href="/tokens"
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-[#edf7f2]"
                        onClick={() => setAccountOpen(false)}
                      >
                        <UserCircle2 className="h-4 w-4" />
                        代币中心
                      </Link>
                      {currentUser.isAdmin && (
                        <Link
                          href="/admin/orders"
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 transition hover:bg-[#edf7f2]"
                          onClick={() => setAccountOpen(false)}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          管理后台
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50"
                      >
                        <LogOut className="h-4 w-4" />
                        退出登录
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth">登录</Link>
                </Button>
                <Button size="sm" className="rounded-full bg-[linear-gradient(120deg,#0d3b3a,#3a7d6b)] hover:opacity-95" asChild>
                  <Link href="/guide">
                    开始学习
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {loadingUser ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-[#d7e5df]" />
            ) : currentUser ? (
              <button
                type="button"
                className="grid h-8 w-8 place-items-center rounded-full border border-[#c7ddd5] bg-white/80 text-xs font-semibold text-[var(--brand-fresh)]"
                onClick={() => setIsOpen(true)}
                aria-label="打开账号菜单"
              >
                {avatarLabel}
              </button>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth">登录</Link>
              </Button>
            )}
            <button
              type="button"
              className="rounded-md p-2 text-slate-700 hover:bg-white/70"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className="sr-only">打开菜单</span>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="reveal-up py-4 md:hidden">
            <div className="surface-glass space-y-1 rounded-2xl p-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "block rounded-xl px-3 py-2 text-base font-medium hover:bg-white/80",
                    pathname === item.href ? "bg-white text-[var(--brand-fresh)]" : "text-slate-700"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="mt-4 space-y-2 px-3">
              {loadingUser ? (
                <div className="h-10 w-full animate-pulse rounded-full bg-[#d7e5df]" />
              ) : currentUser ? (
                <>
                  <div className="rounded-2xl border border-[#d8e6df] bg-white/85 p-3">
                    <p className="text-xs text-slate-500">当前账号</p>
                    <p className="mt-1 truncate text-sm text-slate-700">{currentUser.email}</p>
                    <p className="mt-2 text-xs text-slate-500">代币余额</p>
                    <p className="text-sm font-semibold text-[var(--brand-fresh)]">{currentUser.tokenBalance}</p>
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/membership" onClick={() => setIsOpen(false)}>
                      会员中心
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/tokens" onClick={() => setIsOpen(false)}>
                      代币中心
                    </Link>
                  </Button>
                  {currentUser.isAdmin && (
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/admin/orders" onClick={() => setIsOpen(false)}>
                        管理后台
                      </Link>
                    </Button>
                  )}
                  <Button variant="ghost" className="w-full text-rose-600 hover:text-rose-700" onClick={handleSignOut}>
                    退出登录
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/auth">登录</Link>
                  </Button>
                  <Button className="w-full bg-[linear-gradient(120deg,#0d3b3a,#3a7d6b)] hover:opacity-95" asChild>
                    <Link href="/guide">
                      开始学习
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
