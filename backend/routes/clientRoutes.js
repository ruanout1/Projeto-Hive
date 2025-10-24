const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");

router.get("/current-service", clientController.getCurrentService);
router.get("/history", clientController.getServiceHistory);
router.get("/timeline", clientController.getTimeline);
router.get("/service-notes", clientController.getServiceNotes);

module.exports = router;
