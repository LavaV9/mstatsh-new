const express = require('express');
const router = express.Router();
const controller = require('../controllers/offerController');
const { isLoggedIn, isAuthor } = require('../middleware/auth');
const { validateOffer } = require('../middleware/validator');

router.post('/:id/offers', isLoggedIn, validateOffer, controller.makeOffer);
router.get('/:id/offers', isLoggedIn, controller.viewOffers);
router.post('/:offerId/accept', isLoggedIn, isAuthor, controller.acceptOffer);

module.exports = router;
