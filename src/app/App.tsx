import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '../routes/AppRoutes';

const ROUTER_BASENAME =
  (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '') || '/';

export default function App() {
  return (
    <BrowserRouter basename={ROUTER_BASENAME}>
      <AppRoutes />
    </BrowserRouter>
  );
}
