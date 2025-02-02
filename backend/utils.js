import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

// const { JWT_SECRET } = process.env.JWT_SECRET || 'somethingsecret';

export const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length); 
    jwt.verify(
      token,
      process.env.JWT_SECRET || 'somethingsecret',
      (err, decode) => {
        if (err) {
          res.status(401).send({ message: 'Invalid Token' });
        } else {
          req.user = decode;
          next();
        }
      }
    );
  } else {
    res.status(401).send({ message: 'No Token' });
  }
};
// module.exports = { isAuth };

dotenv.config()
export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isSeller: user.isSeller,
    },
    process.env.JWT_SECRET || 'somethingsecret',
    {
      expiresIn: '30d',
    }
  );
};

export const sendEmail= async(email,subject, text)=>{
  try{
    const smtpConfig= {
      service:"gmail",
      host:'smtp.gmail.com',
      port: 465,
      secure:true,
      secureConnection: false,
      logger: true,
      debug:true,
      // ignoreTLS : true,
      // requireTLS: false,
      // tls :{
      //   rejectUnAuthorized: true,
      // },
      auth: {
        user: "adahaugustine384@gmail.com",
        pass:"Vreins1993"
      }
    }
    const transporter=nodemailer.createTransport(
    smtpConfig)
    await transporter.sendMail({
      from:"augustineadah806@gmail.com",
      to:email,
      subject:subject,
      text: text
    })
    console.log("email sent successfully")
  } catch (error) {
    console.log("email not sent")
    console.log(error)
    return error;
  }
}

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).send({ message: 'Invalid Admin Token' });
  }
};

export const isSeller = (req, res, next) => {
  if (req.user && req.user.isSeller) {
    next();
  } else {
    res.status(401).send({ message: 'Invalid Seller Token' });
  }
};

export const isSellerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.isSeller || req.user.isAdmin)) {
    next();
  } else {
    res.status(401).send({ message: 'Invalid Admin/Seller Token' });
  }
};