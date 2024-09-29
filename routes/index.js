var express = require("express");
var router = express.Router();
let { secretKeys } = require("../secretKeys");
const jwt = require("jsonwebtoken");
const { usersCollection } = require("../mongodb/open");

async function fetchUser(params) {
  try {
    // Query for a movie that has the title 'Back to the Future'
    const query = { user_name: params.user_name };
    const user = await usersCollection.findOne(query);
    if (user) {
      //如果找到了,jwt生成token
      const token = jwt.sign(user, secretKeys, {
        expiresIn: "24h",
      });
      const user_info = { ...user, token };
      return user_info;
    } else {
      return {};
    }
  } catch (e) {
    console.log("eee", e);
  }
}

/* GET home page. */
router.get("/getuser", async function (req, res, next) {
  const params = req.query;
  const userInfo = await fetchUser(params);
  res.send(userInfo);
});

module.exports = router;
