import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import ReactPaginateModule from "react-paginate";
import type { ReactPaginateProps } from "react-paginate";
import type { ComponentType } from "react";

import type { Movie } from "../../types/movie";
import { fetchMovies } from '../../services/movieService';
import SearchBar from "../SearchBar/SearchBar";
import MovieGrid from "../MovieGrid/MovieGrid";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import MovieModal from "../MovieModal/MovieModal";

import css from './App.module.css';

// Правильний імпорт ReactPaginate для Vite
type ModuleWithDefault<T> = { default: T };
const ReactPaginate = (
  ReactPaginateModule as unknown as ModuleWithDefault<ComponentType<ReactPaginateProps>>
).default;

export default function App() {
  const [query, setQuery] = useState<string>(''); // Початковий пошуковий запит
  const [page, setPage] = useState<number>(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  // Використовуємо TanStack Query для кешування та запитів
  const { data, isLoading, isError, isSuccess } = useQuery({
    queryKey: ['movies', query, page],
    queryFn: () => fetchMovies(query, page),
    placeholderData: keepPreviousData,
    enabled: Boolean(query.trim()),
  });

  const movies = data?.results ?? [];
  const totalPages = data?.total_pages ?? 0;

  // Виклик тостера, якщо нічого не знайдено після успішного запиту
  useEffect(() => {
    if (isSuccess && movies.length === 0 && query.trim() !== '') {
      toast.error('No movies found for your request.');
    }
  }, [isSuccess, movies.length, query]);

  // Обробник нового пошуку через SearchBar
  const handleSearch = (newQuery: string) => {
    if (!newQuery.trim()) return;
    setQuery(newQuery);
    setPage(1); // При новому пошуку завжди скидаємо на 1-шу сторінку
  };

  // Обробник перемикання сторінок у ReactPaginate
  const handlePageChange = ({ selected }: { selected: number }) => {
    setPage(selected + 1); // react-paginate рахує з 0, а API — з 1
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Плавна прокрутка вгору
  };

  return (
    <div>
      <Toaster position="top-center" />
      <SearchBar onSubmit={handleSearch} />
      {/* Пагінація з'являється тільки тоді, коли сторінок більше однієї */}
        {totalPages > 1 && (
          <ReactPaginate
            pageCount={totalPages}
            pageRangeDisplayed={5}
            marginPagesDisplayed={1}
            onPageChange={handlePageChange}
            forcePage={page - 1}
            containerClassName={css.pagination}
            activeClassName={css.active}
            nextLabel="→"
            previousLabel="←"
          />
        )}

      <main>
        {isLoading && <Loader />}
        {isError && <ErrorMessage />}
        
        {!isLoading && !isError && movies.length > 0 && (
          <MovieGrid movies={movies} onSelect={setSelectedMovie} />
        )}

        
      </main>

      {/* Модальне вікно для детального перегляду фільму */}
      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </div>
  );
}