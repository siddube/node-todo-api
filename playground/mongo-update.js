const {
  MongoClient,
  ObjectID
} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if (err) {
    return console.log('Unable to connect to DB');
  }
  const db = client.db('TodoApp');

  /*db.collection('Todos').findOneAndUpdate({
  _id: new ObjectID('5b03c25011af912b80165ff1')
}, {
  $set: {
    completed: true
  }
}, {
  returnOriginal: false
}).then((res) => {
  console.log(res);
}, (err) => {
  console.log(err);
});*/

  db.collection('Users').findOneAndUpdate({
    _id: new ObjectID('5b03cdafc6c7cb14c4e5ccda')
  }, {
    $set: {
      name: 'Gayathri'
    },
    $inc: {
      age: +1
    }
  }, {
    returnOriginal: false
  }).then((res) => {
    console.log(res);
  }, (err) => {
    console.log(err);
  });
  //client.close();
});
