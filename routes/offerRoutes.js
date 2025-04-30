const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');
const { isLoggedIn, isAuthor } = require('../middleware/auth');
const { validateOffer } = require('../middleware/validator');

router.post('/:id/offers', isLoggedIn, validateOffer, offerController.createOffer);
router.get('/:id/offers', isLoggedIn, offerController.viewOffers);
router.post('/:offerId/accept', isLoggedIn, isAuthor, offerController.acceptOffer);

module.exports = router;
