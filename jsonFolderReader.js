//requiring path and fs modules
var path = require('path');
var fs = require('fs');
const url = require('url');
const http = require('http');

const folderName =  'massJsonTesting';
var videoList = '';

       /*
var exampleFile = fs.readFileSync('massJsonTesting1\\SO8RSZNyWXs.info.json', 'utf8');
var parseJSON = JSON.parse(exampleFile);
console.log(parseJSON.uploader_url);
if (parseJSON.uploader_url === undefined) {
   console.log("This works 23");
} else {
   console.log("This works 46");
}    */
/*
if (parsedJSON.uploader_url.length == 0) {
  console.log("This works");
}      */

//console.log(exampleFile);

var toBeSortedList = [];

var j = 19;
readFolders();
//writeFile();

function readFolders() {
var readingDone = false;

//for (j = 0; j <= 18; j++) {
//for (j = 16; j >= 0; j--) {

//for (j = 8; j <= 8; j++) {
  var dirName = folderName + j;
  console.log('Reading the folder: ' + dirName);
  //joining path of directory
  var directoryPath = path.join(dirName);
  //passsing directoryPath and callback function
  fs.readdirSync(directoryPath).forEach(function (file) {
     if (file.localeCompare('desktop.ini') != 0) {



        //console.log(file);
        var filePath = dirName + '\\' + file;
       // console.log(filePath);
        //console.log(file + ' is being read' );

        var parsedJSON = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                  /*
        if (ext_key.indexOf("NiconicoPlaylist") > -1) {
           continue;
        }

        if (ext_key.indexOf("NiconicoUser") > -1) {
           continue;
        }       */

        var uPage = parsedJSON.uploader_url;

        //console.log(uPage);

        if (uPage === undefined) {
           var tmp1 = parsedJSON.extractor_key;
           if (tmp1.indexOf("Niconico") > -1) {
              uPage = 'https://www.nicovideo.jp/user/' + parsedJSON.uploader_id;
           } 
           if (tmp1.indexOf("BiliBili") > -1) {
              uPage = 'https://space.bilibili.com/' + parsedJSON.uploader_id;
           }
           if (tmp1.indexOf("Youtube") > -1) {
              uPage = 'https://www.youtube.com/user/' + parsedJSON.uploader_id;
           }
           if (tmp1.indexOf("Dailymotion") > -1) {
              uPage = 'https://www.dailymotion.com/' + parsedJSON.uploader;
           }
           if (tmp1.indexOf("VK") > -1) {
              uPage = 'https://vk.com/videos' + parsedJSON.uploader_id;
           }
        }

        // var cmpStr = parsedJSON.upload_date + ' ' + parsedJSON.title + ' ' + parsedJSON.id + ' ' + parsedJSON.uploader + ' ' +  parsedJSON.uploader_url;

        var newVideoInfo = {
            upload_date: parsedJSON.upload_date,
            id: parsedJSON.id,
            webpage_url: parsedJSON.webpage_url,
            title: parsedJSON.title,
            uploader: parsedJSON.uploader,
            uploader_id: parsedJSON.uploader_id,
            uploader_url: uPage,
            duration: parsedJSON.duration,
            description: parsedJSON.description,
            tags: parsedJSON.tags,
            extractor_key: parsedJSON.extractor_key
        };

        console.log(newVideoInfo.id + ' -- ' + dirName);

        var willBeAdded = true;
        if (newVideoInfo.extractor_key.indexOf("NiconicoUser") > -1) {
           console.log("NiconicoUser: not adding");
           willBeAdded = false;
        }

        if (newVideoInfo.extractor_key.indexOf("NiconicoPlaylist") > -1) {
           console.log("NiconicoPlaylist: not adding");
           willBeAdded = false;
        }
        
        if (newVideoInfo.extractor_key.indexOf("BilibiliChannel") > -1) {
           console.log("BilibiliChannel: not adding");
           willBeAdded = false;
        }

        //if (!(newVideoInfo.extractor_key.indexOf("NiconicoUser") < 0 || newVideoInfo.extractor_key.indexOf("NiconicoPlaylist") < 0)) {
          if (willBeAdded) {
           toBeSortedList.push(newVideoInfo);
          }
        //}

     }
  });
//}
console.log('Folders read');
readingDone = true;
if (readingDone) writeFile();
    }
    
function writeFile() {
    
    var i;
    console.log('Rearranging the list');
    
    // First, we sort by title
    toBeSortedList = toBeSortedList.sort(function(a,b) {
       /*
       var nameA = a.title.toUpperCase(); // ignore upper and lowercase
       var nameB = b.title.toUpperCase(); // ignore upper and lowercase
       */
                    /*
       var nameA = a;
       var nameB = b;

       if (nameA === undefined) nameA = "undefined";
       if (nameB === undefined) nameB = "undefined";

       nameA = nameA.title.toUpperCase();
       nameB = nameB.title.toUpperCase();
                      */
                      
       var nameA = (a.title + ' ' + a.id).toUpperCase();
       var nameB = (b.title + ' ' + b.id).toUpperCase();

       if (nameA < nameB) {
          return -1; //nameA comes first
       }
       if (nameA > nameB) {
          return 1; // nameB comes first
       }
       return 0;  // names must be equal

    });
    
    // Then by upload date
    toBeSortedList = toBeSortedList.sort(function(a,b) {
       var nameA = a.upload_date ;
       var nameB = b.upload_date ;
       
       if (nameA === undefined) nameA = "0";
       if (nameB === undefined) nameB = "0";

       if (nameA < nameB) {
          return 1; //nameB comes first
       }
       if (nameA > nameB) {
          return -1; // nameA comes first
       }
       return 0;  // names must be equal

    });
          /*
    // Original method
    //var tmp1 = toBeSortedList;
    for (i = 0; i < toBeSortedList.length; i++) {
       //var tmp = toBeSortedList[i];
       var replaceNum = i;
       var j;
       for (j = i; j < toBeSortedList.length; j++) {
           if (toBeSortedList[replaceNum].upload_date < toBeSortedList[j].upload_date) {
               replaceNum = j;
           }
       }
       if (replaceNum != i) {
           var tmp = toBeSortedList[i];
           toBeSortedList[i] = toBeSortedList[replaceNum];
           toBeSortedList[replaceNum] = tmp;
       }

       console.log(toBeSortedList[i].upload_date);
    }   */

    console.log("Saving the JSON file");
    //var jsonifyData =  JSON.stringify({videos: toBeSortedList});
    //fs.writeFileSync('videoita.json', jsonifyData);
    //var nimii = 'videoita.json';
    var nimii = 'YTPMV Metadata Archive JSON/split_parts/vids' + j + '.json';
    fs.writeFileSync(nimii, JSON.stringify({videos: toBeSortedList}));
    //fs.writeFileSync('videoita.json', JSON.stringify({videos: sortedList}));
    console.log("Saved!");
}