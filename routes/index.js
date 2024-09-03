var express = require("express");
var router = express.Router();
let { secretKeys } = require("../secretKeys");
const jwt = require("jsonwebtoken");

const { MongoClient } = require("mongodb");
const uri = "mongodb+srv://root:020107@cluster0.l2pf5.mongodb.net/";
const client = new MongoClient(uri);
async function fetchUser(params) {
  try {
    const database = client.db("operate-development");
    const users = database.collection("user");
    // Query for a movie that has the title 'Back to the Future'
    const query = { user_name: params.user_name };
    const user = await users.findOne(query);
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
  // res.render('index', { title: 'Express' });
});

module.exports = router;
