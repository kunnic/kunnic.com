// frontend/src/pages/PostDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Hook để lấy tham số từ URL
import axiosClient from '../api/axiosClient';

function PostDetailPage() {
  const { slug } = useParams(); // Lấy giá trị 'slug' từ URL, ví dụ: /posts/bai-viet-dau-tien
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        // Gọi API đến endpoint chi tiết, ví dụ: 'posts/bai-viet-dau-tien/'
        const response = await axiosClient.get(`posts/${slug}/`);
        setPost(response.data);
        setError(null);
      } catch (err) {
        setError('Không thể tải được bài viết. Có thể URL không đúng.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]); // useEffect sẽ chạy lại mỗi khi 'slug' trên URL thay đổi

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;
  if (!post) return <div>Không tìm thấy bài viết.</div>;

  return (
    <article className="max-w-3xl mx-auto">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{post.title}</h1>
      <p className="text-gray-500 mt-4 mb-8">
        <em>Tác giả: {post.author.username} | Ngày đăng: {new Date(post.published_date).toLocaleDateString()}</em>
      </p>
      {/* prose: một lớp của Tailwind giúp tự động style các đoạn văn bản, heading... rất đẹp */}
      <div className="prose lg:prose-xl max-w-none">
        {post.content}
      </div>
    </article>
  );
}

export default PostDetailPage;