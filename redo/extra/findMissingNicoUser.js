//requiring path and fs modules
let path = require('path');
let fs = require('fs');
const url = require('url');
const http = require('http');
const XMLHttpRequest_node = require("xmlhttprequest").XMLHttpRequest;

let feats_HSL;

const keyword1 = '<a href="user/';
const keyword2 = '">';
const keyword3 = '(ID:';

let codeTmp = 0;

let requ_HSL = new XMLHttpRequest_node();
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

let replll   =  JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/missingNicoUid.json', 'utf8'));
let id_array =  JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/missingNicoUid2.json', 'utf8'));
//var replll = [];
console.log(replll);

let orttt = 0;

while (orttt < replll.length) {
let orttt2 = 0;
console.log("Abba");

while (orttt2 < 10 && orttt < replll.length) {
//console.log("aAbba " + orttt);
    /* let doIt = false;

     if (vids[orttt].tags.length === 0 && !replll.some(ent => ent.id === vids[orttt].id)) doIt = true;   */
     let doIt = true;
     if (id_array.some(ent => ent.id === replll[orttt])) doIt = false;

     if (doIt) {
       checkVideo(replll[orttt]);
       orttt2++;
       //orttt++;
     }

     orttt++;
}

console.log("Temporary save");
fs.writeFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/missingNicoUid2.json', JSON.stringify(id_array));
//replll = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/nicoTags2.json', 'utf8'));
}
               /*
const keyword1 = '<a href="user/';
const keyword2 = '">';
const keyword3 = '(ID:';  */

function checkVideo(videoId) {
   let teee = {};
   teee['id'] = videoId;
   foundTags = [];
   let webString = 'https://www.nicolog.jp/watch/' + videoId;
   console.log(webString);
   requ_HSL.open("GET", webString, false);
   requ_HSL.send(null);
   
   if (feats_HSL.indexOf(keyword1) === -1) {
      teee['nicologEntry'] = false;
      console.log(teee);
      id_array.push(teee);
      return;
   }
   teee['nicologEntry'] = true;

   let tmp1 = feats_HSL.indexOf(keyword1);
   feats_HSL = feats_HSL.substring(tmp1 + keyword1.length);
   feats_HSL = feats_HSL.substring(0,feats_HSL.indexOf(keyword3));
   teee['uId'] = feats_HSL.substring(0,feats_HSL.indexOf(keyword2));
   teee['uploader'] = feats_HSL.substring(feats_HSL.indexOf(keyword2) + keyword2.length).trim();
   console.log(teee);
   id_array.push(teee);
}
