// Lightweight fuzzy, multi-field product search — no external dependencies.
// Scores a product against a query across name / brand / category / sub /
// highlight / description / tags / spec values, tolerating small typos.

function normalize(str) {
  return (str || '')
    .toString()
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function tokenize(str) {
  return normalize(str).split(/[^a-z0-9]+/).filter(Boolean);
}

// Levenshtein distance, capped early for short strings — plenty fast for
// per-keystroke search over a few hundred products.
function editDistance(a, b) {
  if (a === b) return 0;
  const al = a.length, bl = b.length;
  if (!al) return bl;
  if (!bl) return al;
  let prev = Array.from({ length: bl + 1 }, (_, i) => i);
  for (let i = 1; i <= al; i++) {
    const row = [i];
    for (let j = 1; j <= bl; j++) {
      row[j] = a[i - 1] === b[j - 1]
        ? prev[j - 1]
        : 1 + Math.min(prev[j - 1], prev[j], row[j - 1]);
    }
    prev = row;
  }
  return prev[bl];
}

function tokenFuzzyMatch(qTok, tTok) {
  if (tTok === qTok) return true;
  if (qTok.length >= 3 && tTok.startsWith(qTok)) return true;
  if (qTok.length >= 4) {
    const maxDist = qTok.length <= 5 ? 1 : 2;
    if (editDistance(qTok, tTok) <= maxDist) return true;
  }
  return false;
}

function productFields(p) {
  return {
    name:      normalize(p.name),
    brand:     normalize(p.brand),
    cat:       normalize(p.cat),
    sub:       normalize(p.sub),
    highlight: normalize(p.highlight),
    description: normalize(p.description),
    tags:      normalize((p.tags || []).join(' ')),
    specs:     normalize(Object.entries(p.specs || {}).map(([k, v]) => `${k} ${v}`).join(' ')),
  };
}

// Returns a relevance score (higher = better match), or 0 if no match at all.
export function scoreProduct(product, query) {
  const q = normalize(query).trim();
  if (!q) return 1;
  const f = productFields(product);
  const qTokens = tokenize(q);

  // Strong, cheap exact-substring signals first.
  if (f.name === q) return 1000;
  if (f.name.startsWith(q)) return 800;
  if (f.name.includes(q)) return 600;
  if (f.brand.includes(q) || f.sub.includes(q)) return 400;
  if (f.cat.includes(q) || f.tags.includes(q)) return 300;
  if (f.highlight.includes(q) || f.description.includes(q) || f.specs.includes(q)) return 200;

  // Token-level fuzzy match (typo tolerance), for multi-word / misspelled queries.
  const nameTokens = tokenize(f.name);
  const otherTokens = [
    ...tokenize(f.brand), ...tokenize(f.sub), ...tokenize(f.cat),
    ...tokenize(f.highlight), ...tokenize(f.tags), ...tokenize(f.description),
  ];

  let score = 0;
  let matchedAll = true;
  for (const qt of qTokens) {
    const hitName  = nameTokens.some(t => tokenFuzzyMatch(qt, t));
    const hitOther = !hitName && otherTokens.some(t => tokenFuzzyMatch(qt, t));
    if (hitName) score += 60;
    else if (hitOther) score += 20;
    else matchedAll = false;
  }
  if (!matchedAll && qTokens.length > 1) score *= 0.4; // partial multi-word match, still useful
  return matchedAll || score > 0 ? score : 0;
}

export function searchProducts(products, query, { limit } = {}) {
  const q = normalize(query).trim();
  if (!q) return products;
  const scored = products
    .map(p => ({ p, s: scoreProduct(p, q) }))
    .filter(x => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map(x => x.p);
  return limit ? scored.slice(0, limit) : scored;
}
