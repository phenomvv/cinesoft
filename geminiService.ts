
import { GoogleGenAI, Type } from "@google/genai";
import { Movie, Person, Season } from "./types";

const apiKey = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey.length > 0) {
  try {
    ai = new GoogleGenAI({ apiKey });
  } catch (error) {
    console.warn("Gemini Client failed to initialize. App will run in Demo Mode.", error);
  }
} else {
  console.warn("Gemini API Key is missing. App is running in Demo Mode.");
}

const movieSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    title: { type: Type.STRING },
    year: { type: Type.STRING },
    rating: { type: Type.NUMBER },
    type: { type: Type.STRING, description: "'movie' or 'show'" },
    poster: { type: Type.STRING, description: "URL to a real movie poster image" },
    backdrop: { type: Type.STRING, description: "URL to a real high-res background image (landscape)" },
    description: { type: Type.STRING },
    genres: { type: Type.ARRAY, items: { type: Type.STRING } },
    director: { type: Type.STRING },
    cast: { type: Type.ARRAY, items: { type: Type.STRING } },
    streamingPlatforms: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          color: { type: Type.STRING },
          url: { type: Type.STRING }
        },
        required: ['name', 'color', 'url']
      }
    },
    trailerUrl: { type: Type.STRING }
  },
  required: ['id', 'title', 'year', 'rating', 'type', 'poster', 'description', 'genres', 'director', 'cast', 'streamingPlatforms']
};

const DEMO_MOVIES: Movie[] = [
  {
    id: 'demo-1',
    title: 'Welcome to CineSoft',
    year: '2025',
    rating: 10,
    type: 'movie',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop',
    description: 'This is a demo placeholder because the API Key is missing. Please add your Gemini API_KEY to Vercel Environment Variables to unlock AI features.',
    genres: ['Demo', 'System'],
    director: 'CineSoft',
    cast: ['You', 'AI'],
    streamingPlatforms: [],
    trailerUrl: ''
  },
  {
    id: 'demo-2',
    title: 'Setup Required',
    year: '2024',
    rating: 9.5,
    type: 'show',
    poster: 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?q=80&w=800&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?q=80&w=1200&auto=format&fit=crop',
    description: 'To see real movies and shows, configure your backend API keys.',
    genres: ['Tutorial'],
    director: 'Admin',
    cast: [],
    streamingPlatforms: [],
    trailerUrl: ''
  }
];

export const getAIOpinion = async (title: string) => {
  if (!ai) return "AI Insights unavailable (Demo Mode).";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Short, funny, 2-sentence review of "${title}".`,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text?.trim() || "A total cinematic journey!";
  } catch (error) {
    return "Insights coming soon...";
  }
};

export const getTasteInsights = async (watchedTitles: string[], watchlistTitles: string[]) => {
  if (!ai) return "Add an API Key to see your personalized taste profile!";
  try {
    const prompt = `Based on these watched titles: [${watchedTitles.join(', ')}] and these watchlist items: [${watchlistTitles.join(', ')}], provide a fun, personalized 3-sentence analysis of the user's movie taste. Be witty and descriptive.`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text?.trim() || "You have a diverse and exciting taste in cinema!";
  } catch (error) {
    return "Curating your personal taste profile...";
  }
};

const fetchList = async (prompt: string, kidsMode: boolean = false): Promise<Movie[]> => {
  if (!ai) return DEMO_MOVIES;
  
  try {
    const familyInstruction = kidsMode ? "STRICT PARENTAL CONTROL: Only return movies or shows rated G, PG, or TV-Y/TV-G/TV-PG. Absolutely no R-rated or TV-MA content." : "";
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `${familyInstruction} ${prompt}. Ensure 'poster' and 'backdrop' fields are valid, direct image URLs from official sources or movie databases.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: movieSchema },
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    const data = JSON.parse(response.text || "[]");
    return data;
  } catch (error) {
    console.error("Gemini Fetch error:", error);
    return [];
  }
};

export const fetchTrendingMovies = (kidsMode: boolean = false) => 
  fetchList("Search for the top 8 trending MOVIES released in late 2024 or early 2025. Return JSON.", kidsMode);

export const fetchTrendingShows = (kidsMode: boolean = false) => 
  fetchList("Search for the top 8 currently popular TV series/shows. Return JSON.", kidsMode);

export const fetchInTheaters = (kidsMode: boolean = false) => 
  fetchList("Search for 6 movies currently showing in major theaters now. Return JSON.", kidsMode);

export const fetchUpcomingMovies = (kidsMode: boolean = false) => {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return fetchList(`Today is ${today}. Search for exactly 8 highly anticipated movies and TV shows that are scheduled for release STRICTLY AFTER ${today}. Do not include anything that has already premiered. Focus on upcoming blockbusters and major streaming originals for mid-to-late 2025. Return JSON.`, kidsMode);
};

export const fetchRecommendations = (likedTitles: string[], kidsMode: boolean = false) => {
  const context = likedTitles.length > 0 
    ? `The user enjoys: ${likedTitles.join(", ")}. Based on this, suggest 8 unique and highly rated movies or shows they haven't seen yet. Focus on similar genres and high production quality.`
    : "Suggest 8 top-tier, critically acclaimed movies and shows from various genres for a new user.";
  return fetchList(context, kidsMode);
};

export const searchMovies = (query: string, typeFilter: string = 'all', kidsMode: boolean = false) => {
  if (!ai) {
    return Promise.resolve(DEMO_MOVIES.filter(m => m.title.toLowerCase().includes(query.toLowerCase())));
  }
  let constraint = typeFilter === 'all' ? "movies or shows" : typeFilter;
  return fetchList(`Search for "${query}" ${constraint}. Return 10 results in JSON with accurate poster URLs.`, kidsMode);
};

export const fetchMovieDetails = async (id: string, type: 'movie' | 'show'): Promise<Movie | null> => {
  if (!ai) return DEMO_MOVIES[0];
  try {
      const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Get deep details for the ${type} with TMDB ID or title match for ${id}. JSON format. Include real trailer, poster, and backdrop.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: movieSchema,
        thinkingConfig: { thinkingBudget: 0 }
      },
    });
    const data = JSON.parse(response.text || "null");
    return data;
  } catch (e) {
    return null;
  }
};

export const fetchPersonDetails = async (name: string): Promise<Person | null> => {
  if (!ai) return null;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Quick summary for person "${name}". Role, short bio, and 4 major movies they are known for. JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            role: { type: Type.STRING },
            bio: { type: Type.STRING },
            photo: { type: Type.STRING },
            knownFor: { type: Type.ARRAY, items: movieSchema }
          },
          required: ['name', 'role', 'bio', 'photo', 'knownFor']
        },
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    const data = JSON.parse(response.text || "null");
    return data;
  } catch (error) {
    return null;
  }
};
