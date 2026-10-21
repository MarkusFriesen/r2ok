const fs = require('fs');
const config = require('./config')
const winston = require('winston')
const {createPersister} = require('./persist')

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

// Skips the write when the fetched coupons are identical to the stored ones
const couponPersister = createPersister(config.storage.couponPath, () => coupons, config.persistDelaySeconds.coupons * 1000)

const persistCoupons = () => couponPersister.schedule()

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