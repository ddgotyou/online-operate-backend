var express = require("express");
var router = express.Router();
const { docsCollection } = require("../mongodb/open");
const { ObjectId } = require("mongodb");

/* GET edit doc */
router.get("/get_doc", async function (req, res, next) {
  const { doc_id } = req.query;
  if (!doc_id) {
    res.send("无效文档id");
  } else {
    const doc_objectid = new ObjectId(doc_id);
    //根据文档id 获取文档信息
    const doc = await docsCollection.findOne({ _id: doc_objectid });
    if (doc) {
      res.status(200).send(doc);
    } else {
      res.status(200).send("文档不存在");
    }
  }
});

//编辑文档内容
router.post("/update_doc_content", function (req, res, next) {
  const { doc_id, content } = req.body;
  console.log(req.body);
  if (!doc_id) {
    res.send("无效文档id");
  } else {
    const doc_objectid = new ObjectId(doc_id);
    //根据文档id 获取文档信息
    docsCollection
      .updateOne({ _id: doc_objectid }, { $set: { content: content } })
      .then((res) => {
        console.log("更新成功", res);
      })
      .catch((err) => {
        console.log("更新失败", err);
      });
  }
});

module.exports = router;
