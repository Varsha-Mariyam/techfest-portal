// Tiny inline SVG images keep the demo self-contained. Swap in real photos (WebP) later.
const colors = ['#1f6feb', '#e5484d', '#30a46c', '#f5a524', '#8e4ec6', '#0a9396'];
const svg = (c, n) => 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200"><rect width="100%" height="100%" fill="${c}"/><text x="50%" y="54%" font-size="32" fill="#fff" text-anchor="middle" font-family="sans-serif">Photo ${n}</text></svg>`
);

export default function Gallery() {
  return (
    <>
      <h1>Gallery</h1>
      <div className="grid">
        {colors.map((c, i) => (
          <img key={c} src={svg(c, i + 1)} width="320" height="200" loading="lazy"
               alt={`TechFest 2025 highlight photo ${i + 1}`} />
        ))}
      </div>
    </>
  );
}
