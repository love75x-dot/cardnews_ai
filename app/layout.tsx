import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "AI 카드뉴스 생성기 - 클릭 한 번으로 전문가급 콘텐츠 제작",
  description: "AI 기술로 단 몇 초 만에 전문적인 카드뉴스를 만들어보세요. Gemini 2.0과 Imagen 3를 활용한 고품질 콘텐츠 자동 생성. SNS, 블로그, 마케팅에 최적화된 다양한 스타일 제공.",
  keywords: [
    "카드뉴스", 
    "카드뉴스 제작", 
    "AI 카드뉴스", 
    "콘텐츠 제작", 
    "SNS 마케팅", 
    "인스타그램", 
    "블로그",
    "이미지 생성",
    "AI 디자인",
    "자동 생성",
    "Gemini",
    "Imagen"
  ],
  authors: [{ name: "카드뉴스 생성기 팀" }],
  creator: "AI 카드뉴스 생성기",
  publisher: "AI 카드뉴스 생성기",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://cardnews-ai.vercel.app'),
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    title: "AI 카드뉴스 생성기 - 클릭 한 번으로 전문가급 콘텐츠 제작",
    description: "AI 기술로 단 몇 초 만에 전문적인 카드뉴스를 만들어보세요. 5가지 스타일, 고품질 이미지 자동 생성",
    siteName: "AI 카드뉴스 생성기",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI 카드뉴스 생성기 - 클릭 한 번으로 전문가급 콘텐츠 제작",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI 카드뉴스 생성기 - 클릭 한 번으로 전문가급 콘텐츠",
    description: "AI로 단 몇 초 만에 전문적인 카드뉴스 제작. 5가지 스타일 지원",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'icon', url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'icon', url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
