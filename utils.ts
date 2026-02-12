
export const FALLBACK_POSTER = "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500&auto=format&fit=crop";

export const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
  if (typeof window !== 'undefined' && navigator.vibrate) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 35
    };
    navigator.vibrate(patterns[style]);
  }
};

export const getCommunityRating = (movieId: string, baseRating: number) => {
  try {
    const savedUser = localStorage.getItem('cinesoft_user');
    const user = savedUser ? JSON.parse(savedUser) : null;
    const userRating = user?.userRatings?.[movieId];

    const allRatingsData = localStorage.getItem('cinesoft_global_ratings');
    const db = allRatingsData ? JSON.parse(allRatingsData) : {};
    const entry = db[movieId] || { sum: baseRating * 100, count: 100 };
    
    let finalSum = entry.sum;
    let finalCount = entry.count;
    
    if (userRating) {
      finalSum += userRating * 2;
      finalCount += 1;
    }

    return (finalSum / finalCount).toFixed(1);
  } catch (e) {
    return baseRating.toFixed(1);
  }
};
