import Link from "next/link";
import { getSortedPostsData } from "@/lib/posts";
import "./page.css";

export default function Home() {
    const allPostsData = getSortedPostsData();

    return (
        <main className="main-container">
            <section className="hero">
                <h1>Wintery</h1>
                <p>개발하며 얻은 지식들을 보관하는 장소.</p>
                <p>dev.wintery@gmail.com</p>
            </section>

            <section className="posts-list">
                <h2>Recent Posts</h2>

                <div className="categories-list">
                    {Array.from(new Set(allPostsData.map(post => post.category))).map(category => (
                        <span key={category} className="category-tag filter-tag">{category}</span>
                    ))}
                </div>

                <ul>
                    {allPostsData.map(({ id, date, title, category }) => (
                        <li key={id} className="post-item">
                            <Link href={`/blog/${id}`} className="post-link">
                                <div className="post-meta">
                                    <span className="post-date">{date}</span>
                                    <span className="category-tag">{category}</span>
                                </div>
                                <h3 className="post-title">{title}</h3>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>
        </main>
    );
}
