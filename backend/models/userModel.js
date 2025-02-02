import mongoose from 'mongoose';
import jwt from 'jsonwebtoken'
import Joi from 'joi'
import passwordComplexity from 'joi-password-complexity'

const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  state: { type: String, required: true },
  location: { type: String, required: true },
},{_id:true});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false, required: true },
    isSeller: { type: Boolean, default: false, required: true },    
    seller: {
      name: String,
      logo: String,
      description: String,
      rating: { type: Number, default: 0, required: true },
      numReviews: { type: Number, default: 0, required: true },
    },
    verified: { type: Boolean, default: false},
    shippingAddresses: [addressSchema],
  },
  {
    timestamps: true,
  }
);

userSchema.methods.generateAuthToken=function () {
  const token= jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email,
      isAdmin: this.isAdmin,
      isSeller:this.isSeller,
    },
    process.env.JWT_SECRET || 'somethingsecret',
    {
      expiresIn: '7d',
    }
  );
  return token
};

const User = mongoose.model('User', userSchema);

export const validate_reg = (data) => {
  const schema=Joi.object({
    name:Joi.string().required().label("Name"),
    email:Joi.string().required().label("Email"),
    password: passwordComplexity().required().label("Password"),

  });
  return schema.validate(data)
}
export default User;