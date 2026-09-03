import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logisticsApi } from '../../services/logisticsApi';
import RouteStopCard from '../../components/RouteStopCard';
export default function RouteView() { const [route, setRoute] = useState(null); const [error, setError] = useState(''); const navigate = useNavigate(); useEffect(() => { logisticsApi.route().then(setRoute).catch(error => setError(error.message)); }, []); if (error) return <p role="alert">{error}</p>; if (!route) return <p>Calculating route…</p>; return <main><h1>Optimized route</h1><p>{route.distance_km} km · {route.estimated_duration_minutes} minutes</p>{route.stops.map(stop => <RouteStopCard key={stop.id} stop={stop} onUpdate={id => navigate(`/logistics/orders/${id}/status`)} />)}</main>; }
