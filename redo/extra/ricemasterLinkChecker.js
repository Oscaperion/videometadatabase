//requiring path and fs modules
var path = require('path');
var fs = require('fs');
const url = require('url');
const http = require('http');

// ===============================
// Easy changes can be made here:

let searchingUser = "Rlcemaster3";

// Make sure the dates are in form "YYYYMMDD"
let checkDates = [201003,202006];

// ===============================

let checkedUid = -1;
let reups = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/reuploads.json', 'utf8'));
reups = reups.map(item => item.id);

{
   let userList = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/youtubeUserList2.json', 'utf8'));
   for (let i = 0; i < userList.length; i++) {
       let tmpAr = userList[i];
       if (tmpAr.includes(searchingUser)) {
           checkedUid = i;
           break;
       }
   }
}

if (checkedUid == -1) throw new Error('No user found with the ID "' + searchingUser) + '"';
else console.log('Found a user with the ID "' + searchingUser + '" (Placement ID: ' + checkedUid + ')');

// This makes sure the first date is more recent
if (checkDates[0] < checkDates[1]) {
   let tmp = checkDates[0];
   checkDates[0] = checkDates[1];
   checkDates[1] = tmp;
   console.log("Swapped");
}

const br =  '\r\n';
let gatheredLinks = [];

for (let k = checkDates[0]; k >= checkDates[1]; k--) {
   try {
      let checkingFile = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts2/vids' + k + '.json', 'utf8'));
      console.log(k);
      checkFile(checkingFile);
   } catch (error) {
      continue;
   }
}

function checkFile(checkedFile) {
   for (let p = 0; p < checkedFile.length; p++) {
      if (checkedUid === checkedFile[p].uId && !reups.includes(checkedFile[p].id)) checkVideo(checkedFile[p]);
   }
}

function checkVideo(checkedVideo) {
   console.log(checkedVideo.id);
   
   let desc = checkedVideo.description;
   
   let findStr1 = 'watch/';
   let findStr2 = '\n';

   let tmpStr1 = desc.indexOf(findStr1);

   if (tmpStr1 !== -1) {
      //console.log("Lollero");

   // console.log(tmpStr1);

   let tmpStr2 = desc.substring(tmpStr1 + findStr1.length);

   let tmpStr3 = tmpStr2.indexOf(findStr2);
   let tmpStr4;
   if (tmpStr3 > -1) tmpStr4 = tmpStr2.substring(0,tmpStr3).trim();
   else tmpStr4 = tmpStr2.trim();

   let retTmp = {};

   retTmp["id"] = checkedVideo.id;
   retTmp["reup"] = tmpStr4;
   retTmp["reup_site"] = "Niconico";

   console.log(retTmp);
   }
}