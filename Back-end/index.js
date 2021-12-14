"use strict";
import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import joi from "joi";
import jwt from "jsonwebtoken";
import bcrypt, { compare } from "bcrypt";
import { PORT, MONGO_CONNECTION_STRING, TOKEN_SECRET } from "./config.js";
import { ObjectId, ObjectID } from "bson";
import { auth } from "./middlewares.js";

const client = new MongoClient(MONGO_CONNECTION_STRING);

const app = express();
app.use(cors());
app.use(express.json());

app.post("/register", async (req, res) => {
  const body = req.body;
  const schema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(8).required(),
  });
  let connection;
  try {
    connection = await client.connect();
  } catch {
    res.status(500).send({ success: false, error: "Internal server error" });
  }
  try {
    const user = await connection.db("Project3").collection("users").findOne({
      email: body.email,
    });
    if (user) {
      res.status(400).send({ success: false, error: "Email taken" });
      return;
    }
  } catch (e) {
    console.log(e);
    res.status(500).send({ success: false, error: "Internal server error" });
    return;
  }
  try {
    await schema.validateAsync(body);
  } catch (e) {
    console.log(e);
    res.status(400).send({ success: false, error: e.details[0].message });
  }
  const passwordHash = bcrypt.hashSync(body.password, 10);
  try {
    await connection.db("Project3").collection("users").insertOne({
      email: body.email,
      password: passwordHash,
    });
    await connection.close();
  } catch (e) {
    console.log(e);
    res.status(500).send({ success: false, error: "Could not create user" });
    return;
  }
  res.send({ success: true });
});
app.post("/login", async (req, res) => {
  const body = req.body;
  try {
    const connection = await client.connect();
    const user = await connection
      .db("Project3")
      .collection("users")
      .findOne({ email: body.email });

    if (!user) {
      res.send({ success: false, error: "User not found" });
      return;
    }
    const doPasswordsMatch = bcrypt.compareSync(body.password, user.password);

    if (doPasswordsMatch) {
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        TOKEN_SECRET,
        {
          expiresIn: 12000,
        }
      );
      res.send({ success: true, token });
    } else {
      res.send({ success: false, error: "Incorrect password" });
    }
  } catch (e) {
    console.log(e);
    res.status(500).send({ success: false, error: "Internal server error" });
    return;
  }
});
app.get("/userInfo", auth, async (req, res) => {
  try {
    const connection = await client.connect();
    const user = await connection
      .db("Project3")
      .collection("users")
      .findOne({ _id: ObjectID(req.userId) });

    if (!user) {
      res.send({ success: false, error: "User not found" });
      return;
    }
    res.send(user);
  } catch (e) {
    console.log(e);
    res.status(500).send({ success: false, error: "Internal server error" });
    return;
  }
});

app.get("/posts", async (req, res) => {
  try {
    const connection = await client.connect();
    const posts = await connection
      .db("Project3")
      .collection("posts")
      .find({})
      .toArray();
    res.send(posts);
  } catch (e) {
    console.log(e);
    res.send({ success: false, error: "Internal server error" });
  }
});
app.post("/posts", auth, async (req, res) => {
  //Get userId from token info
  try {
    const connection = await client.connect();
    const user = connection
      .db("Project3")
      .collection("users")
      .findOne({
        _id: ObjectID(req.userId),
      });
    if (!user) {
      res.send({ success: false, error: "User not found" });
      return;
    } else {
      const userId = ObjectID(req.userId);
      const email = req.email;
      const createdAt = new Date().getTime();
      const { title, body } = req.body;
      const newPost = { title, userId, createdAt, userId, body, email };
      const schema = joi.object({
        email: joi.string().email().required(),
        userId: joi.required(),
        title: joi.string().max(50).required(),
        body: joi.string().max(500).required(),
        createdAt: joi.required(),
      });
      const isValid = schema.validate(newPost);
      if (isValid.error) {
        res
          .status(400)
          .send({ success: false, error: isValid.error.details[0].message });
      } else {
        const note = connection
          .db("Project3")
          .collection("posts")
          .insertOne(newPost);
        res.send({ success: true, note: newPost });
        return;
      }
    }
  } catch (e) {
    console.log(e);
    res.status(500).send({ success: false, error: "Internal server error" });
  }
});
app.get("/posts/user", auth, async (req, res) => {
  try {
    const userId = ObjectID(req.userId);
    const connection = await client.connect();
    const userPosts = await connection
      .db("Project3")
      .collection("posts")
      .find({
        userId: userId,
      })
      .toArray();
    res.send(userPosts);
  } catch (e) {
    console.log(e);
    res.status(500).send({ success: false, error: "Internal server error" });
  }
});
app.delete("/posts/:postId", auth, async (req, res) => {
  try {
    const connection = await client.connect();
    const userId = ObjectID(req.userId);
    const postId = ObjectID(req.params.postId);
    // console.log(postId);
    // const isUserPost = await connection
    //   .db("Prjoect3")
    //   .collection("posts")
    //   .findOne({ userId: userId, _id: postId });
    // console.log(isUserPost);
    // if (isUserPost) {
    //   console.log(isUserPost);
    const data = await connection.db("Project3").collection("posts").deleteOne({
      _id: postId,
      userId: userId,
    });
    res.send({ success: true, message: "Post Deleted" });
    // } else {
    //   res.send({ success: false, error: "Post not Found" });
    // }
  } catch (e) {
    console.log(e);
    res.status(500).send({ success: false, error: "Inteernal server error" });
  }
});
// app.get("/posts/:userId", auth, async (req, res) => {
//   try {
//     const userId = req.userId;
//     const connection = await client.connect();
//     const userPosts = await connection
//       .db("Project3")
//       .collection("posts")
//       .find({ userId: userId })
//       .toArray();
//     res.send(userPosts);
//   } catch (e) {
//     console.log(e);
//     res.status(500).send({ success: false, message: "Internal server error" });
//   }
// });
app.listen(PORT, () => {
  console.log(`App listening on port: ${PORT}`);
});
