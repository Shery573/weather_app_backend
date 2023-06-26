const mongoose = require("mongoose");
const addressSchema = new mongoose.Schema({
    street: String,
    city: String,
})
const userSchema = new mongoose.Schema({
  name: String,
  age: {
    type: Number,
    min: 13,
    max: 260,
    // validate:{
    //     validator: v=> v%2===0,
    //     message: props => `${props.value} is not an even number`
    // }
},
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
  type:  Date,
  immutable: true,
  default: ()=> Date.now()
},
  updatedAt: {
    type:  Date,
    default: ()=> Date.now()
  },
  bestFriend: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
},
  hobbies: [String],
  address: addressSchema
});
userSchema.methods.sayHi = function(){
    console.log(`Hi my name is ${this.name}`)
}

userSchema.statics.findByName  = function(name){
    return this.find({name : new RegExp(name,"i")})
}
userSchema.query.ByName  = function(name){
    return this.where({name : new RegExp(name,"i")})
}

userSchema.virtual('namedEmail').get(function(){
    return `${this.name} <${this.email}>`
})
userSchema.pre('save', function(next){
    this.updatedAt = Date.now();
    next()
})

userSchema.post('save', function(doc, next){
    // this.sayHi()
    next()
})


module.exports = mongoose.model("User", userSchema);
