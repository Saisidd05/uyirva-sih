function secureFunds({ amount, order_id }) { return { escrow_id: `ESC-${order_id.slice(0, 8)}`, order_id, amount, status: 'secured', message: 'Funds are held securely until receipt is confirmed.' }; }
function releaseFunds({ amount, order_id }) { return { escrow_id: `ESC-${order_id.slice(0, 8)}`, order_id, amount, status: 'released', released_at: new Date().toISOString() }; }
module.exports = { secureFunds, releaseFunds };
