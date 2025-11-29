import Link from "next/link";
import "./Header.css";

export default function Header() {
    return (
        <header className="header">
            <div className="header-container">
                <Link href="/" className="logo">
                    Wintery
                </Link>
                <nav className="nav">
                    <Link href="/" className="nav-link">
                        Home
                    </Link>
                    <Link href="/about" className="nav-link">
                        About
                    </Link>
                </nav>
            </div>
        </header>
    );
}
