'use strict';

var mongoose = require('mongoose');
var bcrypt   = require('bcrypt');
var Schema = mongoose.Schema;

var path = process.cwd();
var Notes=require(path + '/app/models/notes.js');

var User = new Schema({
  github: {
  	id: String,
  	displayName: String,
  	username: String,
    publicRepos: Number
  },
  //Facebook login db schema
  //taken from: https://scotch.io/tutorials/easy-node-authentication-facebook#configuring-passports-facebook-strategy-configpassportjs
  facebook         : {
      id           : String,
      token        : String,
      name         : String
  },
  local             :{
    email           :String,
    password        :String
    
  },
  notes: { type: [Notes.schema], default: [{content:"Weclome to the notes app! Please find the control menu on the bottom right corner."}]}
});

//generate a common user display name
User.virtual('displayName').get(function () {
  var nameToReturn=this.facebook.name;
  var accountType='fb';
  if (nameToReturn === undefined) {
    nameToReturn=this.github.displayName;
    accountType = 'git';
    if (nameToReturn === undefined){
      nameToReturn=this.local.email;
      accountType = 'local';
    }
  }
  return {name:nameToReturn, type:accountType};
});



// generating a hash
User.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
User.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

User.methods.changePassword = function (password) {
  this.local.password = this.generateHash(password);
  //this.set(this.local.password, salt);
}

module.exports = mongoose.model('User', User);
