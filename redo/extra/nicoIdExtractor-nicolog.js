//requiring path and fs modules
var path = require('path');
var fs = require('fs');
const url = require('url');
const http = require('http');
const XMLHttpRequest_node = require("xmlhttprequest").XMLHttpRequest;

let feats_HSL;

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

let teee = {};
teee['id'] = [];
//checkVideo("nm7328662");

//let idList = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/undefined_niconico_vids12.txt', 'utf8')).ids;
let pages = ["https://www.nicolog.jp/user/131035962","https://www.nicolog.jp/user/60662137","https://www.nicolog.jp/user/60662137?page=2",
"https://www.nicolog.jp/user/60662137?page=3"
             ];

for (let i = 0; i < pages.length; i++) {
   checkPage(pages[i]);
}

function checkPage(pageUrl) {
   requ_HSL.open("GET", pageUrl, false);
   requ_HSL.send(null);
   
   let checkStr = '<a href="watch/';
   
   let idIndex = feats_HSL.indexOf(checkStr);
   if (idIndex === -1) {
      console.log("Not fitting page: " + pageUrl);
      return;
   }

   while (idIndex !== -1) {
      feats_HSL = feats_HSL.substring(idIndex + checkStr.length);
      let tmp2 = '">';
      
      let extractedId = feats_HSL.substring(0,feats_HSL.indexOf(tmp2));

      console.log(extractedId);
      teee['id'].push(extractedId);

      idIndex = feats_HSL.indexOf(checkStr);
   }
}

fs.writeFileSync('F:/Dropbox/NodeJS/idsFromNicolog-comp3.json', JSON.stringify(teee));