"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "首页", href: "/" },
  { name: "教程", href: "/guide" },
  { name: "会员", href: "/membership" },
  { name: "商城", href: "/shop" },
  { name: "企业服务", href: "/enterprise" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "px-3 pt-3 sm:px-6"
          : "px-0 pt-0"
      )}
    >
      <nav
        className={cn(
          "mx-auto max-w-7xl transition-all duration-300",
          scrolled
            ? "surface-glass rounded-2xl px-4 sm:px-6 lg:px-8"
            : "px-4 sm:px-6 lg:px-8"
        )}
      >
        <div className="flex h-[4.5rem] items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[linear-gradient(135deg,#0d3b3a,#3a7d6b)] text-white grid place-items-center text-lg font-display shadow-sm">
              AI
            </div>
            <div>
              <p className="font-display text-lg leading-tight text-[var(--brand-ink)]">AI-xiaobai</p>
              <p className="text-xs text-slate-500">小白学 AI，不焦虑</p>
            </div>
          </Link>

          <div className="hidden md:flex md:items-center md:space-x-7">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-slate-700 transition-colors hover:text-[var(--brand-fresh)]"
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-600 gap-2 rounded-full"
              onClick={() => {
                document.dispatchEvent(
                  new KeyboardEvent('keydown', {
                    key: 'k',
                    metaKey: true,
                  })
                )
              }}
            >
              <Search className="h-4 w-4" />
              <span className="text-xs border rounded px-1.5 py-0.5 border-slate-300">⌘K</span>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth">登录</Link>
            </Button>
            <Button size="sm" className="rounded-full bg-[linear-gradient(120deg,#0d3b3a,#3a7d6b)] hover:opacity-95" asChild>
              <Link href="/guide">
                开始学习
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <button
            type="button"
            className="md:hidden rounded-md p-2 text-slate-700 hover:bg-white/70"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="sr-only">打开菜单</span>
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 reveal-up">
            <div className="space-y-1 surface-glass rounded-2xl p-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-white/80 rounded-xl"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="mt-4 space-y-2 px-3">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/auth">登录</Link>
              </Button>
              <Button className="w-full bg-[linear-gradient(120deg,#0d3b3a,#3a7d6b)] hover:opacity-95" asChild>
                <Link href="/guide">
                  开始学习
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
