"use client";

import { useEffect, useRef } from "react";
import "./PostContent.css";

interface PostContentProps {
    contentHtml: string;
}

export default function PostContent({ contentHtml }: PostContentProps) {
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!contentRef.current) return;

        const preElements = contentRef.current.querySelectorAll("pre");

        preElements.forEach((pre) => {
            // Check if button already exists to prevent duplicates
            if (pre.querySelector(".copy-button")) return;

            const button = document.createElement("button");
            button.className = "copy-button";
            button.textContent = "Copy";
            button.ariaLabel = "Copy code to clipboard";

            button.addEventListener("click", async () => {
                const code = pre.querySelector("code")?.innerText || pre.innerText;
                try {
                    await navigator.clipboard.writeText(code);
                    button.textContent = "Copied!";
                    button.classList.add("copied");
                    setTimeout(() => {
                        button.textContent = "Copy";
                        button.classList.remove("copied");
                    }, 2000);
                } catch (err) {
                    console.error("Failed to copy:", err);
                    button.textContent = "Error";
                }
            });

            pre.style.position = "relative";
            pre.appendChild(button);
        });
    }, [contentHtml]);

    return (
        <div
            ref={contentRef}
            className="post-content"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
    );
}
