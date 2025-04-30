const Item = require('../models/Item');
exports.isGuest = (req, res, next) => {
    if (!req.session.user) 
        { return next();}
    else{
        req.flash('error', 'You are already logged in');
        return res.redirect('/users/profile');
    }
};


exports.isLoggedIn = (req, res, next) => {
    if (req.session.user) {
        return next();
    } else {
        req.flash('error', 'You must be logged in to view this page.');
        return res.redirect('/users/login');
    }
};

exports.isAuthor = (req, res, next) => {
    let id = req.params.id;

    if (!req.session.user) {
        return res.status(403).send("You must be logged in to access this resource.");
    }

    Item.findById(id)
        .then(item => {
            if (item) {
                if (item.userId.toString() === req.session.user._id.toString()) {
                    return next();
                } else {
                    let err = new Error('Unauthorized access');
                    err.status = 403;
                    return next(err);
                }
            } else {
                let err = new Error('Cannot find an item with id ' + id);
                err.status = 404;
                return next(err);
            }
        })
        .catch(err => {
            console.error("isAuthor error:", err);
            next(err);
        });
};
