var express = require("express");
var router = express.Router();
let { secretKeys } = require("../secretKeys");
const jwt = require("jsonwebtoken");
const { usersCollection } = require("../mongodb/open");

async function fetchUser(params) {
  try {
    // Query for a movie that has the title 'Back to the Future'
    const query = { user_name: params.user_name,password:params.password };
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

/* 注册用户 */
router.post("/register", function (req, res, next) {
  const { user_name, password } = req.body
  //根据文档id 获取文档信息
  usersCollection
    .insertOne({ user_name, password})
    .then((msg) => {
      console.log("用户创建成功", msg);
      res.send({ code: 200, msg: "用户创建成功" });
    })
    .catch((err) => {
      console.log("更新失败", err);
      res.send({ code: 500, msg: "用户创建失败" });
    });
  
});

module.exports = router;
