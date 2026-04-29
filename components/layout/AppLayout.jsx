import React from 'react';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      {/* This is where your app content will actually show up */}
      <main>
        {children}
      </main>
    </div>
  );
}
