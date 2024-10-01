/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

import express from "express";
import axios from "axios";
// import { https } from 'firebase-functions';

// import path from "path";
// import { fileURLToPath } from 'url';



const app = express();
const port = 3000;
const API_URL = "https://api.core.ac.uk";

const APIKey = "YgQwynm1XsNz9KAok4rB2OJSHvLhq5Up";
// Get the directory name of the current module
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs");
  });

  app.get("/papers", async (req, res) => {
    res.render("papers.ejs", { papers: [], content: "Please find a paper." });
  });

  app.get("/search", async (req, res) => {
    const entityType = req.query.category
    try {
      const result = await axios.get(`${API_URL}/v3/search/${entityType}/`);
      const papers = result.data.results.map(item => ({
        title: item.title,
        subjects: item.subjects,
        url: item.identifiers.find(id => id.startsWith('url:')).split('url:')[1],
        issn: item.identifiers.find(id => id.startsWith('issn:')).split('issn:')[1]
      }));      res.render("papers.ejs", { papers });
    } catch (error) {
      res.status(404).send(error.message);
    }
  });

  app.get("/more", async (req, res) => {
    const identifier = req.query.issn
    try {
      const papers = await axios.get(`${API_URL}/v3/journals/issn:${identifier}`);
      // const papers = result.data.results.map(item => ({
      //   title: item.title,
      //   subjects: item.subjects,
      //   url: item.identifiers.find(id => id.startsWith('url:')).split('url:')[1]
      // }));
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
