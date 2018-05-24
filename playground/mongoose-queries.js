const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {User} = require('./../server/models/user');

var id = '5b03f53918a52d2a583e7384';

if(!ObjectID.isValid(id)) {
  console.log('Id is not valid!');
}

User.findById(id).then((user) => {
  if(!user) {
    return console.log('User not found');
  }
  console.log('User', user);
}).catch((e) => console.log(e));