import axios from "axios";
import type { MovieSearchResponse } from "../types/movie";

const TOKEN = import.meta.env.VITE_TMDB_TOKEN;

console.log("VITE_TMDB_TOKEN exists:", Boolean(TOKEN));

const apiClient = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    accept: "application/json",
  },
});

export const fetchMovies = async (
  query: string,
  page: number = 1,
): Promise<MovieSearchResponse> => {
  const response = await apiClient.get<MovieSearchResponse>("/search/movie", {
    params: {
      query,
      include_adult: false,
      language: "en-US",
      page,
    },
  });
  return response.data;
};
