const mongoose = require('mongoose');
const User = require('../models/User.model.js');
const bcrypt = require('bcrypt');
const bcryptSalt = 10;
const salt = bcrypt.genSaltSync(bcryptSalt);

mongoose.connect('mongodb://localhost/passport-roles');
User.collection.drop();

const users = [{
  username: "gm",
  password: bcrypt.hashSync('1234', salt),
  role: 'BOSS'
},{
  username: "jamie",
  password: bcrypt.hashSync('999', salt),
  role: 'STUDENT'
}];

User.create(users, (err) => {
  if (err) { throw(err) }
  console.log(`Created ${users.length} users`)
  mongoose.connection.close();
});