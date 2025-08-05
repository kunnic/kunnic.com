// frontend/src/pages/GalleryPage.jsx

import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

function GalleryPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get('gallery/');
        setImages(response.data.results);
        setError(null);
      } catch (err) {
        setError('Không thể tải thư viện ảnh.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  if (loading) return <div>Đang tải ảnh...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Thần Tượng</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
        {images.map(image => (
          <div key={image.id}>
            <img
              src={image.image}
              alt={image.caption}
              style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
            />
            <p>{image.caption}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GalleryPage;