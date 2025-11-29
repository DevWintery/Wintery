import "./Footer.css";

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">
                <p suppressHydrationWarning={true}>&copy; {new Date().getFullYear()} Wintery. All rights reserved.</p>
            </div>
        </footer>
    );
}
