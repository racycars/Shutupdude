import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Calendar, Clock, ArrowRight } from 'lucide-react';
import { Episode, PodcastInfo } from '../types/podcast';
import { fetchRSSFeed, formatDate, formatDuration } from '../utils/rss';

export default function HomePage() {
  const [podcast, setPodcast] = useState<PodcastInfo | null>(null);
  const [latestEpisodes, setLatestEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPodcastData() {
      try {
        const data = await fetchRSSFeed('');
        setPodcast(data.podcast);
        setLatestEpisodes(data.episodes.slice(0, 3));
      } catch (error) {
        console.error('Failed to load podcast data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPodcastData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!podcast) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Failed to load podcast data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div 
          className="h-96 bg-cover bg-center"
          style={{ backgroundImage: `url(${podcast.imageUrl})` }}
        ></div>
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
              {podcast.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              {podcast.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/episodes"
                className="inline-flex items-center px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Play className="h-5 w-5 mr-2" />
                Listen Now
              </Link>
              <button className="inline-flex items-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-gray-900 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Episodes */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold text-white">Latest Episodes</h2>
            <Link
              to="/episodes"
              className="inline-flex items-center text-purple-400 hover:text-purple-300 font-medium"
            >
              View all episodes
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {latestEpisodes.map((episode) => (
              <Link
                key={episode.id}
                to={`/episode/${episode.id}`}
                className="group"
              >
                <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={episode.imageUrl || podcast.imageUrl}
                      alt={episode.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(episode.pubDate)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDuration(episode.duration)}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-400 transition-colors">
                      {episode.title}
                    </h3>
                    <p className="text-gray-300 line-clamp-3">
                      {episode.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">About the Show</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join us every week as we dive into the most ridiculous debates, share hot takes that nobody asked for, 
            and somehow make everything about food. Warning: Contains excessive laughter and questionable opinions.
          </p>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-3xl font-bold text-purple-400 mb-2">50+</div>
              <div className="text-gray-300">Episodes</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-orange-400 mb-2">100K+</div>
              <div className="text-gray-300">Downloads</div>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-blue-400 mb-2">Weekly</div>
              <div className="text-gray-300">New Episodes</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}