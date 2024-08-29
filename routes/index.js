var express = require('express');
var router = express.Router();

const {MongoClient} = require('mongodb');
const uri = "mongodb+srv://root:020107@cluster0.l2pf5.mongodb.net/";
const client = new MongoClient(uri);
async function fetchUser() {
  try {
    const database = client.db('operate-development');
    const users = database.collection('user');
    // Query for a movie that has the title 'Back to the Future'
    const query = { user_name: 'ddgotyou' };
    const user = await users.findOne(query);
    return user
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();

  }
}

/* GET home page. */
router.get('/getuser', function(req, res, next) {
  const userInfo= fetchUser()
  console.log(userInfo)
  res.send(userInfo)
  // res.render('index', { title: 'Express' });
});

module.exports = router;
