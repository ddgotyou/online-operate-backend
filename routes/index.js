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

/* 获取某个用户的信息. */
router.get("/getUser", async function (req, res, next) {
  const params = req.query;
  const userInfo = await fetchUser(params);
  res.send(userInfo);
});

/* 获取所有用户的信息. */
router.get("/getUserList", async function (req, res, next) {
  const userList = await usersCollection.find().toArray();
  res.send(userList);
});

module.exports = router;
