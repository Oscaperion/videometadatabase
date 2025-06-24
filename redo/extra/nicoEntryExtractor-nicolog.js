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

// console.log('Arguments: ', process.argv);

checkVideo(process.argv[2].trim());

// checkVideo("sm14226299");

//let idList = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/undefined_niconico_vids12.txt', 'utf8')).ids;
    /*
let idList = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/idsFromNicolog-comp3.json', 'utf8')).id;

for (let i = 0; i < idList.length; i++) {
   checkVideo(idList[i]);
}     */


function checkVideo(videoId) {
   let teee = {};
   teee['id'] = videoId;
   teee['webpage_url'] = "https://www.nicovideo.jp/watch/" + videoId;
   foundTags = [];
   let webString = 'https://www.nicolog.jp/watch/' + videoId;
   console.log(webString);
   requ_HSL.open("GET", webString, false);
   requ_HSL.send(null);

   let tmpStr1 = "\u52D5\u753B\u30BF\u30A4\u30C8\u30EB</dt><dd>";
   if (feats_HSL.indexOf(tmpStr1) === -1) {
      console.log('No page for ID: ' + videoId);
      return;
      // throw new Error('No page for ID: ' + videoId);
   }
   let tmp1 = feats_HSL.indexOf(tmpStr1) + tmpStr1.length;
   feats_HSL = feats_HSL.substring(tmp1);
   feats_HSL = feats_HSL.substring(0,feats_HSL.indexOf("</dd></dl></div>"));

   // Extracting title
   tmp1 = feats_HSL.indexOf("</dd>");
   teee['title'] = feats_HSL.substring(0, tmp1);

   /*
   // Extracting date (YYYYMMDD)
   console.log(feats_HSL);
   tmpStr1 = "\u6295\u7A3F\u65E5\u6642</dt><dd>";
   //console.log(tmpStr1);
   tmp1 = feats_HSL.indexOf(tmpStr1) + tmpStr1.length;
   feats_HSL = feats_HSL.substring(tmp1);
   // Cutting until day kanji
   let tmp2 = feats_HSL.substring(0, feats_HSL.indexOf("\u65E5"));
   // Replacing year and month kanji with dashes
   tmp2 = tmp2.replace('\u5E74', '-').replace('\u6708', '-');
   //console.log(tmp2);
   // Split the string into year, month, and day
   tmp2 = tmp2.split('-');
   //console.log(tmp2);
   // Format the date as YYYYMMDD
   teee["upload_date"] = `${tmp2[0]}${tmp2[1].padStart(2, '0')}${tmp2[2].padStart(2, '0')}`;
   */
   
   // Extracting date (YYYYMMDD)
   console.log(feats_HSL);
   tmpStr1 = "\u6295\u7A3F\u65E5\u6642</dt><dd>";
   //console.log(tmpStr1);
   tmp1 = feats_HSL.indexOf(tmpStr1) + tmpStr1.length;
   feats_HSL = feats_HSL.substring(tmp1);
   // Cutting until day kanji
   let tmp2 = feats_HSL.substring(0, feats_HSL.indexOf("\u79D2"));
   // Replacing year and month kanji with dashes
   // tmp2 = tmp2.replace('\u5E74', '-').replace('\u6708', '-');
   //console.log(tmp2);
   // Split the string into year, month, and day
   // tmp2 = tmp2.split('-');
   tmp2 = tmp2.split(/\u5E74|\u6708|\u65E5|\u6642|\u5206/).map(num => parseInt(num.trim(), 10));
   //console.log(tmp2);
   // Format the date as YYYYMMDD
   // teee["upload_date"] = `${tmp2[0]}${tmp2[1].padStart(2, '0')}${tmp2[2].padStart(2, '0')}`;
   // The times on Nicolog seem to be saved in UTC+9, so this converts them to UTC properly
   let jstDate = new Date(Date.UTC(tmp2[0], tmp2[1] - 1, tmp2[2], tmp2[3], tmp2[4], tmp2[5]));
   let utcDate = new Date(jstDate.getTime() - (9 * 60 * 60 * 1000));
   teee["timestamp"] = utcDate.getTime() / 1000;

   // Extracting length
   tmpStr1 = "\u9577\u3055</dt><dd>";
   tmp1 = feats_HSL.indexOf(tmpStr1) + tmpStr1.length;
   feats_HSL = feats_HSL.substring(tmp1);
   tmp1 = feats_HSL.indexOf("</dd>");
   tmp2 = feats_HSL.substring(0,tmp1).split(":");
   teee["duration"] = (parseInt(tmp2[0], 10) * 60 * 60) + (parseInt(tmp2[1], 10) * 60) + parseInt(tmp2[2], 10);
   
   // Extracting uploader id and name
   tmpStr1 = "user/";
   tmp1 = feats_HSL.indexOf(tmpStr1) + tmpStr1.length;
   feats_HSL = feats_HSL.substring(tmp1);
   tmp2 = feats_HSL.substring(0, feats_HSL.indexOf('('));
   tmp2 = tmp2.split('">');
   teee["uploader_id"] = tmp2[0];
   teee["uploader_url"] = "https://www.nicovideo.jp/user/" + tmp2[0];
   teee["uploader"] = tmp2[1].trim();

   // Extracting description
   tmpStr1 = "\u52D5\u753B\u8AAC\u660E</dt><dd>";
   tmp1 = feats_HSL.indexOf(tmpStr1) + tmpStr1.length;
   teee["description"] = feats_HSL.substring(tmp1);

   teee['extractor_key'] = "Niconico";
   console.log(teee);

   fs.writeFileSync('F:/Dropbox/NodeJS/fetchedNicoInfo/' + videoId + '-edited.json', JSON.stringify(teee));
}
