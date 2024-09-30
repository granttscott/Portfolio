import express from "express";
import axios from "axios";
// import path from "path";
// import { fileURLToPath } from 'url';



const app = express();
const port = 3000;
const API_URL = "https://api.core.ac.uk/";

const APIKey = "YgQwynm1XsNz9KAok4rB2OJSHvLhq5Up";
// Get the directory name of the current module
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

app.use(express.static("../../public"));

app.get("/", (req, res) => {
    res.render("index.ejs");
  });

  app.get("/papers", async (req, res) => {
    res.render("papers.ejs", { content: "Please find a paper." });
  });

  app.get("/noAuth", async (req, res) => {

    try {
      const result = await axios.get(API_URL + "/random");
      res.render("index.ejs", { content: JSON.stringify(result.data) });
    } catch (error) {
      res.status(404).send(error.message);
    }
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });