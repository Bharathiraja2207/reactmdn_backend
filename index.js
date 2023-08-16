
import express from "express"; // "type": "module"
import { MongoClient } from "mongodb";
import cors from "cors";
import bodyParser from "body-parser";
import * as dotenv from 'dotenv'
import signinRouter from './router/signin.js';
import forgetRouter from './router/forgetpassword.router.js';

dotenv.config()
const app = express();
// const mongo_url = 'mongodb://127.0.0.1';
const mongo_url =(process.env.mongo_url)
export const client = new MongoClient(mongo_url);
await client.connect();

  console.log('mongo is connected!!');

  app.use(express.json())
  app.use(bodyParser.json())
  app.use(cors())

const PORT = (process.env.PORT)
// const PORT = 4000;

app.get("/", function (request, response) {
  response.send("🙋‍♂️, 🌏 🎊✨🤩");
});

app.get("/markdown",async function (request, response) {

  const markdown= await client
  .db("markdown")
  .collection("markdown")
  .find({})
  .toArray();
      response.send(markdown);
    });
    
 app.use("/users",signinRouter);
// app.use("/moviesid",moviesidRouter);
app.use("/",forgetRouter);

app.post("/markdown",async function (request, response) {
  const data=request.body;
  console.log(data);

// db.moviesid.insertmany(data)
   const result= await client
      .db("markdown")
     .collection("markdown")
      .insertMany(data)
  response.send(result);
});



app.post('/documents', (req, res) => {
  const { markdown } = req.body;
  const html = convertMarkdownToHtml(markdown);
  res.send( html );
});

app.listen(PORT, () => console.log(`The server started in: ${PORT} ✨✨`));



// convert markdown function
function convertMarkdownToHtml(markdownText) {
  //bold & italic & highlight
    markdownText = markdownText.replace(/\=(.+)\=/g, '<mark>$1</mark>');
    markdownText = markdownText.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    markdownText = markdownText.replace(/\*(.+?)\*/g, '<em>$1</em>');
  //heading
    markdownText = markdownText.replace(/^(#+)(.*)/gm, (match, p1, p2) => {
    const level = p1.length;
    return `<h${level}>${p2.trim()}</h${level}>` ;})
    //lists
    markdownText = markdownText.replace( /^(?:\*|-|\+)\s(.+)/gm, '<ul>\n<li>$1</li>\n</ul>');
    markdownText = markdownText.replace(/^(\d+)\.(?:\s*)(.+)/gm, (match, p1, p2) => {
      const startNumber = 1; 
      const newNumber = parseInt(p1, 10) + startNumber - 1;
      return `<ol start="${newNumber}">\n<li>${p2}</li>\n</ol>`;
    });
    
    //basic syntax
    markdownText = markdownText.replace(/\$(.+)/g, '<p>$1</p>');
    markdownText =markdownText.replace(/\~(.+?)\~\s/gm, '<del>$1</del>');
    markdownText = markdownText.replace(/\!\((.+?)\)\((.+?)\)/g, '<img src="$1" alt="$2"</img>');
    markdownText = markdownText.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
    markdownText = markdownText.replace(/\>\ (.+)/gm, "<blockquote>$1</blockquote>");
    // Handle fenced code blocks
    markdownText = markdownText.replace(/```(\w+)?\n([\s\S]+?)\n```/g, '<pre><code class="language-$1">$2</code></pre>');
    markdownText = markdownText.replace(/`(.+?)`/g, '<code>$1</code>');
    markdownText = markdownText.replace(/\-\-\-/g, '<hr/>');

  return markdownText;
}
