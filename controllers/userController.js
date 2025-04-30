const model = require('../models/user');
const Item = require('../models/Item');
const Offer = require('../models/offer');
exports.new = (req, res) => {
  res.render('./user/new');
};

exports.create = (req, res, next) => {
  const user = new model(req.body);
  user.save()
    .then(() => res.redirect('/users/login'))
    .catch(err => {
      console.error('Error creating user:', err);
      if (err.name === 'ValidationError') {
        req.flash('error', err.message);
        return res.redirect('/users/new');
      }
      if (err.code === 11000) {
        req.flash('error', 'Email has already been used');
        return res.redirect('/users/new');
      }
      next(err);
    });
};

// GET /users/login - show login form
exports.getUserLogin = (req, res) => {
  res.render('./user/login');
};

exports.login = (req, res, next) => {
  const { email, password } = req.body;

  model.findOne({ email })
    .then(user => {
      if (!user) {
        req.flash('error', 'Wrong email address');
        return res.redirect('/users/login');
      }

      user.comparePassword(password)
        .then(result => {
          if (result) {
            req.session.user = {
              _id: user._id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email
            };

            req.flash('success', 'You have successfully logged in');
            req.session.save(err => {
              if (err) return next(err);
              res.redirect('/users/profile');
            });
          } else {
            req.flash('error', 'Wrong password');
            return res.redirect('/users/login');
          }
        });
    })
    .catch(err => {
      console.error('Login error:', err);
      next(err);
    });
};

exports.profile = async (req, res, next) => {
  const userId = req.session.user._id;

  try {
    const user = await User.findById(userId);
    const items = await Item.find({ userId });
    const offersMade = await Offer.find({ user: userId }).populate('item');
    const offersReceived = await Offer.find({}).populate({
      path: 'item',
      match: { userId: userId }
    });

    res.render('users/profile', {
      user,
      items,
      offersMade,
      offersReceived: offersReceived.filter(o => o.item !== null)
    });
  } catch (err) {
    next(err);
  }
};
