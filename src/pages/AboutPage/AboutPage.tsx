import { Link } from 'react-router-dom';
import '../../app/App.css';

export function AboutPage() {
  return (
    <main className="static-page static-page--about">
      <p className="static-page__eyebrow">About this app</p>
      <h1>Pokedex browser</h1>
      <p className="static-page__lead">
        A React learning project where you can search Pokemon, open a detailed Pokemon card, and browse results with pagination
      </p>

      <section className="about-card" aria-labelledby="about-author-title">
        <h2 id="about-author-title">Author</h2>
        <p>
          Built by{' '}
          <a
            className="static-page__link"
            href="https://github.com/Andrey-Yurchuk"
            target="_blank"
            rel="noreferrer"
          >
            Andrey Yurchuk
          </a>
        </p>
      </section>

      <section className="about-card" aria-labelledby="about-course-title">
        <h2 id="about-course-title">Course</h2>
        <p>
          This project is part of the{' '}
          <a
            className="static-page__link"
            href="https://rs.school/courses/reactjs"
            target="_blank"
            rel="noreferrer"
          >
            RS School ReactJS course
          </a>
        </p>
      </section>

      <Link className="static-page__home-link" to="/?page=1">
        Back to Pokemon search
      </Link>
    </main>
  );
}
