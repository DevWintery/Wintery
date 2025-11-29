import Link from "next/link";
import { getSortedPostsData } from "@/lib/posts";
import "./page.css";

export default function Home() {
    const allPostsData = getSortedPostsData();

    return (
        <main className="main-container">
            <section className="hero">
                <h1>Wintery</h1>
                <p>A collection of thoughts on software engineering, design, and technology.</p>
            </section>

            <section className="posts-list">
                <h2>Recent Posts</h2>
                <ul>
                    {allPostsData.map(({ id, date, title }) => (
                        <li key={id} className="post-item">
                            <Link href={`/blog/${id}`} className="post-link">
                                <span className="post-date">{date}</span>
                                <h3 className="post-title">{title}</h3>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>
        </main>
    );
}
