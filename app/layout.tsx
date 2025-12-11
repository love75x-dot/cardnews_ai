import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 카드뉴스 메이커 - 쉽고 빠른 카드뉴스 제작 도구",
  description: "AI 기술로 몇 초 만에 전문적인 카드뉴스를 만들어보세요. 직관적인 인터페이스로 누구나 쉽게 사용할 수 있습니다.",
  keywords: ["카드뉴스", "카드뉴스 제작", "AI 카드뉴스", "콘텐츠 제작", "SNS 마케팅", "인스타그램", "블로그"],
  authors: [{ name: "AI Card Maker Team" }],
  creator: "AI Card Maker",
  publisher: "AI Card Maker",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    title: "AI 카드뉴스 메이커",
    description: "AI 기술로 몇 초 만에 전문적인 카드뉴스를 만들어보세요",
    siteName: "AI 카드뉴스 메이커",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI 카드뉴스 메이커 - 쉽고 빠른 카드뉴스 제작",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI 카드뉴스 메이커",
    description: "AI 기술로 몇 초 만에 전문적인 카드뉴스를 만들어보세요",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
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
      </body>
    </html>
  );
}
