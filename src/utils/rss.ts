import { Episode, PodcastInfo } from '../types/podcast';

// CORS proxy for RSS feed access
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const RSS_FEED_URL = 'https://media.zencast.fm/episode-1-1052053/rss';

export async function fetchRSSFeed(url: string = RSS_FEED_URL): Promise<{ podcast: PodcastInfo; episodes: Episode[] }> {
  try {
    const response = await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const xmlText = await response.text();
    
    if (!xmlText || xmlText.trim() === '') {
      throw new Error('Empty RSS feed response');
    }
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Check for XML parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('Invalid XML format');
    }
    
    // Try to find channel element with different selectors
    let channel = xmlDoc.querySelector('channel');
    if (!channel) {
      channel = xmlDoc.querySelector('rss channel');
    }
    if (!channel) {
      channel = xmlDoc.querySelector('feed'); // Atom feed support
    }
    if (!channel) {
      // If it's a single episode feed, treat the root as the channel
      channel = xmlDoc.documentElement;
    }
    
    if (!channel) {
      console.warn('No channel element found, using fallback data');
      throw new Error('Invalid RSS feed format - no channel found');
    }
    
    // Extract podcast information with fallbacks
    const getTextContent = (selector: string, fallback: string = '') => {
      const element = channel!.querySelector(selector);
      return element?.textContent?.trim() || fallback;
    };
    
    const getAttribute = (selector: string, attr: string, fallback: string = '') => {
      const element = channel!.querySelector(selector);
      return element?.getAttribute(attr) || fallback;
    };
    
    const podcast: PodcastInfo = {
      title: getTextContent('title') || 'Shut Up Dude',
      description: getTextContent('description') || 
                  getTextContent('itunes\\:summary') || 
                  getTextContent('summary') ||
                  'A hilarious podcast where friends debate everything.',
      imageUrl: getAttribute('image url', 'href') || 
                getAttribute('itunes\\:image', 'href') ||
                getAttribute('image', 'href') ||
                'https://images.pexels.com/photos/4792509/pexels-photo-4792509.jpeg?auto=compress&cs=tinysrgb&w=800',
      author: getTextContent('itunes\\:author') || 
              getTextContent('managingEditor') || 
              getTextContent('author') ||
              'The Dudes',
      category: getAttribute('itunes\\:category', 'text') || 
                getTextContent('category') ||
                'Comedy',
      language: getTextContent('language') || 'en-US',
      link: getTextContent('link') || 'https://shutupdude.podcast.com'
    };
    
    // Extract episodes with better error handling
    const items = channel.querySelectorAll('item, entry'); // Support both RSS and Atom
    const episodes: Episode[] = [];
    
    if (items.length === 0) {
      console.warn('No episodes found in feed, using mock data');
    }
    
    Array.from(items).forEach((item, index) => {
      try {
        const enclosure = item.querySelector('enclosure');
        const itunesImage = item.querySelector('itunes\\:image');
        const guid = getTextContent.call({ querySelector: (s: string) => item.querySelector(s) }, 'guid') || 
                    getTextContent.call({ querySelector: (s: string) => item.querySelector(s) }, 'id') || 
                    `episode-${index + 1}`;
        
        const episode: Episode = {
          id: guid.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase(),
          title: getTextContent.call({ querySelector: (s: string) => item.querySelector(s) }, 'title') || 
                `Episode ${index + 1}`,
          description: getTextContent.call({ querySelector: (s: string) => item.querySelector(s) }, 'description') || 
                      getTextContent.call({ querySelector: (s: string) => item.querySelector(s) }, 'itunes\\:summary') || 
                      getTextContent.call({ querySelector: (s: string) => item.querySelector(s) }, 'summary') ||
                      'No description available',
          pubDate: getTextContent.call({ querySelector: (s: string) => item.querySelector(s) }, 'pubDate') || 
                  getTextContent.call({ querySelector: (s: string) => item.querySelector(s) }, 'published') ||
                  new Date().toISOString(),
          duration: getTextContent.call({ querySelector: (s: string) => item.querySelector(s) }, 'itunes\\:duration') || '00:00',
          audioUrl: enclosure?.getAttribute('url') || 
                   getAttribute.call({ querySelector: (s: string) => item.querySelector(s) }, 'link[type*="audio"]', 'href') ||
                   '',
          imageUrl: getAttribute.call({ querySelector: (s: string) => item.querySelector(s) }, 'itunes\\:image', 'href') || 
                   podcast.imageUrl,
          episodeNumber: parseInt(getTextContent.call({ querySelector: (s: string) => item.querySelector(s) }, 'itunes\\:episode') || `${index + 1}`),
          season: parseInt(getTextContent.call({ querySelector: (s: string) => item.querySelector(s) }, 'itunes\\:season') || '1')
        };
        
        episodes.push(episode);
      } catch (episodeError) {
        console.warn(`Failed to parse episode ${index + 1}:`, episodeError);
        // Continue with other episodes
      }
    });
    
    // If we got podcast info but no episodes, still return the podcast info
    return { 
      podcast, 
      episodes: episodes.length > 0 ? episodes : mockEpisodes 
    };
    
  } catch (error) {
    console.error('Failed to fetch RSS feed:', error);
    
    // Provide more specific error information
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error - check CORS proxy and feed URL');
    }
    
    // Fallback to mock data if RSS fetch fails
    return {
      podcast: mockPodcastInfo,
      episodes: mockEpisodes
    };
  }
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Unknown Date';
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return 'Unknown Date';
  }
}

export function formatDuration(duration: string): string {
  // Handle different duration formats (seconds, MM:SS, HH:MM:SS)
  if (!duration || duration === '00:00') return 'Unknown';
  
  try {
    // If it's just a number (seconds)
    if (/^\d+$/.test(duration)) {
      const totalSeconds = parseInt(duration);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      } else {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
    }
    
    // If it's already in MM:SS or HH:MM:SS format
    return duration;
  } catch (error) {
    return 'Unknown';
  }
}

// Mock data as fallback
export const mockPodcastInfo: PodcastInfo = {
  title: "Shut Up Dude",
  description: "A hilarious podcast where friends debate everything from conspiracy theories to pop culture, all while trying to out-roast each other. No topic is too weird, no argument too petty.",
  imageUrl: "https://images.pexels.com/photos/4792509/pexels-photo-4792509.jpeg?auto=compress&cs=tinysrgb&w=800",
  author: "The Dudes",
  category: "Comedy",
  language: "en-US",
  link: "https://shutupdude.podcast.com"
};

export const mockEpisodes: Episode[] = [
  {
    id: "001",
    title: "Is Cereal Soup? The Great Food Classification Debate",
    description: "The dudes dive deep into the age-old question: Is cereal soup? What about hot dogs and sandwiches? This episode gets heated as we classify every food known to mankind. Featuring special guest appearances from our fridges.",
    pubDate: "2024-01-15T10:00:00Z",
    duration: "45:23",
    audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    imageUrl: "https://images.pexels.com/photos/5946620/pexels-photo-5946620.jpeg?auto=compress&cs=tinysrgb&w=400",
    episodeNumber: 1,
    season: 1
  },
  {
    id: "002",
    title: "Why Pineapple on Pizza is Actually a Government Conspiracy",
    description: "We uncover the truth behind the pineapple pizza controversy. Spoiler alert: Big Pineapple has been pulling the strings all along. Plus, we rank every pizza topping from best to 'why does this exist?'",
    pubDate: "2024-01-08T10:00:00Z",
    duration: "52:17",
    audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    imageUrl: "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=400",
    episodeNumber: 2,
    season: 1
  },
  {
    id: "003",
    title: "Ranking Childhood Cartoons While Completely Missing the Point",
    description: "Join us as we completely overthink every cartoon from the 90s and 2000s. We discover hidden meanings that definitely weren't intended and get way too emotional about SpongeBob. Tissues recommended.",
    pubDate: "2024-01-01T10:00:00Z",
    duration: "38:45",
    audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    imageUrl: "https://images.pexels.com/photos/5082976/pexels-photo-5082976.jpeg?auto=compress&cs=tinysrgb&w=400",
    episodeNumber: 3,
    season: 1
  }
];