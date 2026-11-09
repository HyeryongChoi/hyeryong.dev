import BlogPostClient from "@/components/blog/BlogPostClient";
import { getAllPosts } from "@/lib/posts";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ id: post.id }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const posts = getAllPosts();
  const index = posts.findIndex((p) => p.id === id);

  return (
    <BlogPostClient
      post={index >= 0 ? posts[index] : null}
      previousId={index > 0 ? posts[index - 1].id : null}
      nextId={index >= 0 && index < posts.length - 1 ? posts[index + 1].id : null}
      currentIndex={index}
      totalCount={posts.length}
    />
  );
}
