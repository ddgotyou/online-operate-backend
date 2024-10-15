const { MongoClient } = require("mongodb");
const uri = "mongodb+srv://root:020107@cluster0.l2pf5.mongodb.net/";
const client = new MongoClient(uri);

const database = client.db("operate-development");
const usersCollection = database.collection("user");
const docsCollection = database.collection("docs");
//操作日志存储
const logCollection = database.collection("oplog");

module.exports = {
  database,
  usersCollection,
  docsCollection,
  logCollection,
};
