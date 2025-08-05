// frontend/src/pages/MusicPage.jsx

import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

function MusicPage() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get('songs/');
        setSongs(response.data.results);
        setError(null);
      } catch (err) {
        setError('Không thể tải danh sách nhạc.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  if (loading) return <div>Đang tải nhạc...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Âm Nhạc</h1>
      <div>
        {songs.map(song => (
          <div key={song.id} style={{ border: '1px solid #ccc', margin: '1rem', padding: '1rem' }}>
            <h3>{song.title} - {song.artist}</h3>
            <audio controls src={song.audio_file}>
              Trình duyệt của bạn không hỗ trợ thẻ audio.
            </audio>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MusicPage;