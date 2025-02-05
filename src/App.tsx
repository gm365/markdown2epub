import React from 'react';
import MarkdownToEpub from './components/MarkdownToEpub';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="w-full bg-white shadow-sm py-6 mb-8">
        <div className="container max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            Free Markdown to EPUB Converter
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <MarkdownToEpub />
      </main>

      {/* Footer */}
      <footer className="w-full bg-white shadow-sm py-4 mt-8">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <a 
            href="https://x.com/gm365" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Created by @gm365
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;