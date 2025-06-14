import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './components/HomePage';
import EpisodeList from './components/EpisodeList';
import EpisodeDetail from './components/EpisodeDetail';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/episodes" element={<EpisodeList />} />
          <Route path="/episode/:id" element={<EpisodeDetail />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;