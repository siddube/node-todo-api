const MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if (err) {
    return console.log('Unable to connect to DB');
  }
  const db = client.db('TodoApp');

  db.collection('Todos').insertOne({
    text: 'My Second Todo',
    completed: false
  }, (err, res) => {
    if (err) {
      return console.log('Unable to insert todo');
    }
    console.log(JSON.stringify(res.ops, undefined, 2));
  });

  db.collection('Users').insertOne({
    name: 'Prajwal',
    age: 28,
    location: 'Bengaluru'
  }, (err, res) => {
    if (err) {
      return console.log('Unable to insert Users');
    }
    console.log(JSON.stringify(res.ops, undefined, 2));
  });

  client.close();
});
