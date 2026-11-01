import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

export default function Feedback() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const load = () => api('/api/feedback').then(setItems).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try { await api('/api/feedback', { method: 'POST', body: { text } }); setText(''); load(); }
    catch (err) { setError(err.message); }
  };

  return (
    <>
      <h1>Feedback</h1>
      {user ? (
        <form onSubmit={submit}>
          <label htmlFor="fb">Your feedback</label>
          <textarea id="fb" value={text} onChange={(e) => setText(e.target.value)} maxLength={500} required />
          <button>Post feedback</button>
        </form>
      ) : <p className="note"><Link to="/login">Log in</Link> to post feedback.</p>}
      {error && <p className="error" role="alert">{error}</p>}
      <ul className="feed">
        {items.map((f) => (
          <li key={f._id}>
            <strong>{f.name}</strong>
            {/* SAFE: React escapes text. The XSS demo used dangerouslySetInnerHTML here. */}
                  <p>{f.text}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
