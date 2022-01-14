import { sample } from "lodash";

const fs = require('fs')

let ALL_WORDS: { [index: string]: boolean };
let POPULAR_WORDS: string[];

fs.readFile('src/assets/all_words.json', 'utf8' , (err, data) => {
  ALL_WORDS = JSON.parse(data);
})

fs.readFile('src/assets/popular_words.json', 'utf8' , (err, data) => {
  POPULAR_WORDS = Object.keys(JSON.parse(data));
})

export function wordIsValid(word: string) {
  return !!ALL_WORDS[word];
}

export function generateWord() {
  return sample(POPULAR_WORDS);
}
