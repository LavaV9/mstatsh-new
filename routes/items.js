const express = require('express');
const router = express.Router();
const itemsController = require('../controllers/itemController');
const { upload } = require('../middleware/fileUpload');
const { isLoggedIn, isAuthor } = require('../middleware/auth');
const { validateId } = require('../middleware/validator');
const { body } = require('express-validator');
const offerRoutes = require('./offerRoutes');

// Route off of /items...

// GET /items: send all item listings to the user
router.get('/', itemsController.index);

// GET /item/:id: send details of item identified by id
router.get('/item/:id', validateId, itemsController.show);
router.get('/:id', validateId, itemsController.show);
// POST /post_item: create a new item listing
router.post(
  '/post_item',
  isLoggedIn,
  upload.single('image'),
  [
    body('title', 'Title is required').trim().escape(),
    body('price', 'Price must be a valid number').trim().isFloat({ min: 0 }),
    body('details', 'Details are required').trim().escape(),
    body('condition', 'Invalid condition')
      .trim()
      .escape()
      .isIn(['Gem Mint', 'Near Mint', 'Lightly Played', 'Moderately Played', 'Damaged']),
    body('seller', 'Seller is required').trim().escape(),
  ],
  itemsController.create
);

// GET /new: display create item form
router.get('/new', isLoggedIn, itemsController.new);

// GET /item/:id/edit: send HTML form for editing an existing item
router.get('/item/:id/edit', isLoggedIn, isAuthor, validateId, itemsController.edit);

// PUT /item/:id/edit/update: update an item listing
router.put(
  '/item/:id/edit/update',
  isLoggedIn,
  isAuthor,
  validateId,
  upload.single('image'),
  [
    body('title', 'Title is required').trim().escape(),
    body('price', 'Price must be a valid number').trim().isFloat({ min: 0 }),
    body('details', 'Details are required').trim().escape(),
    body('condition', 'Invalid condition')
      .trim()
      .escape()
      .isIn(['Gem Mint', 'Near Mint', 'Lightly Played', 'Moderately Played', 'Damaged']),
    body('image', 'Image is required').optional().trim().escape(),
    body('seller', 'Seller is required').trim().escape(),
  ],
  itemsController.update
);

// DELETE /item/:id: delete the item identified by id
router.delete('/item/:id', isLoggedIn, isAuthor, validateId, itemsController.delete);

// Use the offer routes for item offers
router.use('/item/:id/offers', offerRoutes);

module.exports = router;
