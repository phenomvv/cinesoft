
import { GoogleGenAI, Type } from "@google/genai";
import { Movie, Person, Season } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

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

export const getAIOpinion = async (title: string) => {
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
  try {
    const familyInstruction = kidsMode ? "STRICT PARENTAL CONTROL: Only return movies or shows rated G, PG, or TV-Y/TV-G/TV-PG. Absolutely no R-rated or TV-MA content." : "";
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `${familyInstruction} ${prompt}. Ensure 'poster' and 'backdrop' fields are valid, direct image URLs from official sources or movie databases.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: { type: Type.ARRAY, items: movieSchema },
        // NOTE: Google Search grounding is NOT allowed when responseMimeType is application/json
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
  fetchList("Search for the top 8 trending MOVIES released in late 2024 or coming in 2025. Return JSON.", kidsMode);

export const fetchTrendingShows = (kidsMode: boolean = false) => 
  fetchList("Search for the top 8 currently popular TV series/shows. Return JSON.", kidsMode);

export const fetchInTheaters = (kidsMode: boolean = false) => 
  fetchList("Search for 6 movies currently showing in major theaters now. Return JSON.", kidsMode);

export const fetchRecommendations = (likedTitles: string[], kidsMode: boolean = false) => {
  const context = likedTitles.length > 0 
    ? `The user enjoys: ${likedTitles.join(", ")}. Based on this, suggest 8 unique and highly rated movies or shows they haven't seen yet. Focus on similar genres and high production quality.`
    : "Suggest 8 top-tier, critically acclaimed movies and shows from various genres for a new user.";
  return fetchList(context, kidsMode);
};

export const searchMovies = (query: string, typeFilter: string = 'all', kidsMode: boolean = false) => {
  let constraint = typeFilter === 'all' ? "movies or shows" : typeFilter;
  return fetchList(`Search for "${query}" ${constraint}. Return 10 results in JSON with accurate poster URLs.`, kidsMode);
};

export const fetchMovieDetails = async (id: string, type: 'movie' | 'show'): Promise<Movie | null> => {
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
