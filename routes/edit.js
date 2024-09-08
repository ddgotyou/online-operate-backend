var express = require("express");
var router = express.Router();

/* GET edit doc */
router.get("/get_doc", function (req, res, next) {
  res.send("document");
});

module.exports = router;
