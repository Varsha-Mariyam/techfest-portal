import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => { api('/api/events').then(setEvents).catch((e) => setError(e.message)); }, []);

  return (
    <>
      <h1>Two days. Four stages. One campus.</h1>
      <p className="lead">Pick your event, then tell us how it went in Feedback.</p>
      {error && <p className="error" role="alert">{error}</p>}
      <ul className="events">
        {events.map((e) => (
          <li key={e.id}>
            <h2>{e.title}</h2>
            <p>{e.blurb}</p>
            <small>{e.day}, {e.venue}</small>
          </li>
        ))}
      </ul>
    </>
  );
}
