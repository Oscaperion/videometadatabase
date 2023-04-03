//requiring path and fs modules
const fs = require('fs');
const url = require('url');
const http = require('http');
const readline = require('readline');
const XMLHttpRequest_node = require("xmlhttprequest").XMLHttpRequest;
        


var readInterface = readline.createInterface({
  input: fs.createReadStream('memes6.txt'),
  output: process.stdout,
  terminal: false
});

readInterface.on('line', (line) => {
  handleLine(line);
});

var feats_HSL;

var requ_HSL = new XMLHttpRequest_node();
requ_HSL.onreadystatechange = function() {
   console.log("Readystate = " + requ_HSL.readyState + ', Status = ' + requ_HSL.status);
   if (requ_HSL.readyState == 4 && (requ_HSL.status == 200 || requ_HSL.status == 302)){
      //alert(req.responseText);
      //rawdata_HSL = requ_HSL.responseText;
      //feats_HSL = JSON.parse(requ_HSL.responseText).features;
      feats_HSL = requ_HSL.responseText;
      if (requ_HSL.status == 302) {
         //console.log(requ_HSL.getAllResponseHeaders());
         feats_HSL = requ_HSL.getAllResponseHeaders();
      }
      console.log("Successfully fetched");
   } else {
      console.log("Not fetched");
      feats_HSL = ' ';
   }
};

//findJsonLink2();


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
}

function handleLine3(readLine) {
   var webString = 'https://archive.org/download/HyperFlameXLI_Archive';
   console.log(webString);
   requ_HSL.open("GET", webString, false);
   requ_HSL.send(null);

   var beeg_string =  feats_HSL;

   var tmp1 = beeg_string.indexOf(".info.json");
   var tenti = '<a href=\"';
   //if (feats_HSL.indexOf(".info.json") != -1) {
   while (tmp1 != -1) {
      console.log("Found a JSON file!");
      var tmp2 = beeg_string.substring(0,tmp1).lastIndexOf(tenti);
      console.log(tmp1 + ', ' + tmp2);

      findJsonLink(webString, readLine);
      
      beeg_string = beeg_string.substring(tmp2);
      tmp1 = beeg_string.indexOf(".info.json");
   }
}

function findJsonLink2() {
   var webPage = 'https://archive.org/download/ProPantsuWrestler';
   requ_HSL.open("GET", webPage, false);
   requ_HSL.send(null);

   var tenti = '<a href=\"';
   var tunti = '.info.json';

   var beeg_string =  feats_HSL;
   var tmp1 = beeg_string.indexOf(tunti);
   
   while (tmp1 != -1) {
   var tmp2 = beeg_string.substring(0,tmp1).lastIndexOf(tenti);

   var tmp3 = beeg_string.substring(tmp2 + tenti.length, tmp1 + tunti.length);
   
   var finalLink = webPage + '/' + tmp3;
   console.log(finalLink);

   /*
   var temeper = '';
   fs.readFile(finalLink, 'utf8', function (err, data) {
      if (err) {

      }
      console.log('Got the JSON yaya');
      temeper = data;
   });  */


   requ_HSL.open("GET", finalLink, false);
   requ_HSL.send(null);

   var lolTmp1 = feats_HSL.indexOf('location:');
   var lolTmp2 = feats_HSL.indexOf('\n', lolTmp1);
   var loccar = feats_HSL.substring(lolTmp1 + 'location:'.length, lolTmp2);
   console.log (loccar.trim());

   requ_HSL.open("GET", loccar.trim(), false);
   requ_HSL.send(null);
   
   var danielaa = tmp3.length - '-eYpfwriZKMw.info.json'.length;
   var priia = tmp3.substring(danielaa);
   var filenameNew = 'massJsonTesting-1/TESTING' + priia;
   fs.writeFileSync(filenameNew, feats_HSL);

   var terai = beeg_string.indexOf('</a>', tmp1);
   beeg_string = beeg_string.substring(terai);
   tmp1 = beeg_string.indexOf(tunti);
   }
}

function findJsonLink(webPage, videoID) {
   var tenti = '<a href=\"';
   var tunti = '.info.json';

   var tmp1 = feats_HSL.indexOf(tunti);
   var tmp2 = feats_HSL.substring(0,tmp1).lastIndexOf(tenti);

   var tmp3 = feats_HSL.substring(tmp2 + tenti.length, tmp1 + tunti.length);
   
   var finalLink = webPage + '/' + tmp3;
   console.log(finalLink);

   /*
   var temeper = '';
   fs.readFile(finalLink, 'utf8', function (err, data) {
      if (err) {

      }
      console.log('Got the JSON yaya');
      temeper = data;
   });  */


   requ_HSL.open("GET", finalLink, false);
   requ_HSL.send(null);

   var lolTmp1 = feats_HSL.indexOf('location:');
   var lolTmp2 = feats_HSL.indexOf('\n', lolTmp1);
   var loccar = feats_HSL.substring(lolTmp1 + 'location:'.length, lolTmp2);
   console.log (loccar.trim());

   requ_HSL.open("GET", loccar.trim(), false);
   requ_HSL.send(null);

   var filenameNew = 'massJsonTesting-1/TESTING-' + videoID + '.json';
   fs.writeFileSync(filenameNew, feats_HSL);
}

/*
requ_HSL.open("GET", "https://opendata.arcgis.com/datasets/b2aa879ce93c4068ac63b64d71f24947_0.geojson", false);
requ_HSL.send(null);   */

