function visibleOrder(order) {
  const output = { id: order.id, listing_id: order.listing_id, buyer_name: order.buyer_name || 'Buyer', crop: order.crop, quantity: order.quantity, agreed_price: order.agreed_price || order.total_amount / order.quantity, amount: order.total_amount, order_status: order.status, delivery_status: order.delivery_status, escrow_status: order.escrow_status };
  // Do not expose a driver until the buyer has both confirmed and allotted one.
  if (order.status === 'confirmed' && order.driverId && order.driver_assigned_by === 'buyer') {
    output.logistics = { driver_name: order.driver_name, vehicle_number: order.vehicle_number, contact_number: order.driver_contact, pickup_time_window: order.pickup_time_window, live_status: order.delivery_status };
    if (order.pooling) output.pooling = order.pooling;
  }
  return output;
}
module.exports = { visibleOrder };
