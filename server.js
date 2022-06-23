const express = require("express");
const translate = require("@vitalets/google-translate-api");
const cambridgeDictionary = require("camb-dict");

const languages = [
  "en",
  "de",
  "fr",
  "bg",
  "nl",
  "it",
  "eo",
  "fi",
  "et",
  "ko",
  "pl",
  "ru",
  "sl",
  "tr",
];

const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/rewrite", (req, res) => {
  useages("rewrite");
  var strength = 4;
  if (req.body.strength === "Simple") strength = 2;
  else if (req.body.strength === "Strong") strength = 6;

  var langs;

  if (strength === 2) langs = ["fr", "it"];
  else langs = chooseRandom(languages, strength);

  var text = req.body.text;

  translate(text, { to: langs[0] }).then((resp) => {
    text = resp.text;
    langs.push(resp.from.language.iso);
    trans();
  });

  function trans() {
    langs.shift();
    translate(text, { to: langs[0] }).then((resp) => {
      if (langs.length > 1) {
        text = resp.text;
        trans();
      } else {
        res.send({ rewritten: resp.text });
        return;
      }
    });
  }
});

app.get("/word", (req, res) => {
  res.render("word");
});

app.post("/word", async (req, res) => {
  useages("word");
  try {
    var dic = new cambridgeDictionary.Dictionary();
    await dic.meaning(req.body.word.trim().toLowerCase()).then((data) => {
      delete data.audio;
      data.meaning = data.meaning.replace(": ", "");
      translate(data.word, { to: "de" }).then((resp) => {
        data.german = resp.text;
        res.send(data);
      });
    });
  } catch (e) {
    res.send({ error: "We could't find this word." });
  }
});

app.use("*", (req, res) => {
  res.status(404).render("PageNotFound");
});

const chooseRandom = (arr, num = 5) => {
  const res = [];
  for (let i = 0; i < num; ) {
    const random = Math.floor(Math.random() * arr.length);
    if (res.indexOf(arr[random]) !== -1) {
      continue;
    }
    res.push(arr[random]);
    i++;
  }
  return res;
};

function useages(str) {
  console.log(new Date().toLocaleTimeString() + "-> usage - " + str);
}

app.listen(5000, () => {
  console.log("Rewrite app running on Port: 5000");
});
