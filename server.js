require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const bodyParser = require("body-parser");
const pdf = require("html-pdf");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const path = require("path");

const pdfTemplate = require("./documents");

const app = express();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

const googleclient = new OAuth2Client(GOOGLE_CLIENT_ID);
const mongoclient = new MongoClient(URI);

let DB;
mongoclient.connect()
  .then(() => {
    console.log("Connected to MongoDB !");
    DB = mongoclient.db("resume");
  })
  .catch(e => console.error(e));

const options = {
  height: "42cm",
  width: "35.7cm",
  timeout: "6000",
  childProcessOptions: {
    env: {
      OPENSSL_CONF: '/dev/null',
    },
  }
};

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "/public")));

const verifyGoogleToken = async (token) => {
  try {
    const ticket = await googleclient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    return { payload: ticket.getPayload() };
  } catch (error) {
    return { error: "Invalid user detected. Please try again", e: error };
  }
};

app.post("/verifyToken", (req, res) => {
  const token = req.body.token;
  jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
    if (err && (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError")) {
      return res.status(401).json({ message: err });
    }

    const email = decodedToken?.email;
    DB.collection("users")
      .findOne({ email })
      .then((user) => {
        if (!user) {
          return res.status(400).json({ message: "You are not registered. Please sign up" });
        }
        if (Date.now() < decodedToken.exp * 1000) {
          return res.status(200).json({ status: "Success" });
        }
      });
  });
});

app.post("/signup", async (req, res) => {
  try {
    const { email, password, name, mobile, credential } = req.body;

    if (credential) {
      const verificationResponse = await verifyGoogleToken(credential);
      if (verificationResponse.error) {
        return res.status(400).json({ message: verificationResponse.error });
      }
      const profile = verificationResponse.payload;
      const user = {
        name: profile.given_name,
        email: profile.email,
        mobile,
        password: bcrypt.hashSync(password, 10),
        token: jwt.sign({ email: profile.email }, JWT_SECRET, { expiresIn: "1d" }),
      };
      await DB.collection("users").insertOne(user);
      return res.status(201).json({ message: "Signup was successful", user });
    } else {
      const user = {
        name,
        email,
        mobile,
        password: bcrypt.hashSync(password, 10),
      
      token: jwt.sign({ email: email }, JWT_SECRET, { expiresIn: "1d" }),
    };
      await DB.collection("users").insertOne(user);
      return res.status(201).json({ message: "Signup was successful", user });
    }
  } catch (error) {
    return res.status(500).json({ message: "An error occurred. Registration failed. " + error });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await DB.collection("users").findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found. Please sign up." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: "1d" });
    return res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    return res.status(500).json({ message: error.message || error });
  }
});

app.post("/save", (req, res) => {
  const { user, resume } = req.body;
  delete resume.step;

  DB.collection("users").findOne({ email: user.email })
    .then((userDoc) => {
      const USERID = userDoc._id.toString();
      const data = { userid: USERID, ...resume };

      DB.collection("resume").findOne({ userid: USERID })
        .then((resumeDoc) => {
          if (resumeDoc) {
            DB.collection("resume").deleteOne({ userid: USERID })
              .then(() => DB.collection("resume").insertOne(data))
              .then(() => res.sendStatus(200))
              .catch((err) => res.status(500).send(err));
          } else {
            DB.collection("resume").insertOne(data)
              .then(() => res.sendStatus(200))
              .catch((err) => res.status(500).send(err));
          }
        });
    });
});

app.post("/get-resume", (req, res) => {
  const { email } = req.body;
  DB.collection("users").findOne({ email })
    .then((userDoc) => {
      const USERID = userDoc._id.toString();
      DB.collection("resume").findOne({ userid: USERID })
        .then((resumeDoc) => {
          if (resumeDoc) {
            delete resumeDoc._id;
            delete resumeDoc.userid;
            res.send(resumeDoc);
          } else {
            res.status(404).send({ message: "Resume not found" });
          }
        });
    });
});

app.post("/create-pdf", (req, res) => {
  pdf.create(pdfTemplate(req.body), options).toFile("Resume.pdf", (err) => {
    if (err) {
      return res.status(500).send(Promise.reject());
    } else {
      return res.send(Promise.resolve());
    }
  });
});

app.get("/", (req, res) => {
  res.send("Hello from 'Resume Builder' Web App");
});

app.get("/fetch-pdf", (req, res) => {
  const file = `${__dirname}/Resume.pdf`;
  res.download(file);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
