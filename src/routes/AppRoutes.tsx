import { Route, Routes } from 'react-router-dom';
import { PokemonApp } from '../components/PokemonApp/index.ts';
import { PokemonDetailsPanel } from '../components/PokemonDetailsPanel/index.ts';
import { AboutPage } from '../pages/AboutPage/index.ts';
import { NotFoundPage } from '../pages/NotFoundPage/index.ts';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PokemonApp />}>
        <Route index element={<PokemonDetailsPanel />} />
      </Route>
      <Route path="/about" element={<AboutPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
