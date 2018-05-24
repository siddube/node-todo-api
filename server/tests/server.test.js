const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

var {app} = require('./../server');
var {Todo} = require('./../models/todo');

const todos = [{
  _id: new ObjectID(),
  text: 'First Todo'
}, {
  _id: new ObjectID(),
  text: 'Second Todo'
}];

beforeEach((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
});

describe('Post /todos', () => {
  it('Should create new todo', (done) => {
    var text = 'Test todo text';
    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
    }).end((err, res) => {
      if (err) {
        return done(err);
      }
      Todo.find({text: text}).then((todos) => {
        expect(todos.length).toBe(1);
        expect(todos[0].text).toBe(text);
        done();
      }).catch((e) => done(e));
    });
  });
  it('Should not create todo with bad data', (done) => {
    request(app)
      .post('/todos')
      .send()
      .expect(400)
      .end((err,res) => {
      if(err) {
        return done(err);
      }
      
      Todo.find().then((todos) => {
        expect(todos.length).toBe(2);
        done();
      }).catch((e) => done(e));
    });
  });
});

describe('GET /todos', () => {
  it('Should fetch all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
      expect(res.body.todos.length).toBe(2);
    }).end(done);
  });
});

describe('GET /todos/:id', () => {
  it('Should fetch individual id', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
      expect(res.body.todo.text).toBe(todos[0].text);
    }).end(done);
  });
  
  it('Should send 404 for no id found', (done) => {
    request(app)
      .get(`/todos/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
  });
  
  it('Should send 404 for non object ids', (done) => {
    request(app)
      .get('/todos/123')
      .expect(404)
      .end(done);
  });
});