/*
 * @Author: JavaPub
 * @Date: 2025-03-22 17:58:01
 * @LastEditors: your name
 * @LastEditTime: 2025-03-22 18:03:52
 * @Description: Here is the JavaPub code base. Search JavaPub on the whole web.
 * @FilePath: /web01/src/app/layout.tsx
 */
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "纸张模板库 - 在线打印各种纸张模板",
  description: "免费在线纸张模板库，提供横线纸、方格纸、点阵纸、乐谱纸等多种模板，支持自定义和PDF导出",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
