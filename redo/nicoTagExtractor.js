//requiring path and fs modules
var path = require('path');
var fs = require('fs');
const url = require('url');
const http = require('http');
const XMLHttpRequest_node = require("xmlhttprequest").XMLHttpRequest;

var feats_HSL;

var codeTmp = 0;

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
      codeTmp = requ_HSL.status;
   } else {
      console.log("Not fetched");
      feats_HSL = ' ';
   }
};

const keyword1 = 'nicovideo.jp/tag';
const keyword2 = 'fwvaa1c';
const search1 = '>';
const search2 = '</div>';

var foundTags;

var vids = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts/vids13.json', 'utf8'));
//var vids = {"videos": JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts2/vids202210.json', 'utf8')) };

var replll =  JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/nicoTags.json', 'utf8'));

var orttt = 0;

while (orttt < vids.videos.length) {
//for (var i = 0; i < 500; i++) {

//var ertt = 10 + (10 * opp);
//if (ertt >  vids.videos.length ) ertt = vids.videos.length;
var orttt2 = 0;
console.log("Abba");

while (orttt2 < 10 && orttt < vids.videos.length) {
//console.log("aAbba " + orttt);
  if (vids.videos[orttt].extractor_key === "Niconico") {
     var doIt = true;

     for (var j = 0; j < replll.length; j++) {
         if (vids.videos[orttt].id === replll[j].id) doIt = false;
         if (!doIt) break;
     }

     if (doIt) {
       checkVideo(vids.videos[orttt].id);
       orttt2++;
       orttt++;
     }
//console.log("bAbba" + orttt2);
  }

       orttt++;
}
console.log("Temporary save");
fs.writeFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/nicoTags.json', JSON.stringify(replll));
replll = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/nicoTags.json', 'utf8'));
}

function checkVideo(videoId) {
   var teee = {};
   teee['id'] = videoId;
   foundTags = [];
   var webString = 'https://embed.nicovideo.jp/watch/' + videoId;
   console.log(webString);
   requ_HSL.open("GET", webString, false);
   requ_HSL.send(null);

   var tmp1 = feats_HSL.indexOf(keyword1);
   feats_HSL = feats_HSL.substring(tmp1);
   tmp1 = feats_HSL.indexOf(keyword2);
   var firstEntry = undefined;

   while (tmp1 != -1) {
      console.log("Found a tag!");
      
      feats_HSL = feats_HSL.substring(tmp1);

      var tmp2 = feats_HSL.indexOf(search1);
      var tmp3 = feats_HSL.indexOf(search2);
      console.log(tmp2 + ', ' + tmp3);

      var tmp4 = feats_HSL.substring(tmp2 + 1, tmp3);

      if (tmp4.length > 100) tmp4 = undefined;

      if (!(firstEntry === undefined)) {
         if (firstEntry === tmp4) break;
      } else firstEntry = tmp4;

      console.log(tmp4);
      if (!(tmp4 === undefined)) foundTags.push(tmp4);
      
      tmp1 = feats_HSL.indexOf(keyword2, 3);

      //findJsonLink(webString, readLine);
   }
   
   teee['tags'] = foundTags;
   //console.log(teee);

   replll.push(teee);
}
