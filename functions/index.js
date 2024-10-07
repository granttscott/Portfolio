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
// const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;
const API_URL = "https://api.core.ac.uk";

const APIKey = "YgQwynm1XsNz9KAok4rB2OJSHvLhq5Up";

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
    res.render("blog.ejs");
  } catch (error) {
    res.status(404).send(error.message);
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

exports.api = onRequest(app);
// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
