const Order = require('../models/Order.model');
const poolingEngine = require('../services/poolingEngine.service');
const routeOptimizer = require('../services/routeOptimizer.service');
function assignedPooledOrders(partner) { const orders = Order.all().filter(order => poolingEngine.getPoolingStatus(order).pooled).map(order => ({ ...order, logistics_partner_id: partner.sub, pooling: poolingEngine.getPoolingStatus(order) })); return { status: 200, body: { orders } }; }
function routeView(partner) { const orders = assignedPooledOrders(partner).body.orders; return { status: 200, body: routeOptimizer.optimize(orders) }; }
module.exports = { assignedPooledOrders, routeView };
