var path = require('path');
var fs = require('fs');

var findString  = '/channel/2669507/cliplink/';
var findString2 = '?act=clip';

var toBeAdded = 'https://tv.kakao.com';

var fileString = fs.readFileSync('kakaoo.txt', 'utf8')

var fLoc = fileString.indexOf(findString);
var sLoc = fileString.indexOf(findString2);

var stillRun = true;

var foundId = toBeAdded + fileString.substring(fLoc, sLoc);

fs.appendFileSync("kakao-liost.txt", foundId + "\n");

while (stillRun) {
   stillRun = false;
   
   fileString = fileString.substring(sLoc + 1);
   
   fLoc = fileString.indexOf(findString);
   sLoc = fileString.indexOf(findString2);
   
   if (fLoc > -1 && sLoc > -1)  stillRun = true;
   
   if (stillRun) {
      foundId = toBeAdded + fileString.substring(fLoc, sLoc);
      
      fs.appendFileSync("kakao-liost.txt", foundId + "\n");
   }
}