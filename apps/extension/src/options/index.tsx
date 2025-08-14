import React from 'react';
import ReactDOM from 'react-dom/client';

function Options() {
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1>Bitterwarden Options</h1>
      <p>Settings will be available here in future versions.</p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>
);