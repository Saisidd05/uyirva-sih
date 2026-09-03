function getPoolingStatus(order) { const pooled = Number(order.quantity) >= 100; return { order_id: order.id, pooled, nearby_order_count: pooled ? 2 : 0, route_savings_km: pooled ? 18 : 0, expected_delivery_window: pooled ? 'Tomorrow, 10 AM–2 PM' : 'Tomorrow, 9 AM–12 PM', pickup_at: pooled ? 'Today, 4:00 PM' : null }; }
module.exports = { getPoolingStatus };
