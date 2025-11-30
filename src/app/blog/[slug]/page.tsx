import { getPostData, getSortedPostsData } from "@/lib/posts";
import PostContent from "@/components/PostContent";
import "./page.css";

export async function generateStaticParams() {
    const posts = getSortedPostsData();
    return posts.map((post) => ({
        slug: post.id,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const postData = await getPostData(slug);
    return {
        title: `${postData.title} | Wintery`,
    };
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const postData = await getPostData(slug);

    return (
        <main className="main-container">
            <article className="post-article">
                <header className="post-header">
                    <h1 className="post-title-large">{postData.title}</h1>
                    <div className="post-meta">
                        <time>{postData.date}</time>
                    </div>
                </header>
                <PostContent contentHtml={postData.contentHtml || ""} />
            </article>
        </main>
    );
}
