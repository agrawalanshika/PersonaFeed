export const INTEREST_OPTIONS = [
  "Technology",
  "Sports",
  "Finance",
  "Science",
  "Entertainment",
  "Business",
];

export const MOVIE_GENRE_OPTIONS = [
  "Action",
  "Comedy",
  "Drama",
  "Sci-Fi",
  "Horror",
  "Animation",
];

/** TMDB's `with_genres` param requires numeric genre IDs, not names. */
export const MOVIE_GENRE_TMDB_IDS: Record<string, number> = {
  Action: 28,
  Comedy: 35,
  Drama: 18,
  "Sci-Fi": 878,
  Horror: 27,
  Animation: 16,
};
