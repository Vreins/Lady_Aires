const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
app.use(bodyParser.json());
const mongoose = require('mongoose');

UserRouter.post('/api/generate-otp', expressAsyncHandler(async (req, res) => {
  const email = req.body.email;
//   const username = req.body.username;

  // Generate OTP
  const otp = crypto.randomInt(100000, 999999).toString();

  // Set OTP expiry time (10 minutes)
  const otpExpires = Date.now() + 10 * 60000;

  // Find the user by username
  let user = await User.findOne({email: req.body.email});
  if (!user) {
    return res.status(400).send('User not found');
  }

  // Update user with OTP and expiry
  user.otp = otp;
  user.otpExpires = otpExpires;

  await user.save();

  // Send OTP to user's email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'augustineadah67@gmail.com',
      pass: 'Vreins1993.',
    },
  });

  const mailOptions = {
    from: 'augustineadah67@gmail.com',
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send('Error sending OTP');
    } else {
      res.status(200).send('OTP sent');
    }
  });
})
);



UserRouter.post('verify-otp', expressAsyncHandler(async (req, res) => {
    const { username, otp } = req.body;
  
    const user = await User.findOne({ email: req.body.email });
  
    if (!user) {
      return res.status(400).send('User not found');
    }
  
    if (Date.now() > user.otpExpires) {
      return res.status(400).send('OTP has expired');
    }
  
    if (otp === user.otp) {
      user.isVerified = true;
      user.otp = undefined; // Clear OTP after verification
      user.otpExpires = undefined;
      await user.save();
      return res.status(200).send('OTP verified and user is now verified');
    } else {
      return res.status(400).send('Invalid OTP');
    }
  }));