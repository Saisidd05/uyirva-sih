export default function QualityScoreBadge({ quality }) { if (!quality) return null; return <span className="quality-score">{quality.grade} · {quality.score}/100</span>; }
