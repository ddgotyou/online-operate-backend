var express = require("express");
var router = express.Router();

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
    console.log("uuu", user);
    return user;
  } catch (e) {
    console.log("eee", e);
  }
}

/* GET home page. */
router.get("/getuser", async function (req, res, next) {
  const params = req.query;
  console.log(req.query);
  const userInfo = await fetchUser(params);

  res.send(userInfo);
  // res.render('index', { title: 'Express' });
});

module.exports = router;
