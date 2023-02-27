//requiring path and fs modules
var path = require('path');
var fs = require('fs');
const url = require('url');
const http = require('http');

const folderName =  'F:/Dropbox/NodeJS/massJsonTesting';
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

var changeHere = false;

//var j = 29;
var readTwitterVids = changeHere;
var ignoreBilibiliPlaylists = changeHere;



//for (j = 1; j <= 25; j++) {
for (var j = 39; j >= 39; j--) {
//for (var j = 0; j >= 0; j--) {

//for (var j = 1; j <= 28; j++) {
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

        var tmp1 = parsedJSON.extractor_key;
        if (uPage === undefined) {
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
           if (tmp1 === "Kakao") {
              uPage = 'https://tv.kakao.com/channel/' + parsedJSON.uploader_id;
           }
        }
        
        var webbUrl = parsedJSON.webpage_url;


        if (tmp1 === "Twitter") {
            webbUrl = "https://twitter.com/" + parsedJSON.uploader_id + "/status/" + parsedJSON.display_id;
        }

        // var cmpStr = parsedJSON.upload_date + ' ' + parsedJSON.title + ' ' + parsedJSON.id + ' ' + parsedJSON.uploader + ' ' +  parsedJSON.uploader_url;

        var newVideoInfo = {
            upload_date: parsedJSON.upload_date,
            id: parsedJSON.id,
            webpage_url: webbUrl,
            title: parsedJSON.title,
            uploader: parsedJSON.uploader,
            uploader_id: parsedJSON.uploader_id,
            uploader_url: uPage,
            channel_id: parsedJSON.channel_id,
            duration: parsedJSON.duration,
            description: parsedJSON.description,
            tags: parsedJSON.tags,
            extractor_key: parsedJSON.extractor_key
        };

        console.log(newVideoInfo.id + ' -- ' + dirName);

        var willBeAdded = true;
        
        if (!readTwitterVids) {
           if (newVideoInfo.extractor_key === "Twitter") {
              console.log("Not adding Twitter videos currently");
              willBeAdded = false;
           }
        }

        if (newVideoInfo.extractor_key === "VKUserVideos") {
           console.log("VKUserVideos: not adding");
           willBeAdded = false;
        }

        if (newVideoInfo.extractor_key === "NiconicoUser") {
           console.log("NiconicoUser: not adding");
           willBeAdded = false;
        }

        if (newVideoInfo.extractor_key === "NiconicoPlaylist") {
           console.log("NiconicoPlaylist: not adding");
           willBeAdded = false;
        }

        if (newVideoInfo.extractor_key === "BilibiliChannel") {
           console.log("BilibiliChannel: not adding");
           willBeAdded = false;
        }

        if (ignoreBilibiliPlaylists) {
           if (newVideoInfo.extractor_key === "BiliBili" && newVideoInfo.upload_date === undefined) {
              console.log("Bilibili with undefined release date: not adding");
              willBeAdded = false;
           }
           
           else if (newVideoInfo.extractor_key === "BiliBili" && newVideoInfo.id.indexOf("_p") > -1 && ((newVideoInfo.id.indexOf("_part1") == -1 || newVideoInfo.id.substring(newVideoInfo.id.indexOf("_part1")).length > 6) && (newVideoInfo.id.indexOf("_p1") == -1 || newVideoInfo.id.substring(newVideoInfo.id.indexOf("_p1")).length > 3))) {
              console.log("Bilibili page that is not page 1: not adding");
              willBeAdded = false;
           }
        }
        

        
        if (newVideoInfo.extractor_key === "Niconico" && newVideoInfo.upload_date === undefined) {
           console.log("Niconico with undefined release date: not adding");
           willBeAdded = false;
        }
        
        if (newVideoInfo.extractor_key === "YoutubeTab") {
           console.log("YoutubeTab: not adding");
           willBeAdded = false;
        }       
        
        if (newVideoInfo.extractor_key === "YoutubeSearchURL") {
           console.log("YoutubeSearchURL: not adding");
           willBeAdded = false;
        }
        
        if (newVideoInfo.extractor_key === "NicovideoSearchURL") {
           console.log("NicovideoSearchURL: not adding");
           willBeAdded = false;
        }
        
        if (newVideoInfo.extractor_key === "SoundcloudUser") {
           console.log("SoundcloudUser: not adding");
           willBeAdded = false;
        }
        
        if (newVideoInfo.extractor_key === "SoundcloudSet") {
           console.log("SoundcloudSet: not adding");
           willBeAdded = false;
        }

        if (newVideoInfo.extractor_key === "VimeoUser") {
           console.log("VimeoUser: not adding");
           willBeAdded = false;
        }

        //if (!(newVideoInfo.extractor_key.indexOf("NiconicoUser") < 0 || newVideoInfo.extractor_key.indexOf("NiconicoPlaylist") < 0)) {
          if (willBeAdded) {
           toBeSortedList.push(newVideoInfo);
          }
        //}

     }
  });
  
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
    //var nimii = 'YTPMV Metadata Archive JSON/videoita.json';
    var nimii = 'F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts/vids' + j + '.json';

    fs.writeFileSync(nimii, JSON.stringify({videos: toBeSortedList}));
    //fs.writeFileSync('videoita.json', JSON.stringify({videos: sortedList}));
    console.log("Saved");
    toBeSortedList = [];
    }

console.log('Folders read');    /*
readingDone = true;
if (readingDone) writeFile();
    }   */
