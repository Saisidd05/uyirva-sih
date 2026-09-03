import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { buyerApi } from '../../services/buyerApi';
import EscrowStatusBadge from '../../components/EscrowStatusBadge';
export default function OrderHistory() { const [history, setHistory] = useState(null); useEffect(() => { buyerApi.history().then(setHistory); }, []); if (!history) return <p>Loading orders…</p>; return <main><h1>Order history & invoices</h1>{history.orders.map(order => <article key={order.id}><Link to={`/buyer/orders/${order.id}`}>{order.crop} · ₹{order.total_amount}</Link><EscrowStatusBadge status={order.escrow_status} /><a href={`data:text/plain,Invoice ${order.id} ₹${order.total_amount}`} download={`invoice-${order.id}.txt`}>Download invoice</a></article>)}</main>; }
