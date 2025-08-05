// frontend/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import './index.css';

// Import Layout và các trang
import Layout from './components/Layout';
import BlogPage from './pages/BlogPage';
import PostDetailPage from './pages/PostDetailPage';
import MusicPage from './pages/MusicPage';
import GalleryPage from './pages/GalleryPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />, // Sử dụng Layout làm route cha
    children: [ // Các route con sẽ được render bên trong <Outlet />
      {
        index: true, // Route mặc định ('/')
        element: <BlogPage />,
      },
      {
        path: 'posts/:slug',
        element: <PostDetailPage />,
      },
      {
        path: 'music',
        element: <MusicPage />,
      },
      {
        path: 'gallery',
        element: <GalleryPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);