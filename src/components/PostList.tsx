"use client";

import { useState } from "react";
import Link from "next/link";
import { PostData } from "@/lib/posts";
import "./PostList.css";

interface PostListProps {
    posts: PostData[];
}

export default function PostList({ posts }: PostListProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const categories = Array.from(new Set(posts.flatMap((post) => {
        if (post.categories) return post.categories;
        if (post.category) return [post.category];
        return [];
    })));

    const filteredPosts = selectedCategory
        ? posts.filter((post) => {
            if (post.categories) return post.categories.includes(selectedCategory);
            return post.category === selectedCategory;
        })
        : posts;

    const toggleCategory = (category: string) => {
        setSelectedCategory((prev) => (prev === category ? null : category));
    };

    return (
        <section className="posts-list">
            <h2>Recent Posts</h2>

            <div className="categories-list">
                <button
                    className={`category-tag filter-tag ${selectedCategory === null ? "active" : ""}`}
                    onClick={() => setSelectedCategory(null)}
                >
                    All
                </button>
                {categories.map((category) => (
                    <button
                        key={category}
                        className={`category-tag filter-tag ${selectedCategory === category ? "active" : ""}`}
                        onClick={() => toggleCategory(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <ul>
                {filteredPosts.map(({ id, date, title, category, categories }) => {
                    const displayCategories = categories || (category ? [category] : []);
                    return (
                        <li key={id} className="post-item">
                            <Link href={`/blog/${id}`} className="post-link">
                                <div className="post-meta">
                                    <span className="post-date">{date}</span>
                                    {displayCategories.length > 0 ? (
                                        displayCategories.map((cat: string) => (
                                            <span key={cat} className="category-tag">{cat}</span>
                                        ))
                                    ) : (
                                        <span className="category-tag">General</span>
                                    )}
                                </div>
                                <h3 className="post-title">{title}</h3>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
