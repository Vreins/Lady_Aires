import multer from 'multer';
import express from 'express';
import { isAuth } from '../utils.js';
const uploadRouter = express.Router();
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}.jpg`);
  },
});
const upload = multer({ storage });

uploadRouter.post('/multiple', isAuth, upload.array('images', 10), (req, res) => {
    // Return an array of uploaded file paths
    const filePaths = req.files.map((file) => `/${file.path}`);
    res.send(filePaths);
  });

// uploadRouter.post('/', isAuth, upload.single('image'), (req, res) => {
//   res.send(`/${req.file.path}`);
// });
export default uploadRouter;