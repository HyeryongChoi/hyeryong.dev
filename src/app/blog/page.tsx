import BlogListClient from "@/components/blog/BlogListClient";
import { getAllPosts } from "@/lib/posts";

export default function BlogPage() {
  return <BlogListClient posts={getAllPosts()} />;
}
