import React, { useState } from 'react';

function LinkYouTubeVideo() {
  const [videoId, setVideoId] = useState('');

  const handleChange = (e) => {
    setVideoId(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const response = await fetch('/link-youtube-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ videoId }),
    });

    if (response.ok) {
      alert('Video erfolgreich verknüpft');
    } else {
      alert('Fehler beim Verknüpfen des Videos');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={videoId}
        onChange={handleChange}
        placeholder="YouTube Video ID"
      />
      <button type="submit">Verknüpfen</button>
    </form>
  );
}

export default LinkYouTubeVideo;

