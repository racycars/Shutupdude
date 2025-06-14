import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Calendar, Clock, Search } from 'lucide-react';
import { Episode, PodcastInfo } from '../types/podcast';
import { fetchRSSFeed, formatDate, formatDuration } from '../utils/rss';

export default function EpisodeList() {
  const [podcast, setPodcast] = useState<PodcastInfo | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [filteredEpisodes, setFilteredEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadPodcastData() {
      try {
        const data = await fetchRSSFeed('');
        setPodcast(data.podcast);
        setEpisodes(data.episodes);
        setFilteredEpisodes(data.episodes);
      } catch (error) {
        console.error('Failed to load podcast data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPodcastData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = episodes.filter(episode =>
        episode.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        episode.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEpisodes(filtered);
    } else {
      setFilteredEpisodes(episodes);
    }
  }, [searchTerm, episodes]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">All Episodes</h1>
          <p className="text-gray-400 text-lg">
            Dive into our complete collection of episodes
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search episodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>
        </div>

        {/* Episodes Grid */}
        <div className="space-y-6">
          {filteredEpisodes.map((episode, index) => (
            <div
              key={episode.id}
              className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-colors"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Episode Image */}
                <div className="flex-shrink-0">
                  <img
                    src={episode.imageUrl || podcast?.imageUrl}
                    alt={episode.title}
                    className="w-full md:w-32 h-32 object-cover rounded-lg"
                  />
                </div>

                {/* Episode Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
                        <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium">
                          Episode {episode.episodeNumber}
                        </span>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(episode.pubDate)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDuration(episode.duration)}
                        </div>
                      </div>
                      <Link
                        to={`/episode/${episode.id}`}
                        className="group"
                      >
                        <h2 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-400 transition-colors">
                          {episode.title}
                        </h2>
                      </Link>
                    </div>
                  </div>

                  <p className="text-gray-300 mb-4 line-clamp-2">
                    {episode.description}
                  </p>

                  <div className="flex items-center space-x-4">
                    <Link
                      to={`/episode/${episode.id}`}
                      className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Play Episode
                    </Link>
                    <Link
                      to={`/episode/${episode.id}`}
                      className="text-purple-400 hover:text-purple-300 font-medium"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredEpisodes.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              No episodes found matching "{searchTerm}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}