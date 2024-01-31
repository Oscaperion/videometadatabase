//requiring path and fs modules
var path = require('path');
var fs = require('fs');
const url = require('url');
const http = require('http');
const XMLHttpRequest_node = require("xmlhttprequest").XMLHttpRequest;

let feats_HSL;

const keyword1 = 'tdtag';
const keyword2 = '<li';
const search1 = '>';
const search2 = '</li>';

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

let foundTags;

//var vids = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts/vids20.json', 'utf8'));
//var vids = {"videos": JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts2/vids202206.json', 'utf8')) };

let replll =  JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/nicoTags2.json', 'utf8'));
//var replll = [];
console.log(replll);

let vids = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/nicoTags.json', 'utf8'));

let orttt = 0;

while (orttt < vids.length) {
//for (var i = 0; i < 500; i++) {

//var ertt = 10 + (10 * opp);
//if (ertt >  vids.videos.length ) ertt = vids.videos.length;
let orttt2 = 0;
console.log("Abba");

while (orttt2 < 10 && orttt < vids.length) {
//console.log("aAbba " + orttt);
     let doIt = false;

         /*
     for (let j = 0; j < vids.length; j++) {
         if (vids.videos[orttt].id === replll[j].id) doIt = false;
         if (!doIt) break;
     } */
     //console.log(replll.some(ent => ent.id === vids[orttt].id));

     if (vids[orttt].tags.length === 0 && !replll.some(ent => ent.id === vids[orttt].id)) doIt = true;

     if (doIt) {
       checkVideo(vids[orttt].id);
       orttt2++;
       //orttt++;
     }
//console.log("bAbba" + orttt2);


       orttt++;
}
console.log("Temporary save");
fs.writeFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/nicoTags2.json', JSON.stringify(replll));
//replll = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/nicoTags2.json', 'utf8'));
}


function checkVideo(videoId) {
   let teee = {};
   teee['id'] = videoId;
   foundTags = [];
   let webString = 'https://www.nicolog.jp/watch/' + videoId;
   console.log(webString);
   requ_HSL.open("GET", webString, false);
   requ_HSL.send(null);

   let tmp1 = feats_HSL.indexOf(keyword1);
   feats_HSL = feats_HSL.substring(tmp1);
   feats_HSL = feats_HSL.substring(0,feats_HSL.indexOf("</tr>"))
   tmp1 = feats_HSL.indexOf(keyword2);
   let firstEntry = undefined;

   while (tmp1 != -1) {
      //console.log(tmp1);
      console.log("Found a tag!");

      feats_HSL = feats_HSL.substring(tmp1);

      let tmp2 = feats_HSL.indexOf(search1);
      let tmp3 = feats_HSL.indexOf(search2);
      console.log(tmp2 + ', ' + tmp3);

      let tmp4 = feats_HSL.substring(tmp2 + search1.length, tmp3).trim();

      //if (tmp4.length > 100) tmp4 = undefined;
                                   /*
      if (!(firstEntry === undefined)) {
         if (firstEntry === tmp4) continue;
      } else firstEntry = tmp4;  */

      console.log(tmp4);
      if (!(tmp4 === undefined) && !foundTags.includes(tmp4)) foundTags.push(tmp4);
      
      tmp1 = feats_HSL.indexOf(keyword2, 3);

      //findJsonLink(webString, readLine);
   }
   
   teee['tags'] = foundTags;
   //console.log(teee);

   replll.push(teee);
}
