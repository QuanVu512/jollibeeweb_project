const { ROLES } = require('./roles');

const ROLE_LANDING_PAGES = Object.freeze({
  [ROLES.ADMIN]: '/admin/',
  [ROLES.CASHIER]: '/banhang/quan_ly_don_hang.html',
  [ROLES.KITCHEN]: '/kitchen.html',
  [ROLES.SHIPPER]: '/shipper/shipper.html',
  [ROLES.CUSTOMER]: '/homepage.php',
  [ROLES.CUSTOMER]: '/khachhang/homepage.html'
});

function getRoleLandingPage(role) {
  return ROLE_LANDING_PAGES[role] || '/khachhang/homepage.html';
}

module.exports = { ROLE_LANDING_PAGES, getRoleLandingPage };
