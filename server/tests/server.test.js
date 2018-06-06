const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

var {app} = require('./../server');
var {Todo} = require('./../models/todo');
var {User} = require('./../models/user');
var {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateTodos);
beforeEach(populateUsers);

describe('Post /todos', () => {
  it('Should create new todo', (done) => {
    var text = 'Test todo text';
    request(app)
      .post('/todos')
      .send({
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      }).end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.find({
          text: text
        }).then((todos) => {
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
      .end((err, res) => {
        if (err) {
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

describe('DELETE /todos/:id', () => {
  it('Should delete individual id', (done) => {
    var hexId = todos[1]._id.toHexString();
    request(app)
      .delete(`/todos/${todos[1]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexId);
      }).end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.findById(hexId).then((todo) => {
          expect(todo).toNotExist();
          done();
        }).catch((e) => done(e));
      });
  });

  it('Should send 404 for no id found', (done) => {
    request(app)
      .delete(`/todos/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('Should send 404 for non object ids', (done) => {
    request(app)
      .delete('/todos/123')
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update todo for a given id', (done) => {
    var text = 'Patch Todo';
    var completed = true;
    request(app)
      .patch(`/todos/${todos[0]._id.toHexString()}`)
      .send({
        text,
        completed
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA('number');
      }).end(done);
  });

  it('should clear completedAt when todo is not completed', (done) => {
    var text = 'Patch Todo false';
    var completed = false;
    request(app)
      .patch(`/todos/${todos[1]._id.toHexString()}`)
      .send({
        text,
        completed
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toNotExist();
      }).end(done);
  });
});

describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.user._id).toBe(users[0]._id.toHexString());
        expect(res.body.user.email).toBe(users[0].email)
      })
      .end(done);
  });
  
  it('should return 401 if unauthorized', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
      expect(res.body.user).toEqual(undefined);
    })
    .end(done);
  })
});

describe('POST /users', () => {
  it('should create new user for valid data', (done) => {
    var email = 'example@example.com';
    var password = 'abc123';
    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) => {
      expect(res.headers['x-auth']).toExist();
      expect(res.body.user._id).toExist();
      expect(res.body.user.email).toBe(email);
    })
      .end((err) => {
      if (err) {
        return done(err);
      }
      
      User.findOne({email}).then((user) => {
        expect(user).toExist();
        expect(user.password).toNotBe(password);
        done();
      }).catch((e) => done(e));
    });
  });
  
  it('should not create user with invalid body', (done) => {
    request(app)
      .post('/users')
      .send({email: 'prajwal', password: ''})
      .expect(400)
      .end(done);
  });
  
  it('should not create user with same email', (done) => {
    request(app)
      .post('/users')
      .send({email: users[0].email, password: 'password'})
      .expect(400)
      .end(done);
  })
});

describe('POST users/login/', () => {
  it('should login user with right credentials', (done) => {
    request(app)
      .post('/users/login')
      .send({email: users[1].email, password: users[1].password})
      .expect(200)
      .expect((res) => {
      expect(res.headers['x-auth']).toExist();
    })
    .end((err, res) => {
      if (err) {
        return done(err);
      }
      
      User.findById(users[1]._id).then((user) => {
        expect(user.tokens[0]).toInclude({
          access: 'auth',
          token: res.headers['x-auth']
        });
        done();
      }).catch((e) => done(e));;
    });
  });
  
  it('should not login with wrong credentials', (done) => {
    request(app)
      .post('/users/login')
      .send({email: 'noemail@test.com', password: '123junk'})
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toNotExist();
      })
      .end((err, res) => {
      if (err) {
        return done(err);
      }
      
      User.findById(users[1]._id).then((user) => {
        expect(user.tokens.length).toBe(0);
        done();
      }).catch((e) => done(e));;
    });
  });
});