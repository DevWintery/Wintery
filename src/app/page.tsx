import Link from "next/link";
import { getSortedPostsData } from "@/lib/posts";
import PostList from "@/components/PostList";
import "./page.css";

export default function Home() {
    const allPostsData = getSortedPostsData();

    return (
        <main className="main-container">
            <section className="hero">
                <h1>Wintery</h1>
                <p>개발하며 얻은 지식들을 보관하는 장소.</p>
            </section>

            <PostList posts={allPostsData} />
        </main>
    );
}
