const express = require("express");
const router = express.Router();
const { upload } = require("../middleware/fileUpload");
const itemController = require("../controllers/itemController");

router.get("/", (req, res) => {
  const searchQuery = req.query.q || ''; 
  res.render("new", { searchQuery: searchQuery }); 
});

router.post("/", upload.single("image"), itemController.create); 

module.exports = router;
