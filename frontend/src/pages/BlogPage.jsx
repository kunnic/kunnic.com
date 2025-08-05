// frontend/src/pages/BlogPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

function BlogPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                const response = await axiosClient.get('posts/');
                setPosts(response.data.results);
                setError(null);
            } catch (err) {
                setError('Đã có lỗi xảy ra khi tải bài viết.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    if (loading) return <div className="text-center">Đang tải bài viết...</div>;
    if (error) return <div className="text-center text-red-500">{error}</div>;

    return (
        <div>
            {/* text-3xl: cỡ chữ nhỏ hơn trên mobile, sm:text-4xl: lớn hơn trên desktop */}
            <h1 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-12 text-center tracking-tight">Suy Tưởng</h1>
            <div className="space-y-10 sm:space-y-12">
                {posts.map(post => (
                    <div key={post.id}>
                        <Link to={`/posts/${post.slug}`}>
                            {/* text-2xl sm:text-3xl */}
                            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 hover:text-blue-600 transition-colors">{post.title}</h2>
                        </Link>
                        {/* ... */}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BlogPage;