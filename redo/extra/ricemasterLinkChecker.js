//requiring path and fs modules
var path = require('path');
var fs = require('fs');
const url = require('url');
const http = require('http');

let searchingUser = "Rlcemaster3";
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

console.log(checkedUid);

const br =  '\r\n';
//var videoList = '';

var gatheredIds = [];
//var gatheredJson = [];

console.log("Tallennettu");