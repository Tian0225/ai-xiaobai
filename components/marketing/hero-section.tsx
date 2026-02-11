"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  "500元/年用真 Claude（稳定不封号）",
  "御三家模型（Claude/GPT/Gemini）协同使用",
  "会员每月最新教程（Agent Teams、Clawdbot...）+ 专属群",
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center">
          {/* Badge */}
          <div className="mb-8 flex justify-center">
            <Badge variant="secondary" className="px-4 py-1.5">
              🎉 真实经验 · 避坑指南 · 实战项目
            </Badge>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
            <span className="block mb-2">🧘 小白学 AI，不焦虑</span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl max-w-2xl mx-auto">
            从零开始掌握 Claude Code
            <br />
            <span className="font-semibold text-gray-900">
              真实经验 · 避坑指南 · 实战项目
            </span>
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <Button size="lg" className="text-base px-8" asChild>
              <Link href="/guide">
                开始学习 <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8" asChild>
              <Link href="/guide/opus-proxy-guide">查看省钱方案</Link>
            </Button>
          </div>

          {/* Features List */}
          <div className="mt-12 space-y-3 text-left max-w-2xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          {/* Social Proof */}
          <p className="mt-12 text-sm text-gray-500">
            已有 <span className="font-semibold text-gray-900">1000+</span> 小白成功入门 AI 开发
          </p>
        </div>
      </div>

      {/* Gradient Orbs (decorative) */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
      </div>
    </section>
  );
}
