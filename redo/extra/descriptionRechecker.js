//requiring path and fs modules
var path = require('path');
var fs = require('fs');
const url = require('url');
const http = require('http');
const XMLHttpRequest_node = require("xmlhttprequest").XMLHttpRequest;

const br =  '\r\n';
//var videoList = '';

var gatheredIds = [];
//var gatheredJson = [];


//var exampleFile = fs.readFileSync('massJsonTesting\\bagiIEpLiLI.info.json', 'utf8');
//var parsedJSON = JSON.parse(exampleFile);

//console.log(exampleFile);

//var toBeSortedList = [];
    /*
videoList += '<hr/>' + br;
        videoList += '<div><b>' + parsedJSON.title + '</b><br/>' + br;
        videoList += '<code><a href=\"' + parsedJSON.webpage_url + '\" target=\"_blank\">' + parsedJSON.webpage_url + '</a></code><br/><br/>' + br;
        videoList += 'Uploader: <a href=\"' + parsedJSON.uploader_url + '\" target=\"_blank\">' + parsedJSON.uploader + ' (<code>' + parsedJSON.uploader_id + '</code>)</a><br/>' + br;
        videoList += 'Release date: ' + parsedJSON.upload_date + '</div>' + br;       */
//console.log('Started forming the server')  ;

const folderSrc = 'F:/Dropbox/YTPMV/YTPMV_compilation';

checkFolder(folderSrc);

function checkFolder(folderSource) {
   fs.readdir(folderSource, (err, files) => {
      if (err) throw err;

      files.forEach(file => {
         let tmpSrc = folderSource + '/' + file;
         
         fs.stat(tmpSrc, (err, stats) => {
            if (err) throw err;
            
            if (stats.isFile()) checkFile(tmpSrc);

            if (stats.isDirectory()) checkFolder(tmpSrc);
         });
      });
   });
}

function checkFile(fileSource) {
   let fiiil = fs.readFileSync(fileSource, 'utf8');

   let fileName = path.basename(fileSource);

   //console.log(fiiil);

   let retJson = convertFilename(fileName); 
   retJson["description"] = fiiil;
   
   let extKey = "Youtube";
   
   if (retJson.id.substring(0,2) === "sm" && !isNaN(parseFloat(retJson.id.substring(2))) && !isNaN(parseFloat(retJson.uploader_id))) extKey = "Niconico";
   
   retJson["extractor_key"] = extKey;
   
   retJson["duration"] = -421;


   if (!gatheredIds.includes(retJson["id"])) {
       console.log(fileName);
       console.log(retJson);
       gatheredIds.push(retJson["id"]);
       fs.writeFileSync('F:/tmpvid2/--- ' + retJson["id"] + ' -- finnredo.json', JSON.stringify(retJson),{encoding:'utf8'});
       //fs.writeFileSync('F:/tmpvid/--- ' + retJson["id"] + ' -- finnredo.json', JSON.stringify(retJson));
   }
}

function convertFilename(fName) {
   let returnJson = {};
   let tmp1 = fName.substring(0,8);

   if (isNaN(parseFloat(tmp1))) throw new Error('Not a fitting file!');

   returnJson["upload_date"] = tmp1;

   let checking1 = '[';
   let checking2 = '] --';
   let checkEnd =  '].description';

   let checkingPosition2 = fName.indexOf(checking2);
   let checkingPositionEnd = fName.indexOf(checkEnd);

   var tmp2 = fName.substring(11,checkingPosition2);
   var tmp3 = tmp2.indexOf(checking1);
   var tmp4 = tmp2.indexOf(checking1,tmp3 + 1);

   while (tmp4 !== -1) {
      tmp3 = tmp4;

      tmp4 = tmp2.indexOf(checking1,tmp3 + 1);
   }

   returnJson["id"]    = tmp2.substring(tmp3 + 1);
   returnJson["title"] = tmp2.substring(0,tmp3).trim();

   tmp2 = fName.substring((checkingPosition2 + checking2.length),checkingPositionEnd);
   console.log (tmp2);
   tmp3 = tmp2.indexOf(checking1);
   tmp4 = tmp2.indexOf(checking1,tmp3 + 1);
   
   while (tmp4 !== -1) {
      tmp3 = tmp4;

      tmp4 = tmp2.indexOf(checking1,tmp3 + 1);
   }
   
   returnJson["uploader"]    = tmp2.substring(0,tmp3).trim();
   returnJson["uploader_id"] = tmp2.substring(tmp3 + 1);

   //let tmp2 =
   
   return returnJson;
}

/*
var rString = '';
var tu;
for (tu = 41; tu >= 0; tu--) {
//var videoitaFile = fs.readFileSync('videoita.json', 'utf8');
//var parsedVideos = JSON.parse(videoitaFile);
    var parsedVideos = JSON.parse(fs.readFileSync(('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts/vids' + tu + '.json'), 'utf8'));

//var k = 25;
//var searchWord = 'thwy';


    //for (i = 0; i < 100; i++) {
    for (i = 0; i < parsedVideos.videos.length; i++) {
       //var dewIt = true;

       if (parsedVideos.videos[i].extractor_key === "BilibiliSpaceVideo") continue; // dewIt = false;

       if (parsedVideos.videos[i].extractor_key === "YoutubeTab") continue; // dewIt = false;

       let tmpId = parsedVideos.videos[i].id;

       if (parsedVideos.videos[i].extractor_key === "BiliBili" && Array.isArray(parsedVideos.videos[i].id)) tmpId = parsedVideos.videos[i].id[0];

       let vidoId = parsedVideos.videos[i].extractor_key.toLowerCase() + ' ' + tmpId;

       rString += vidoId + '\n';
    }
}
*/

//fs.writeFileSync('F:/Dropbox/NodeJS/already-downloaded.txt', rString);
console.log("Tallennettu");

//console.log('List done');