import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import data from '../data.js';
import User from '../models/userModel.js';
import {validate_reg} from '../models/userModel.js'
import Token from '../models/tokenModel.js'
import Joi from 'joi'
import  dotenv from 'dotenv'

// dotenv.config()
// import { generateToken } from '../utils.js';
const userRouter = express.Router();
// import nodemailer from 'nodemailer'
import crypto from 'crypto'
import {sendEmail, isAdmin, isAuth} from "../utils.js"

userRouter.get('/seed',
  expressAsyncHandler(async (req, res) => {
    await User.deleteMany({});
    const createdUsers = await User.insertMany(data.users);
    res.send({ createdUsers });
  })
);

export const validate = (data) => {
  const schema=Joi.object({
    email:Joi.string().required().label("Email"),
    password: Joi.string().required().label("Password"),

  });
  return schema.validate(data)
}

userRouter.post(
  '/signin',
  expressAsyncHandler(async (req, res) => {
    try{
      const {error} = validate(req.body);
      if (error) {
        return res.status(400).send({message:error.details[0].message})
      }
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).send({message: "Invalid Email or Password"})}
    const validPassword= await bcrypt.compare(req.body.password, user.password)
    if (!validPassword) {
      return res.status(401).send({message: "Invalid Email or Password"})}
    if (!user.verified) {
      let token= await Token.findOne({userId: user._id})
      if(!token) {
        token= await new Token({
          userId:user._id,
          token:crypto.randomBytes(32).toString("hex"),
        }).save()
        const url = `${process.env.BASE_URL}/users/${user.id}/verify/${token.token}`
        await sendEmail(user.email, "Verify Email", url)
      }
      return res.status(400).send({message: "An email has been sent to your account, please verify"})
    }
    // const token= user.generateAuthToken();
    res.status(200).send({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isSeller: user.isSeller,
      token: user.generateAuthToken(),
      message: "logged_in successfully",
    })
    } catch (error) {
      res.status(500).send({message: error.message})
    }
  })
)

userRouter.get('/list', expressAsyncHandler(async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: 'Email query parameter is required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const shippingAddresses = user.shippingAddresses || [];
    res.status(200).json(shippingAddresses);
  } catch (err) {
    console.error('Error fetching addresses:', err.message);
    res.status(500).json({ message: 'Error fetching addresses', error: err.message });
  }
})
);



userRouter.get(
  '/:id',
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      res.send(user);
    } else {
      res.status(404).send({ message: 'User Not Found' });
    }
  })
);


userRouter.post('/save', async (req, res) => {
  const { fullName, address, city, postalCode, country, state, location, email } = req.body;

  try {
    // Use email to find the user
    const user = await User.findOne({ email }); // Find user by email
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the address already exists in the user's shippingAddresses
    const existingAddress = user.shippingAddresses.some((savedAddress) => 
      savedAddress.fullName === fullName &&
      savedAddress.address === address &&
      savedAddress.city === city &&
      savedAddress.postalCode === postalCode &&
      savedAddress.country === country &&
      savedAddress.state === state &&
      savedAddress.location === location
    );

    // If the address already exists, don't add it again, just return success
    if (existingAddress) {
      return res.status(200).json({ message: 'Shipping address already exists' });
    }

    // Add the new shipping address
    user.shippingAddresses.push({ fullName, address, city, postalCode, country, state, location });
    await user.save();

    res.status(200).json({ message: 'Shipping address saved successfully' });
  } catch (err) {
    console.error('Error saving address:', err);
    res.status(500).json({ message: 'Error saving address' });
  }
});


userRouter.delete('/address', async (req, res) => {
  const { fullName, address, city, postalCode, country, state, location, email } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the index of the address to be deleted
    const addressIndex = user.shippingAddresses.findIndex(
      (savedAddress) =>
        savedAddress.fullName === fullName &&
        savedAddress.address === address &&
        savedAddress.city === city &&
        savedAddress.postalCode === postalCode &&
        savedAddress.country === country &&
        savedAddress.state === state &&
        savedAddress.location === location
    );

    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Remove the address from the user's shippingAddresses array
    user.shippingAddresses.splice(addressIndex, 1);
    await user.save();

    res.status(200).json({ message: 'Address deleted successfully' });
  } catch (err) {
    console.error('Error deleting address:', err);
    res.status(500).json({ message: 'Error deleting address' });
  }
});


userRouter.post(
  '/register',
  expressAsyncHandler(async (req, res) => {
    try {
          // const {error} = validate_reg(req.body);
          // if (error) {
          // return res.status(400).send({message:error.details[0].message})
          // }
          const exist = await User.findOne({ email: req.body.email })
          if (exist){
          res.status(409).send({ message: 'Email Exist, Please use another unique email' });
          }
          console.log("Email does not exist")
    // else{
    //   const user = new User({
    //     name: req.body.name,
    //     email: req.body.email,
    //     password: bcrypt.hashSync(req.body.password, 8),
    //   });
    //   const createdUser = await user.save();
    //   res.send({
    //     _id: createdUser._id,
    //     name: createdUser.name,
    //     email: createdUser.email,
    //     isAdmin: createdUser.isAdmin,
    //     isVerified: createdUser.isVerified,
    //     token: generateToken(createdUser),
    //   });
    // }
          const salt = await bcrypt.genSalt(Number(process.env.SALT))
          const hashPassword= await bcrypt.hash(req.body.password, salt)
          const user = await new User({
          name: req.body.name,
          email: req.body.email,
          password: hashPassword,
          isAdmin: req.body.isAdmin,
          isSeller: req.body.isSeller,
          }).save();
          console.log("user saved")
          const token= await new Token ({
          userId:user._id,
          token: crypto.randomBytes(32).toString("hex"),
          }).save()
          const url = `${process.env.BASE_URL}/users/${user._id}/verify/${token.token}`
          await sendEmail(user.email, "Verify Email", url)
          res.status(201).send({message: "An email has been sent to your account, please verify"})
        } catch (error) {
          console.log(error);
          res.status(500).send({message: "Internal Server Error"})
        }

  })
);

userRouter.get("/:id/verify/:token/", expressAsyncHandler(async (req, res) => {
  try{
    const user= await User.findOne({_id:req.params.id})
    if (!user) {
      return res.status(400).send({message: "Invalid Link"});
    }
    const token = await Token.findOne({
      userId:user._id,
      token: req.params.token
    })
    if (!token) {
      return res.status(400).send({message: "Invalid Link"});
    }
    await User.updateOne({_id:user._id,verified:true})
    await token.remove()

    res.status(200).send({message: "Email verified successfully"})
  } catch (error) { res.status(500).send({message: "Internal Server Error"})

  }
  })
)
// userRouter.post('/generate-otp', expressAsyncHandler(async (req, res) => {
//   const email = req.body.email;
// //   const username = req.body.username;

//   // Generate OTP
//   const otp = crypto.randomInt(100000, 999999).toString();

//   // Set OTP expiry time (10 minutes)
//   const otpExpires = Date.now() + 10 * 60000;

//   // Find the user by username
//   let user = await User.findOne({email: req.body.email});
//   if (!user) {
//     return res.status(400).send('User not found');
//   }

//   // Update user with OTP and expiry
//   user.otp = otp;
//   user.otpExpires = otpExpires;

//   await user.save();

//   // Send OTP to user's email
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: 'augustineadah67@gmail.com',
//       pass: 'Vreins1993.',
//     },
//   });

//   const mailOptions = {
//     from: 'augustineadah67@gmail.com',
//     to: 'augustineadah806@gmail.com',
//     subject: 'Your OTP Code',
//     text: `Thank you for registering at FlairIt
//     Your OTP code is ${otp}. It will expire in 10 minutes.`,
//   };

//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       console.error(error);
//       res.status(500).send('Error sending OTP');
//     } else {
//       res.status(200).send('OTP sent');
//     }
//   });
// })
// );


// userRouter.post('/verify-otp', expressAsyncHandler(async (req, res) => {
//     const { email, otp } = req.body;
  
//     const user = await User.findOne({ email: req.body.email });
  
//     if (!user) {
//       return res.status(400).send('User not found');
//     }
  
//     if (Date.now() > user.otpExpires) {
//       return res.status(400).send('OTP has expired');
//     }
  
//     if (otp === user.otp) {
//       user.isVerified = true;
//       user.otp = undefined; // Clear OTP after verification
//       user.otpExpires = undefined;
//       await user.save();
//       return res.status(200).send('OTP verified and user is now verified');
//     } else {
//       return res.status(400).send('Invalid OTP');
//     }
//   }));



userRouter.put(
  '/profile',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (user.isSeller) {
        user.seller.name = req.body.sellerName || user.seller.name;
        user.seller.logo = req.body.sellerLogo || user.seller.logo;
        user.seller.description =
          req.body.sellerDescription || user.seller.description;
      }

      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, 8);
      }
      const updatedUser = await user.save();
      res.send({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        isSeller: user.isSeller,
        token: crypto.randomBytes(32).toString("hex"),
      });
    }
  })
);

userRouter.get(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const users = await User.find({});
    res.send(users);
  })
);

userRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      if (user.email === 'admin@example.com') {
        res.status(400).send({ message: 'Can Not Delete Admin User' });
        return;
      }
      const deleteUser = await User.findByIdAndDelete(req.params.id);
      res.send({ message: 'User Deleted', user: deleteUser });
    } else {
      res.status(404).send({ message: 'User Not Found' });
    }
  })
);

userRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name === user.name ? user.name : req.body.name;
      user.email = req.body.email || user.email;
       user.isSeller = Boolean(req.body.isSeller);
      user.isAdmin = Boolean(req.body.isAdmin);
      // user.isAdmin = req.body.isAdmin || user.isAdmin;
      // user.isAdmin = req.body.isAdmin || user.isAdmin;
      user.verified = req.body.verified === undefined ? user.verified : req.body.verified; // Add this line
      const updatedUser = await user.save();
      res.send({ message: 'User Updated', user: updatedUser });
    } else {
      res.status(404).send({ message: 'User Not Found' });
    }
  })
);

export default userRouter;