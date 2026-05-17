import { Route, Routes } from 'react-router-dom';
import { PokemonApp } from '../components/PokemonApp';
import { AboutPage } from '../pages/AboutPage/AboutPage';
import { NotFoundPage } from '../pages/NotFoundPage/NotFoundPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PokemonApp />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
