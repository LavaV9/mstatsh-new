const Offer = require('../models/offer');
const Item = require('../models/Item');

exports.makeOffer = async (req, res, next) => {
  const itemId = req.params.id;
  const offerAmount = parseFloat(req.body.amount);
  const userId = req.session.user._id;

  try {
    const item = await Item.findById(itemId);

    if (!item) {
      req.flash('error', 'Item not found');
      return res.redirect('/items');
    }

    if (!item.active) {
      req.flash('error', 'This listing is no longer active.');
      return res.redirect(`/items/${itemId}`);
    }

    if (item.userId.toString() === userId.toString()) {
      req.flash('error', 'You cannot make an offer on your own item.');
      return res.redirect(`/items/${itemId}`);
    }

    const offer = new Offer({
      item: itemId,
      user: userId,
      amount: offerAmount
    });

    await offer.save();

    await Item.findByIdAndUpdate(
      itemId,
      {
        $max: { highestOffer: offer.amount },
        $inc: { totalOffers: 1 }
      },
      { new: true }
    );

    req.flash('success', 'Offer submitted successfully');
    res.redirect(`/items/${itemId}`);
  } catch (err) {
    next(err);
  }
};

exports.viewOffers = async (req, res, next) => {
  const itemId = req.params.id;

  try {
    const item = await Item.findById(itemId).populate('userId');
    if (!item) {
      req.flash('error', 'Item not found');
      return res.redirect('/items');
    }

    const offers = await Offer.find({ item: itemId }).populate('user');
    res.render('offer/view', { item, offers });
  } catch (err) {
    next(err);
  }
};

exports.acceptOffer = async (req, res, next) => {
  const offerId = req.params.offerId;

  try {
    const offer = await Offer.findById(offerId).populate('item');
    if (!offer) {
      req.flash('error', 'Offer not found');
      return res.redirect('/items');
    }

    const itemId = offer.item._id;

    await Offer.updateMany({ item: itemId }, { $set: { status: 'rejected' } });
    offer.status = 'accepted';
    await offer.save();

    await Item.findByIdAndUpdate(itemId, { active: false });

    req.flash('success', 'Offer accepted and listing closed');
    res.redirect(`/items/${itemId}`);
  } catch (err) {
    next(err);
  }
};
