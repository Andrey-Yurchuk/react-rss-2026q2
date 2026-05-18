import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ApiRequestError,
  loadPokemonById,
  type PokemonCardModel,
} from '../../services/pokemonApi';
import { parsePageParam } from '../../utils/urlParams';

export function PokemonDetailsPanel() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const page = parsePageParam(searchParams.get('page'));
  const parsedId = Number(searchParams.get('details'));

  const [details, setDetails] = useState<PokemonCardModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadDetails() {
      if (!Number.isInteger(parsedId) || parsedId < 1) {
        setLoading(false);
        setError('Pokemon details were not found.');
        setDetails(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const loadedDetails = await loadPokemonById(parsedId);
        if (ignore) {
          return;
        }
        setDetails(loadedDetails);
        setError(null);
      } catch (err) {
        if (ignore) {
          return;
        }
        const message =
          err instanceof ApiRequestError
            ? err.message
            : 'Unable to load Pokemon details. Check your connection';
        setDetails(null);
        setError(message);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadDetails();

    return () => {
      ignore = true;
    };
  }, [parsedId]);

  const handleClose = () => {
    navigate({ pathname: '/', search: `?page=${page}` });
  };

  return (
    <aside className="details-panel" aria-label="Pokemon details">
      <div className="details-panel__header">
        <h2 className="details-panel__title">Pokemon details</h2>
        <button
          type="button"
          className="details-panel__close"
          onClick={handleClose}
        >
          Close
        </button>
      </div>

      {loading ? (
        <div className="loading" aria-live="polite" aria-busy="true">
          <div className="loading__spinner" />
          <span className="loading__label">Loading details…</span>
        </div>
      ) : null}

      {!loading && error ? (
        <p className="details-panel__error" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && details ? (
        <div className="details-panel__content">
          <p className="details-panel__id">Pokedex #{details.id}</p>
          <h3 className="details-panel__name">{details.name}</h3>
          <p className="details-panel__description">{details.description}</p>
        </div>
      ) : null}
    </aside>
  );
}
