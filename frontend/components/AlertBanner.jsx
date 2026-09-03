export default function AlertBanner({ alert }) { return <aside className={`alert ${alert.severity}`}><strong>{alert.severity.toUpperCase()}</strong><span>{alert.message}</span></aside>; }
