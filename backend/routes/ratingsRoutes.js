const express = require("express");
const router = express.Router();
const ratingsController = require("../controllers/ratingsController");

router.get("/", ratingsController.getRatings);
router.post("/", ratingsController.postRating);

module.exports = router;
