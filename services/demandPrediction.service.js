function forecast({ region = 'Tamil Nadu' } = {}) { return { region, crop: 'Tomato', period: 'next month', demand_level: 'high', confidence: 0.79, recommendation: 'High demand expected for Tomato next month. Consider planning an early listing.' }; }
module.exports = { forecast };
