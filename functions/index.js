/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions");
const express = require("express");
const axios = require("axios");
const admin = require('firebase-admin');
const serviceAccount = require('./portfolio-36f4a-firebase-adminsdk-8aezx-323b27e1a3.json');
// const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;
const API_URL = "https://api.core.ac.uk";

const APIKey = "YgQwynm1XsNz9KAok4rB2OJSHvLhq5Up";


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://portfolio-36f4a-default-rtdb.firebaseio.com"
});
const db = admin.firestore();
app.use(express.static("public"));

// app.get('/css/styles.css', (req, res) => {
//   const cssPath = path.join(__dirname, 'public', 'css', 'styles.css');
//   fs.readFile(cssPath, 'utf8', (err, data) => {
//     if (err) {
//       res.status(404).send('CSS file not found');
//     } else {
//       res.setHeader('Content-Type', 'text/css');
//       res.send(data);
//     }
//   });
// });

app.get("/", (req, res) => {
  res.render("index.ejs");
});
app.get("/projects", (req, res) => {
  res.render("projects.ejs");
});
app.get("/design", (req, res) => {
  const filePath = path.join(__dirname, 'public', 'projects', 'design.html');
  res.sendFile(filePath);
});

app.get("/drum", (req, res) => {
  const filePath = path.join(__dirname, 'public', 'projects', 'drum', 'index.html');
  res.sendFile(filePath);
});

app.get("/simon", (req, res) => {
  const filePath = path.join(__dirname, 'public', 'projects', 'simon', 'index.html');
  res.sendFile(filePath);
});

app.get("/locationPicker", (req, res) => {
  const filePath = path.join(__dirname, 'public', 'projects', 'nicole', 'locationPicker.html');
  res.sendFile(filePath);
});

app.get("/rps", (req, res) => {
  const filePath = path.join(__dirname, 'public', 'projects', 'rps.html');
  res.sendFile(filePath);
});

app.get("/papers", async (req, res) => {
  res.render("papers.ejs", { papers: [], content: "Please find a paper." });
});

app.get("/search", async (req, res) => {
  const entityType = req.query.category;
  const searchQuery = req.query.query;
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    const result = await axios.get(`${API_URL}/v3/search/works/`, {
      params: {
        q: searchQuery,
        scroll: true,
        offset: offset,
        limit: limit
      },
      headers: {
        'Authorization': `Bearer ${APIKey}`
      }
    });

    const papers = result.data.results.map(item => ({
      title: item.title,
      abstract: item.abstract,
      yearPublished: item.yearPublished,
      downloadUrl: item.downloadUrl,
      documentType: item.documentType,
      readerUrl: item.links.find(link => link.type === "reader")?.url
    }));

    const totalResults = result.data.totalHits;
    const totalPages = Math.ceil(totalResults / limit);

    res.render("papers.ejs", { 
      papers,
      currentPage: page,
      totalPages: totalPages,
      searchQuery: searchQuery,
      entityType: entityType
    });
  } catch (error) {
    logger.error('Search error', {
      entityType,
      error: error.message
    });
    res.status(404).send(error.message);
  }
});

app.get("/blog", async (req, res) => {
  try {
    console.log("Attempting to fetch posts...");
    const postsSnapshot = await db.collection('posts').orderBy('date', 'desc').get();
    console.log("Posts snapshot received:", postsSnapshot);
    const posts = postsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log("Processed posts:", posts);
    res.render("blog.ejs", { posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).send("Error fetching posts: " + error.message);
  }
});

app.post("/add-post", express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const { name, content } = req.body;
    await db.collection('posts').add({
      name,
      content,
      date: admin.firestore.FieldValue.serverTimestamp()
    });
    res.redirect('/blog');
  } catch (error) {
    console.error("Error adding post:", error);
    res.status(500).send("Error adding post");
  }
});

app.post("/delete-post/:id", async (req, res) => {
  try {
    await db.collection('posts').doc(req.params.id).delete();
    res.redirect('/blog');
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).send("Error deleting post");
  }
});

app.get("/edit-post/:id", async (req, res) => {
  try {
    const postDoc = await db.collection('posts').doc(req.params.id).get();
    if (!postDoc.exists) {
      res.status(404).send("Post not found");
    } else {
      const post = { id: postDoc.id, ...postDoc.data() };
      res.render("edit-post.ejs", { post });
    }
  } catch (error) {
    console.error("Error fetching post for edit:", error);
    res.status(500).send("Error fetching post for edit");
  }
});

app.post("/update-post/:id", express.urlencoded({ extended: true }), async (req, res) => {
  try {
    const { name, content } = req.body;
    await db.collection('posts').doc(req.params.id).update({ name, content });
    res.redirect('/blog');
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).send("Error updating post");
  }
});

app.get("/more", async (req, res) => {
  const identifier = req.query.issn;
  try {
    const papers = await axios.get(`${API_URL}/v3/journals/issn:${identifier}`);
    res.render("papers.ejs", { papers });
  } catch (error) {
    res.status(404).send(error.message);
  }
});

app.post("/save-location-audit", async (req, res) => {
  try {
    const emailLocationsMap = req.body;
    
    // Save to Firestore
    await db.collection('locationAudits').add({
      data: emailLocationsMap,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ message: 'Data saved successfully' });
  } catch (error) {
    console.error("Error saving location audit:", error);
    res.status(500).json({ error: 'Error saving data' });
  }
});

app.post("/save-score", express.json(), async (req, res) => {
  try {
    const { name, score } = req.body;
    await db.collection('leaderboard').add({
      name,
      score,
      date: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ message: 'Score saved successfully' });
  } catch (error) {
    console.error("Error saving score:", error);
    res.status(500).json({ error: 'Error saving score' });
  }
});

app.get("/get-leaderboard", async (req, res) => {
  try {
    const leaderboardSnapshot = await db.collection('leaderboard')
      .orderBy('score', 'desc')
      .limit(10)
      .get();
    
    const leaderboard = leaderboardSnapshot.docs.map(doc => ({
      name: doc.data().name,
      score: doc.data().score
    }));
    
    res.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: 'Error fetching leaderboard' });
  }
});

exports.api = onRequest(app);

