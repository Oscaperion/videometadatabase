//requiring path and fs modules
const fs = require('fs');
const url = require('url');
const http = require('http');
const readline = require('readline');
const XMLHttpRequest_node = require("xmlhttprequest").XMLHttpRequest;

var readInterface = readline.createInterface({
  input: fs.createReadStream('memes4.txt'),
  output: process.stdout,
  terminal: false
});
      /*
readInterface.on('line', (line) => {
  handleLine(line);
}); */

var feats_HSL;

var requ_HSL = new XMLHttpRequest_node();
requ_HSL.onreadystatechange = function() {
   console.log("Readystate = " + requ_HSL.readyState + ', Status = ' + requ_HSL.status);
   if (requ_HSL.readyState == 4 && (requ_HSL.status == 200 || requ_HSL.status == 302)){
      //alert(req.responseText);
      //rawdata_HSL = requ_HSL.responseText;
      //feats_HSL = JSON.parse(requ_HSL.responseText).features;
      feats_HSL = requ_HSL.responseText;
      console.log(requ_HSL);
      if (requ_HSL.status == 302) {
         //console.log(requ_HSL.getAllResponseHeaders());
         feats_HSL = requ_HSL.getAllResponseHeaders();
         console.log(feats_HSL);
      }
      console.log("Successfully fetched");
   } else {
      console.log("Not fetched");
      feats_HSL = ' ';
   }
};

requ_HSL.open("GET", 'https://twitter.com/i/status/1176508657233793029', false);
requ_HSL.send(null);

/*
function handleLine2(readLine) {
   // console.log(readLine);
   var linkero = 'https://web.archive.org/save/https://finnrepo.a2hosted.com/YTPMV_Database/results.html?search=&page=';

   var i;
   // i = 610 - 5105
   for (i = 5066; i < 17983; i++) {
      var newPage = linkero + i;
      console.log(newPage);
      requ_HSL.open("GET", newPage, false);
      requ_HSL.send(null);

   }
}

function handleLine(readLine) {
   var webString = 'https://archive.org/download/youtube-' + readLine;
   console.log(webString);
   requ_HSL.open("GET", webString, false);
   requ_HSL.send(null);

   var tmp1 = feats_HSL.indexOf(".info.json");
   var tenti = '<a href=\"';
   //if (feats_HSL.indexOf(".info.json") != -1) {
   if (tmp1 != -1) {
      console.log("Found a JSON file!");
      var tmp2 = feats_HSL.substring(0,tmp1).lastIndexOf(tenti);
      console.log(tmp1 + ', ' + tmp2);

      findJsonLink(webString, readLine);
   }
}    */

function handleLine(readLine) {
   var webString = 'https://www.bilibili.com/video/' + readLine;
   console.log(webString);
   requ_HSL.open("GET", webString, false);
   requ_HSL.send(null);


   if (feats_HSL != null) {
     while (requ_HSL.status == 302) {
      var lolTmp1 = feats_HSL.indexOf('location:');
      var lolTmp2 = feats_HSL.indexOf('\n', lolTmp1);
      var loccar = feats_HSL.substring(lolTmp1 + 'location:'.length, lolTmp2);
      console.log (loccar);
      loccar = 'https:' + loccar.trim();
      loccar = loccar.substring(0,loccar.indexOf('?'));
      console.log (loccar);

      requ_HSL.open("GET", loccar, false);
      requ_HSL.send(null);
      fs.appendFileSync('memesBilibili.txt', feats_HSL);

     } 
   }
}

