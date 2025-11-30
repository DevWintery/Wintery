import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";
import "highlight.js/styles/atom-one-dark.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Wintery",
    description: "Wintery's Development Blog",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Header />
                {children}
                <Footer />
            </body>
        </html>
    );
}