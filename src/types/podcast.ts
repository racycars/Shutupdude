export interface Episode {
  id: string;
  title: string;
  description: string;
  pubDate: string;
  duration: string;
  audioUrl: string;
  imageUrl?: string;
  episodeNumber?: number;
  season?: number;
}

export interface PodcastInfo {
  title: string;
  description: string;
  imageUrl: string;
  author: string;
  category: string;
  language: string;
  link: string;
}