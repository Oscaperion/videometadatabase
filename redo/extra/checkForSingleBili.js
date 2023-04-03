const fs = require('fs');
const url = require('url');
const http = require('http');

var parsedVideos = [];

for (let y = 202303; y >= 200501; y--) {

   let terappi = 'F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts2/vids' + y + '.json';
   //var terappi = 'vidJson2/vids' + y + '.json';
   console.log('Loading ' + terappi)  ;
   try {
     let teray = fs.readFileSync(terappi, 'utf8');
     console.log('Check 1')  ;
     //forceGC();
     console.log('Check 2')  ;
     parsedVideos.push(JSON.parse(teray));
     console.log('Check 3')  ;
     //forceGC();
     console.log('Loaded!')  ;
     //numm++;

     //console.log('numm value: ' + numm)  ;

   } catch(e) {
     console.log("Oh wait, that doesn't exist");
   }
}

var singleBili = [];

for (let i = 0; i < parsedVideos.length; i++) {
   for (let j = 0; j < parsedVideos[i].length; j++) {
      if (parsedVideos[i][j].extractor_key === "BiliBili" && parsedVideos[i][j].id.length === 1) {
         singleBili.push(parsedVideos[i][j].id[0]);
         console.log("Added ID: " + parsedVideos[i][j].id[0]);
      }
   }
}

var outputStr = "";

for (let i = 0; i < singleBili.length; i++) {
    outputStr += "https://www.bilibili.com/video/" + singleBili[i] + "\n";
}

fs.writeFileSync("F:/Dropbox/NodeJS/biliSingles.txt", outputStr);