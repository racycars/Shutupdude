import { Episode, PodcastInfo } from '../types/podcast';

// CORS proxy for RSS feed access
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const RSS_FEED_URL = 'https://media.zencast.fm/episode-1-1052053/rss';

export async function fetchRSSFeed(url: string = RSS_FEED_URL): Promise<{ podcast: PodcastInfo; episodes: Episode[] }> {
  try {
    const response = await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`);
    const xmlText = await response.text();
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Extract podcast information
    const channel = xmlDoc.querySelector('channel');
    if (!channel) {
      throw new Error('Invalid RSS feed format');
    }
    
    const podcast: PodcastInfo = {
      title: channel.querySelector('title')?.textContent || 'Shut Up Dude',
      description: channel.querySelector('description')?.textContent || 'A hilarious podcast where friends debate everything.',
      imageUrl: channel.querySelector('image url')?.textContent || 
                channel.querySelector('itunes\\:image')?.getAttribute('href') ||
                'https://images.pexels.com/photos/4792509/pexels-photo-4792509.jpeg?auto=compress&cs=tinysrgb&w=800',
      author: channel.querySelector('itunes\\:author')?.textContent || 
              channel.querySelector('managingEditor')?.textContent || 'The Dudes',
      category: channel.querySelector('itunes\\:category')?.getAttribute('text') || 'Comedy',
      language: channel.querySelector('language')?.textContent || 'en-US',
      link: channel.querySelector('link')?.textContent || 'https://shutupdude.podcast.com'
    };
    
    // Extract episodes
    const items = xmlDoc.querySelectorAll('item');
    const episodes: Episode[] = Array.from(items).map((item, index) => {
      const enclosure = item.querySelector('enclosure');
      const itunesImage = item.querySelector('itunes\\:image');
      const guid = item.querySelector('guid')?.textContent || `episode-${index + 1}`;
      
      return {
        id: guid.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase(),
        title: item.querySelector('title')?.textContent || `Episode ${index + 1}`,
        description: item.querySelector('description')?.textContent || 
                    item.querySelector('itunes\\:summary')?.textContent || 
                    'No description available',
        pubDate: item.querySelector('pubDate')?.textContent || new Date().toISOString(),
        duration: item.querySelector('itunes\\:duration')?.textContent || '00:00',
        audioUrl: enclosure?.getAttribute('url') || '',
        imageUrl: itunesImage?.getAttribute('href') || podcast.imageUrl,
        episodeNumber: parseInt(item.querySelector('itunes\\:episode')?.textContent || `${index + 1}`),
        season: parseInt(item.querySelector('itunes\\:season')?.textContent || '1')
      };
    });
    
    return { podcast, episodes };
  } catch (error) {
    console.error('Failed to fetch RSS feed:', error);
    
    // Fallback to mock data if RSS fetch fails
    return {
      podcast: mockPodcastInfo,
      episodes: mockEpisodes
    };
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatDuration(duration: string): string {
  // Handle different duration formats (seconds, MM:SS, HH:MM:SS)
  if (!duration || duration === '00:00') return 'Unknown';
  
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