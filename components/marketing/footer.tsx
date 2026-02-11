import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { ArrowUpRight } from "lucide-react";

const footerLinks = {
  product: [
    { name: "免费教程", href: "/guide" },
    { name: "会员服务", href: "/membership" },
    { name: "企业服务", href: "/enterprise" },
  ],
  resources: [
    { name: "省钱方案", href: "/guide/opus-proxy-guide" },
    { name: "服务商城", href: "/shop" },
  ],
  community: [
    { name: "GitHub", href: "https://github.com/Tian0225/ai-xiaobai" },
  ],
};

export default function Footer() {
  return (
    <footer className="pt-20">
      <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="surface-card rounded-3xl border border-[#d8e6df] p-8 sm:p-10">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="inline-flex items-center gap-2">
                <span className="font-display text-2xl text-[var(--brand-ink)]">AI-xiaobai</span>
              </Link>
              <p className="mt-4 text-sm text-slate-600">
                小白学 AI，不焦虑
                <br />
                真实经验 · 避坑指南 · 实战项目
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900">产品</h3>
              <ul className="mt-4 space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-600 transition-colors hover:text-[var(--brand-fresh)]"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900">资源</h3>
              <ul className="mt-4 space-y-3">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-600 transition-colors hover:text-[var(--brand-fresh)]"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900">社区</h3>
              <ul className="mt-4 space-y-3">
                {footerLinks.community.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="inline-flex items-center gap-1 text-sm text-slate-600 transition-colors hover:text-[var(--brand-fresh)]"
                    >
                      {link.name}
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Separator className="my-8 bg-[#d6e4dd]" />

          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-slate-600">
              由金田和 Claude Code 共同打造
            </p>
            <p className="text-sm text-slate-600">
              © {new Date().getFullYear()} AI-xiaobai. MIT License
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
