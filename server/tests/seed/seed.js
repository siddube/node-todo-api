const jwt = require('jsonwebtoken');
const {ObjectID} = require('mongodb');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const users = [{
  _id: userOneId,
  email: 'prajwal@example.com',
  password: 'UserOnePass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth'}, 'pass').toString()
  }]
},{
  _id: userTwoId,
  email: 'gayathri@example.com',
  password: 'UserTwoPass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userTwoId, access: 'auth'}, 'pass').toString()
  }]
}
];
const todos = [{
  _id: new ObjectID(),
  text: 'First Todo',
  _creator: userOneId
}, {
  _id: new ObjectID(),
  text: 'Second Todo',
  _creator: userTwoId
}];

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();
    return Promise.all([userOne, userTwo]).then(() => done());
  })
};

module.exports = {todos, populateTodos, users, populateUsers}