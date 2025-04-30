const mongoose = require('mongoose');
const Item = require('../models/Item');

exports.index = (req, res) => {
    const searchQuery = req.query.q || '';
    
    
    Item.find({ title: new RegExp(searchQuery, 'i') })
        .sort({ title: 1 }) 
        .then(items => {
            res.render('items', {
                items,
                title: 'Browse Items',
                searchQuery
            });
        })
        .catch(err => {
            console.error("Error retrieving items:", err);
            res.status(500).send("Item could not load");
        });
};

exports.new = (req, res) => {
    const searchQuery = req.query.q || '';
    res.render('new', { searchQuery });
};

exports.create = (req, res, next) => {
    let item = new Item({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      image: req.file.filename,
      userId: req.session.user._id,
      seller: `${req.session.user.firstName} ${req.session.user.lastName}`,
    });
  
    item.save()
      .then(() => {
        req.flash('success', 'Item listed successfully');
        res.redirect('/items');
      })
      .catch(err => {
        if (err.name === 'ValidationError') {
          req.flash('error', err.message);
          return res.redirect('/items/new');
        }
        next(err);
      });
  };

exports.show = (req, res, next) => {
    const id = req.params.id;
    const searchQuery = req.query.q || '';

    if (!mongoose.Types.ObjectId.isValid(id)) {
        let err = new Error('Invalid item ID');
        err.status = 400;
        return next(err);
    }

    Item.findById(id)
        .then(item => {
            if (item) {
                res.render('item', {
                    item,
                    searchQuery
                });
            } else {
                res.status(404).send("Item not found");
            }
        })
        .catch(err => res.status(500).send("Data could not be loaded right now"));
};

exports.edit = (req, res, next) => {
    const id = req.params.id;
    const searchQuery = req.query.q || '';

    if (!mongoose.Types.ObjectId.isValid(id)) {
        let err = new Error('Invalid item ID');
        err.status = 400;
        return next(err);
    }

    Item.findById(id)
        .then(item => {
            if (item) {
                if (item.userId.toString() === req.session.user._id.toString()) {
                    res.render('edit', {
                        item,
                        searchQuery
                    });
                } else {
                    res.status(403).send("You dont have access to edit this item");
                }
            } else {
                res.status(404).send("Item could not be found.");
            }
        })
        .catch(err => res.status(500).send("Items could not be retrieved."));
};

exports.update = (req, res, next) => {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        let err = new Error('Invalid item ID');
        err.status = 400;
        return next(err);
    }

    Item.findById(id)
        .then(existingItem => {
            if (!existingItem) {
                return res.status(404).send("Item not found.");
            }

            if (existingItem.userId.toString() !== req.session.user._id.toString()) {
                return res.status(403).send("Unauthorized access to update this item");
            }

            const updatedItem = {
                title: req.body.title,
                condition: req.body.condition,
                price: req.body.price,
                seller: req.body.seller,
                details: req.body.details,
                image: req.file ? req.file.filename : existingItem.image
            };

            return Item.findByIdAndUpdate(id, updatedItem, { new: true });
        })
        .then(updatedItem => {
            if (updatedItem) {
                res.redirect('/items/' + id);
            } else {
                res.status(404).send("Item not found.");
            }
        })
        .catch(err => {
            res.status(500).send(err.message || "Error updating item.");
        });
};

exports.delete = (req, res, next) => {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        let err = new Error('Invalid item ID');
        err.status = 400;
        return next(err);
    }

    Item.findById(id)
        .then(item => {
            if (!item) {
                return res.status(404).send("Item not found.");
            }

            if (item.userId.toString() !== req.session.user._id.toString()) {
                return res.status(403).send("You dont have permission to delete this item");
            }

            return Item.findByIdAndDelete(id);
        })
        .then(result => {
            if (result) {
                res.redirect('/items');
            } else {
                res.status(404).send("Item could not be found right now, please try again later");
            }
        })
        .catch(err => res.status(500).send("Error deleting item, it might not exist"));
};
