const mongoose = require('mongoose');

exports.validateId = (req, res, next) => {
    const id = req.params.id;
    if (mongoose.Types.ObjectId.isValid(id)) {
        return next();
    } else {
        let err = new Error('Invalid story id');
        err.status = 400;
        return next(err);
    }
};
