// frontend/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { LanguageProvider } from './i18n';

import './index.css';

// Import Layout and Desktop
import Layout from './components/Layout';
import Desktop from './components/Desktop/Desktop';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />, // Main layout with desktop interface
    children: [
      {
        index: true, // Default route ('/') shows desktop
        element: <Desktop />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <RouterProvider router={router} />
    </LanguageProvider>
  </React.StrictMode>
);