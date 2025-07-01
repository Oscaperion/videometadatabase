const fs = require('fs');
const readline = require('readline');

//const jsonLocation = "F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts2/";
const jsonLocation = "D:/testtt1/";
const downloadListLocation = "F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/already-downloaded-with-timestamp.txt";
// const downloadList = fs.readFileSync(downloadListLocation, 'utf8');

let timestampIds = [];
let allIds = [];

function readTimes() {
const downloadList = readline.createInterface({
    input: fs.createReadStream(downloadListLocation),
    output: process.stdout,
    terminal: false
});

downloadList.on('line', (line) => {
    //console.log(line);

    if (line.includes("youtube")) {
       timestampIds.push(line.split(" ")[1].trim());
       // console.log(line.split(" ")[1]);
    }
});

downloadList.on('close', () => {
     console.log("Processed! " + downloadListLocation);
     readditt();
  });
}

function readditt() {
let files = fs.readdirSync(jsonLocation); //, (err, files) => {
   // if (err) throw err;
   
   console.log("mrppo");

   try {
      files.forEach(jsonFile => {
         console.log(jsonLocation + jsonFile);
         let tmpFile = JSON.parse(fs.readFileSync(jsonLocation + jsonFile, 'utf8'));
         if (!!tmpFile.videos) tmpFile = tmpFile.videos;
         console.log("fof");
         let tmpList = tmpFile.filter(entry => entry.extractor_key === "Youtube" /* && !timestampIds.includes(entry.id) */ )
           .map(entry => entry.id);

         console.log(tmpList);

         allIds.push(tmpList);
         // allIds = allIds + "https://www.youtube.com/watch?v=" + tmpList.join("\nhttps://www.youtube.com/watch?v=");
         console.log("fef");
         console.log('Processed... ' + jsonFile);
      });
   } catch(e) {
      console.log("ERROR! FILE COULDN'T BE READ! " + e);
   }

   // console.log('All metadata loaded!');
   // console.log("Total number of entries: " + parsedVideos.length);
// });
console.log("Processed! " + jsonLocation);
createList();
      }

function createList() {
  console.log("Compiling list... - " + allIds.length + " - " + timestampIds.length);
//let returnArray = allIds.filter(entry => !timestampIds.includes(entry)).map(entry => "https://www.youtube.com/watch?v=" + entry);

let returnArray = [];

for (let i = 0; i < allIds.length; i++) {
for (let k = 0; k < allIds[i].length; k++) {


   let hasTimestamp = !timestampIds.includes(allIds[i][k]);

   if (hasTimestamp && !returnArray.includes(allIds[i][k])) {
      // console.log(allIds.length + " / " + (i + 1));
      // console.log(allIds[i]);
      returnArray.push(allIds[i][k]);
      //console.log(hasTimestamp);
   }

   if (k % 1000 === 0) { console.log((i + 1) + " / " + allIds.length); console.log((k + 1) + " / " + allIds[i].length); console.log(returnArray.length); }
}}

fs.writeFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/vids-with-no-timestamp.txt', "https://www.youtube.com/watch?v=" + returnArray.join("\nhttps://www.youtube.com/watch?v="));

console.log("List created!");
}

readTimes();
// readditt();
// createList();