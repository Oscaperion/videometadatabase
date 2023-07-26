//requiring path and fs modules
var path = require('path');
var fs = require('fs');
const url = require('url');
const http = require('http');

// Easy changes can be made here:

let searchingUser = "Rlcemaster3";
// Make sure these are in form "YYYYMMDD"
let checkDates = ["20100300","20200600"];

// =============================

let checkedUid = -1;

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
//var videoList = '';

var gatheredIds = [];
//var gatheredJson = [];

console.log("Tallennettu");