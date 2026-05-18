import { Link } from 'react-router-dom';
import '../../app/App.css';

export function NotFoundPage() {
  return (
    <main className="static-page static-page--not-found">
      <p className="static-page__eyebrow">404 error</p>
      <h1>Page not found</h1>
      <p className="static-page__lead">
        The page you are looking for does not exist or has been moved
      </p>
      <Link className="static-page__home-link" to="/?page=1">
        Back to Pokemon search
      </Link>
    </main>
  );
}
