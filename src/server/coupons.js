const fs = require('fs');
const config = require('./config')
const winston = require('winston')

let coupons = []
let initialized = false

const updateCoupons = (data) => {
  coupons = data.map(
    d => ({
      id: d.coupon_id, 
      identifier: d.coupon_identifier,
      name: d.coupon_name, 
      value: d.coupon_value,
      testMode: d.coupon_testMode, 
      issuedAt: d.coupon_issuedAt }))
  persistCoupons()
}

const persistCoupons = () => {
  fs.writeFile(config.storage.couponPath, JSON.stringify(coupons), (err) => {
    if (!err) return
    winston.error('[coupons] Failed to save state to file', err);
  });
}

const rehydrateCoupons = () => {
  if (initialized) return
  try {
    coupons = JSON.parse(fs.readFileSync(config.storage.couponPath));
    initialized = true
  } catch (err) {
    winston.error('[coupons] Failed to rehydrate coupons', err);
    return;
  }
}

const getCoupons = () => coupons

module.exports = {
  updateCoupons,
  persistCoupons,
  rehydrateCoupons,
  getCoupons
}