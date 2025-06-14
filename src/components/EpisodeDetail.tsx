import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Pause, Calendar, Clock, ArrowLeft, Share2, Download } from 'lucide-react';
import { Episode, PodcastInfo } from '../types/podcast';
import { fetchRSSFeed, formatDate, formatDuration } from '../utils/rss';

export default function EpisodeDetail() {
  const { id } = useParams<{ id: string }>();
  const [podcast, setPodcast] = useState<PodcastInfo | null>(null);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audio] = useState(new Audio());

  useEffect(() => {
    async function loadEpisode() {
      try {
        const data = await fetchRSSFeed('');
        setPodcast(data.podcast);
        const foundEpisode = data.episodes.find(ep => ep.id === id);
        if (foundEpisode) {
          setEpisode(foundEpisode);
          audio.src = foundEpisode.audioUrl;
        }
      } catch (error) {
        console.error('Failed to load episode:', error);
      } finally {
        setLoading(false);
      }
    }

    loadEpisode();
  }, [id, audio]);

  useEffect(() => {
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audio]);

  const togglePlay = () => {
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">Episode not found</p>
          <Link
            to="/episodes"
            className="text-purple-400 hover:text-purple-300"
          >
            Back to episodes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <div className="relative">
        <div 
          className="h-96 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${episode.imageUrl || podcast?.imageUrl})`,
            filter: 'brightness(0.3)'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 w-full">
            <Link
              to="/episodes"
              className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Episodes
            </Link>
            <div className="flex items-center space-x-2 text-sm text-gray-300 mb-4">
              <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
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
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {episode.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Audio Player */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={togglePlay}
              className="flex-shrink-0 w-12 h-12 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center transition-colors"
            >
              {playing ? (
                <Pause className="h-6 w-6 text-white" />
              ) : (
                <Play className="h-6 w-6 text-white ml-1" />
              )}
            </button>
            
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400 w-12">
                  {formatTime(currentTime)}
                </span>
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                <span className="text-sm text-gray-400 w-12">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Share2 className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Download className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg prose-invert max-w-none">
          <p className="text-xl text-gray-300 leading-relaxed">
            {episode.description}
          </p>
        </div>

        {/* Episode Details */}
        <div className="mt-12 bg-gray-800 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6">Episode Details</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm font-medium text-gray-400">Published</dt>
              <dd className="text-lg text-white">{formatDate(episode.pubDate)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-400">Duration</dt>
              <dd className="text-lg text-white">{formatDuration(episode.duration)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-400">Episode Number</dt>
              <dd className="text-lg text-white">#{episode.episodeNumber}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-400">Season</dt>
              <dd className="text-lg text-white">{episode.season}</dd>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #8B5CF6;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #8B5CF6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}