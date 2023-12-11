
require('dotenv').config()

const sharp = require('sharp') 
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto')
const todoModel = require('../model/todoModel');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner"); 
const imageModel = require('../model/imageModel');

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey
  }
})

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

const AddImage = async (req, res) => {
  try {
    const file = req.file 

    const fileBuffer = await sharp(file.buffer)
      .resize({ height: 1920, width: 1080, fit: "contain" })
      .toBuffer()

    // Configure the upload details to send to S3
    const fileName = generateFileName()
    const uploadParams = {
      Bucket: bucketName,
      Body: fileBuffer,
      Key: fileName,
      ContentType: file.mimetype
    }

    // Send the upload to S3
    await s3Client.send(new PutObjectCommand(uploadParams))

    // Save the image name to the database. Any other req.body data can be saved here too but we don't need any other image data.
    const { email } = req.body
   

   const newImage = new imageModel({
    email,
    image:fileName
   });
   const imageData = await newImage.save()
    imageData.image = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: bucketName,
        Key: fileName
      }),
      { expiresIn: 3600 } // 60 seconds
    )

    res.status(200).json(imageData.image)
  } catch (error) {
    console.log(error);
  }
}
const getImage = async(req, res) => {
  const email = req.query.email; // Get email from query parameters

  try {
    const profileImage = await imageModel.findOne({ email }); // Use findOne to get a single document
    if (profileImage) {
      const signedUrl = await getSignedUrl(
        s3Client,
        new GetObjectCommand({
          Bucket: bucketName,
          Key: profileImage.image // Use the image key stored in the database
        }),
        { expiresIn: 3600 } // 1 hour
      );

      res.status(200).json(signedUrl);
    } else {
      const image = "frame-8@2x.jpg";
      res.status(200).json(image);
    }
  } catch (error) {
    res.status(400).json("error occurred");
  }
};

const postTask = async (req, res) => {
  const { email, task } = req.body
  try {
    const taskDetail = await todoModel.find({ email })
    if (taskDetail.length > 0) {

      console.log(taskDetail)
      return res.status(200).json(taskDetail)
    } else {
      const newTask = new todoModel({
        email,
        task
      })
      const data = await newTask.save()
      return res.status(200).json(data)
    }
  } catch (error) {
    res.status(400).json('failed to activated')
    console.log(error)
  }
}

const updateTask = async (req, res) => {
  const { email, task } = req.body
  try {
    const taskData = await todoModel.findOneAndUpdate({ email }, { $push: { task } }, { new: true })
    return res.status(200).json(taskData)
  } catch (error) {
    return res.status(400).json('failed to update')   
  }
}
const deleteTask = async (req, res) => {
  const {index,email} = req.body
  console.log(index,email)
  try {
    const user = await todoModel.findOne({ email });
    if (!user) {
      return res.status(404).json('User not found');
    }
  
    user.task.splice(index, 1);
    await user.save();
  
    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json('Failed to update');
  }
}  

module.exports = { AddImage, postTask, updateTask,getImage,deleteTask }
