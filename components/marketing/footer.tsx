import Link from "next/link";
import { Separator } from "@/components/ui/separator";

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
    <footer className="bg-gray-50 border-t">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-xl font-bold text-gradient">
              🧘 AI-xiaobai
            </Link>
            <p className="mt-4 text-sm text-gray-600">
              小白学AI不焦虑
              <br />
              真实经验 · 避坑指南
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">产品</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">资源</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">社区</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-600">
            由金田和 Claude Code 共同打造
          </p>
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} AI-xiaobai. MIT License
          </p>
        </div>
      </div>
    </footer>
  );
}
