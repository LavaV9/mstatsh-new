const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    const searchQuery = req.query.q || '';  
    res.render("index", { searchQuery: searchQuery }); 
});


module.exports = router;
