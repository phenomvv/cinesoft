
import { Movie, Person, Season, Episode, StreamingPlatform } from "./types";

const API_KEY = process.env.TMDB_API_KEY || '717d9fe49eec21ec222a75e01c58e79c'; 

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w780';
const BACKDROP_BASE = 'https://image.tmdb.org/t/p/original'; 
const PROFILE_BASE = 'https://image.tmdb.org/t/p/w185';

const GENRE_MAP: Record<string, { movie: string; tv: string }> = {
  'Action': { movie: '28', tv: '10759' },
  'Comedy': { movie: '35', tv: '35' },
  'Horror': { movie: '27', tv: '10765,9648' },
  'Drama': { movie: '18', tv: '18' },
  'Sci-Fi': { movie: '878', tv: '10765' },
  'Animation': { movie: '16', tv: '16' },
  'Romance': { movie: '10749', tv: '18,35' },
  'Thriller': { movie: '53', tv: '80,9648' },
  'Mystery': { movie: '9648', tv: '9648' }
};

const VIBE_MAP: Record<string, Record<string, string>> = {
  'Movies that feel like a warm hug': { 
    with_genres: '10751,35', 
    without_genres: '27,53,18', 
    sort_by: 'vote_average.desc',
    'vote_count.gte': '1000'
  },
  'Atmospheric mystery movies for a rainy night': { 
    with_genres: '9648,53', 
    sort_by: 'popularity.desc',
    'vote_average.gte': '7'
  },
  'Hard sci-fi movies set in deep space': { 
    with_genres: '878', 
    with_keywords: '9882', 
    sort_by: 'popularity.desc'
  },
  'Highly rated indie movies from the last 5 years': { 
    'vote_average.gte': '7.5',
    'vote_count.gte': '100',
    'vote_count.lte': '4000',
    'primary_release_date.gte': new Date(new Date().setFullYear(new Date().getFullYear() - 5)).toISOString().split('T')[0],
    sort_by: 'vote_average.desc'
  },
  'Psychological thrillers with huge plot twists': { 
    with_genres: '53,9648',
    sort_by: 'revenue.desc', 
    'vote_count.gte': '2000'
  }
};

export const hasApiKey = () => !!API_KEY && API_KEY !== 'YOUR_KEY_HERE';

const fetchTMDB = async (endpoint: string, params: Record<string, string> = {}) => {
  if (!hasApiKey()) return null;
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('TMDB Fetch Error');
  return res.json();
};

const mapMovie = (m: any): Movie => ({
  id: m.id.toString(),
  title: m.title || m.name,
  year: (m.release_date || m.first_air_date || '').split('-')[0] || 'N/A',
  releaseDate: m.release_date || m.first_air_date,
  rating: Number(m.vote_average?.toFixed(1)) || 0,
  type: m.media_type === 'tv' || m.name ? 'show' : 'movie',
  poster: m.poster_path ? `${IMAGE_BASE}${m.poster_path}` : '',
  backdrop: m.backdrop_path ? `${BACKDROP_BASE}${m.backdrop_path}` : undefined,
  description: m.overview,
  genres: [], 
  director: 'Loading...', 
  cast: [], 
  streamingPlatforms: [], 
  trailerUrl: '',
  runtime: m.runtime ? `${m.runtime} min` : m.episode_run_time?.[0] ? `${m.episode_run_time[0]} min` : undefined,
  sources: [{ title: 'TMDB', uri: `https://www.themoviedb.org/${m.media_type || 'movie'}/${m.id}` }]
});

export const fetchTrendingMovies = async (kidsMode: boolean = false): Promise<Movie[]> => {
  try {
    const params: Record<string, string> = { sort_by: 'popularity.desc' };
    if (kidsMode) { params['certification_country'] = 'US'; params['certification.lte'] = 'PG-13'; }
    const data = await fetchTMDB('/discover/movie', params);
    return data?.results?.map((m: any) => ({ ...mapMovie(m), type: 'movie' })) || [];
  } catch (e) { return []; }
};

export const fetchTrendingShows = async (kidsMode: boolean = false): Promise<Movie[]> => {
  try {
    const params: Record<string, string> = { sort_by: 'popularity.desc' };
    if (kidsMode) { params['certification_country'] = 'US'; params['certification.lte'] = 'PG-13'; }
    const data = await fetchTMDB('/discover/tv', params);
    return data?.results?.map((m: any) => ({ ...mapMovie(m), type: 'show' })) || [];
  } catch (e) { return []; }
};

export const fetchInTheaters = async (kidsMode: boolean = false): Promise<Movie[]> => {
  try {
    const params: Record<string, string> = {};
    if (kidsMode) { params['certification_country'] = 'US'; params['certification.lte'] = 'PG-13'; }
    const data = await fetchTMDB('/movie/now_playing', params);
    return data?.results?.map((m: any) => ({ ...mapMovie(m), type: 'movie' })) || [];
  } catch (e) { return []; }
};

export const fetchUpcomingMovies = async (kidsMode: boolean = false): Promise<Movie[]> => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const movieParams: Record<string, string> = { 
        'primary_release_date.gte': tomorrowStr,
        'sort_by': 'popularity.desc'
    };
    const showParams: Record<string, string> = { 
        'first_air_date.gte': tomorrowStr,
        'sort_by': 'popularity.desc'
    };

    if (kidsMode) { 
        movieParams['certification_country'] = 'US'; movieParams['certification.lte'] = 'PG-13'; 
        showParams['certification_country'] = 'US'; showParams['certification.lte'] = 'PG-13';
    }

    const [moviesRes, showsRes] = await Promise.all([
        fetchTMDB('/discover/movie', movieParams),
        fetchTMDB('/discover/tv', showParams)
    ]);

    const movies = (moviesRes?.results || []).map((m: any) => ({ ...mapMovie(m), type: 'movie' }));
    const shows = (showsRes?.results || []).map((m: any) => ({ ...mapMovie(m), type: 'show' }));

    // Merge and sort by popularity to show most anticipated first
    return [...movies, ...shows].slice(0, 15);
  } catch (e) { return []; }
};

export const fetchRecommendations = async (likedTitles: string[], kidsMode: boolean = false): Promise<Movie[]> => {
  try {
    const params: Record<string, string> = {};
    if (kidsMode) { params['certification_country'] = 'US'; params['certification.lte'] = 'PG-13'; }
    const data = await fetchTMDB('/trending/all/day', params);
    return data?.results?.map(mapMovie) || [];
  } catch (e) { return []; }
};

export const searchMovies = async (query: string, type: string = 'all', kidsMode: boolean = false, genreName?: string | null): Promise<Movie[]> => {
  try {
    if (VIBE_MAP[query]) {
      const vibeParams = VIBE_MAP[query];
      const params: Record<string, string> = { ...vibeParams, include_adult: 'false', language: 'en-US' };
      if (kidsMode) { params['certification_country'] = 'US'; params['certification.lte'] = 'PG-13'; }
      const data = await fetchTMDB('/discover/movie', params);
      return data?.results?.map((m: any) => ({ ...mapMovie(m), type: 'movie' })) || [];
    }

    if (genreName && !query.trim()) {
      const genreIds = GENRE_MAP[genreName] || { movie: '', tv: '' };
      const commonParams = { 
        sort_by: 'popularity.desc', 
        'vote_count.gte': '50', 
        include_adult: 'false'
      };
      
      if (kidsMode) { 
        Object.assign(commonParams, { 'certification_country': 'US', 'certification.lte': 'PG-13' }); 
      }

      const promises = [];
      if (type === 'all' || type === 'movie') {
        const p = { ...commonParams, with_genres: genreIds.movie };
        promises.push(
            fetchTMDB('/discover/movie', p).then(d => d?.results?.map((m: any) => ({ ...mapMovie(m), type: 'movie' })) || [])
        );
      }
      if (type === 'all' || type === 'show') {
         const p = { ...commonParams, with_genres: genreIds.tv };
         if (genreIds.tv) {
             promises.push(
                fetchTMDB('/discover/tv', p).then(d => d?.results?.map((m: any) => ({ ...mapMovie(m), type: 'show' })) || [])
             );
         }
      }

      const results = await Promise.all(promises);
      const combined = results.flat();
      return combined.sort((a, b) => b.rating - a.rating).slice(0, 20);
    }

    const params: Record<string, string> = { query, include_adult: 'false' };
    let endpoint = '/search/multi';
    if (type === 'movie') endpoint = '/search/movie';
    if (type === 'show') endpoint = '/search/tv';
    
    const data = await fetchTMDB(endpoint, params);
    const results = data?.results || [];
    
    const prioritized = results.sort((a: any, b: any) => {
        const scoreA = a.media_type === 'person' ? 1 : 0;
        const scoreB = b.media_type === 'person' ? 1 : 0;
        return scoreA - scoreB;
    });

    return prioritized.filter((m: any) => m.media_type !== 'person' || type !== 'all')
      .map((m: any) => ({ ...mapMovie(m), type: type === 'all' ? (m.media_type === 'tv' ? 'show' : 'movie') : (type as 'movie' | 'show') })) || [];
  } catch (e) { return []; }
};

export const fetchMovieDetails = async (id: string, type: 'movie' | 'show'): Promise<Movie | null> => {
  try {
    const endpoint = type === 'movie' ? `/movie/${id}` : `/tv/${id}`;
    const data = await fetchTMDB(endpoint, { append_to_response: 'credits,watch/providers,videos' });
    const director = data.credits?.crew?.find((c: any) => c.job === 'Director')?.name || 'Unknown';
    const castData = data.credits?.cast?.slice(0, 10).map((c: any) => ({ 
      name: c.name, 
      profile: c.profile_path ? `${PROFILE_BASE}${c.profile_path}` : null,
      character: c.character
    })) || [];
    const genres = data.genres?.map((g: any) => g.name) || [];
    const trailer = data.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
    const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '';
    
    const providers = data['watch/providers']?.results || {};
    const providerRes = providers.US || providers.GB || {};
    
    const providerMap = new Map();
    (providerRes.free || []).forEach((p: any) => providerMap.set(p.provider_id, p));
    (providerRes.ads || []).forEach((p: any) => providerMap.set(p.provider_id, p));
    (providerRes.flatrate || []).forEach((p: any) => providerMap.set(p.provider_id, p));

    const streamingPlatforms: StreamingPlatform[] = Array.from(providerMap.values()).map((p: any) => ({
      name: p.provider_name, 
      color: '#fff', 
      url: p.logo_path ? `https://image.tmdb.org/t/p/original${p.logo_path}` : ''
    }));

    let seasons: Season[] = [];
    if (type === 'show') { seasons = await fetchSeasons(id); }
    return { ...mapMovie(data), director, cast: castData, genres, streamingPlatforms, trailerUrl, seasons };
  } catch (e) { return null; }
};

export const fetchSeasons = async (id: string): Promise<Season[]> => {
  try {
    const show = await fetchTMDB(`/tv/${id}`);
    const seasons: Season[] = [];
    const seasonCount = Math.min(show.number_of_seasons, 5); 
    for (let i = 1; i <= seasonCount; i++) {
      const sData = await fetchTMDB(`/tv/${id}/season/${i}`);
      if (!sData) continue;
      seasons.push({
        number: sData.season_number,
        episodes: sData.episodes?.map((e: any) => ({ 
          id: e.id.toString(), 
          number: e.episode_number, 
          title: e.name, 
          overview: e.overview, 
          thumbnail: e.still_path ? `${IMAGE_BASE}${e.still_path}` : '',
          runtime: e.runtime ? `${e.runtime} min` : undefined
        })) || []
      });
    }
    return seasons;
  } catch (e) { return []; }
};

export const fetchPersonDetails = async (name: string): Promise<Person | null> => {
  try {
    const search = await fetchTMDB('/search/person', { query: name });
    const personId = search?.results?.[0]?.id;
    if (!personId) return null;
    const data = await fetchTMDB(`/person/${personId}`, { append_to_response: 'combined_credits,external_ids' });
    return {
      name: data.name, role: data.known_for_department, bio: data.biography, photo: data.profile_path ? `${PROFILE_BASE}${data.profile_path}` : '',
      knownFor: data.combined_credits?.cast?.slice(0, 10).map((m: any) => ({ ...mapMovie(m), type: m.media_type === 'tv' ? 'show' : 'movie' })) || [],
      sources: [{ title: 'TMDB', uri: `https://www.themoviedb.org/person/${data.id}` }],
      socials: {
        instagram: data.external_ids?.instagram_id ? `https://instagram.com/${data.external_ids.instagram_id}` : undefined,
        twitter: data.external_ids?.twitter_id ? `https://twitter.com/${data.external_ids.twitter_id}` : undefined,
        facebook: data.external_ids?.facebook_id ? `https://facebook.com/${data.external_ids.facebook_id}` : undefined,
      }
    };
  } catch (e) { return null; }
};
