import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { getAllTutorials } from "@/lib/mdx";
import SearchDialog from "@/components/search/search-dialog";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "AI-xiaobai - 小白学AI不焦虑",
  description: "从零开始掌握 Claude Code，真实经验·避坑指南·实战项目。500元/年用真 Claude，御三家模型协同使用。",
  keywords: ["Claude Code", "AI教程", "小白学AI", "省钱方案", "实战项目"],
  authors: [{ name: "金田" }],
  creator: "金田",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://ai-xiaobai.com",
    title: "AI-xiaobai - 小白学AI不焦虑",
    description: "从零开始掌握 Claude Code，真实经验·避坑指南·实战项目",
    siteName: "AI-xiaobai",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 服务端读取教程数据，传入搜索组件
  const tutorials = getAllTutorials().map(t => ({
    slug: t.slug,
    title: t.title,
    description: t.description,
    difficulty: t.difficulty,
    tags: t.tags,
  }))

  return (
    <html lang="zh-CN" className="scroll-smooth">
      <body className={cn(inter.variable, "font-sans antialiased")}>
        {children}
        <SearchDialog tutorials={tutorials} />
      </body>
    </html>
  );
}

