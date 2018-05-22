const {
  MongoClient,
  ObjectID
} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if (err) {
    return console.log('Unable to connect to DB');
  }
  const db = client.db('TodoApp');

  db.collection('Users').deleteMany({
    name: 'Prajwal'
  }).then((result) => {
    console.log(result);
  }, (err) => {
    console.log(err);
  });

  db.collection('Users').findOneAndDelete({
    _id: new ObjectID('5b03c25011af912b80165ff2')
  }).then((res) => {
    console.log(JSON.stringify(res, undefined, 2));
  }, (err) => {
    console.log(err);
  });;
  //client.close();
});
