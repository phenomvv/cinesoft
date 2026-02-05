
export interface StreamingPlatform {
  name: string;
  color: string;
  url?: string;
}

export interface Episode {
  id: string;
  number: number;
  title: string;
  overview: string;
  thumbnail: string;
  runtime?: string;
}

export interface Season {
  number: number;
  episodes: Episode[];
}

export interface Movie {
  id: string;
  title: string;
  year: string;
  rating: number; 
  type: 'movie' | 'show';
  poster: string;
  backdrop?: string;
  description: string;
  genres: string[];
  director: string;
  cast: any[]; 
  streamingPlatforms: StreamingPlatform[];
  trailerUrl: string;
  runtime?: string;
  seasons?: Season[];
  sources?: { title: string; uri: string }[]; 
}

export interface Person {
  name: string;
  role: string;
  bio: string;
  photo: string;
  knownFor: Movie[];
  sources?: { title: string; uri: string }[];
  socials?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
}

export interface User {
  name: string;
  email: string;
  avatarUrl?: string;
  language: string;
  isPremium: boolean;
  isKidsMode: boolean;
  traktConnected: boolean;
  traktUsername: string | null;
  watchlist: Movie[];
  watched: string[]; 
  watchedEpisodes: string[]; 
  userRatings: Record<string, number>;
  favoriteMovieIds: string[];
}

export type Theme = 'light' | 'dark';

export interface AppState {
  theme: Theme;
  user: User | null;
  movies: Movie[];
}
