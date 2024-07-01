/*

This script takes the JSON files from a folder and then compiles them into a single file.

*/

//requiring path and fs modules
let path = require('path');
let fs = require('fs');
const url = require('url');
const http = require('http');

const folderName =  'F:/Dropbox/NodeJS/massJsonTesting';
let videoList = '';

let toBeSortedList = [];

let changeHere = false;

let readTwitterVids = changeHere;
//let ignoreBilibiliPlaylists = changeHere;

//for (j = 1; j <= 25; j++) {
for (let j = 55; j >= 55; j--) {
//for (let j = 0; j >= 0; j--) {

//for (let j = 1; j <= 28; j++) {
  let dirName = folderName + j;
  console.log('Reading the folder: ' + dirName);
  //joining path of directory
  let directoryPath = path.join(dirName);
  //passsing directoryPath and callback function
  fs.readdirSync(directoryPath).forEach(function (file) {
     if (file.localeCompare('desktop.ini') != 0) {


        let willBeAdded = true;

        let filePath = dirName + '\\' + file;

        let parsedJSON = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        let uPage = parsedJSON.uploader_url;
        let vidId = parsedJSON.id;

        //console.log(uPage);
        let tmp1 = parsedJSON.extractor_key;
        
        // For Odysee
        if (tmp1 === "LBRY" && parsedJSON.webpage_url.includes("odysee.com/")) {
           uPage = 'https://odysee.com/@channel:' + parsedJSON.channel_id;
           parsedJSON["uploader"] = parsedJSON.channel;
        }

        if (uPage === undefined) {
           if (tmp1 === "Niconico") {
              uPage = 'https://www.nicovideo.jp/user/' + parsedJSON.uploader_id;
           }

           if (tmp1 === "BiliBili") {
              if (parsedJSON.upload_date === undefined) {
                 return;
              }
              
              if (vidId.includes("_")) {
                 let tmp1 = vidId.indexOf("_");
                 
                 let tmp2 = vidId.substring(tmp1);

                 let tmp3 = (tmp2 === "_part1" || tmp2 === "_p1");

                 if (!tmp3) {
                   console.log("Bilibili page (" + vidId + ") that is not page 1: not adding");
                   return;
                 }
              }

              uPage = 'https://space.bilibili.com/' + parsedJSON.uploader_id;
              let idTmp = [parsedJSON.webpage_url_basename];
              let testRun = true;
              let idsFound = false;

              if (parsedJSON._old_archive_ids !== undefined) {
                 idTmp = [];

                 let tmp1 = parsedJSON._old_archive_ids[0].substring(8).trim();
                 let tmp2 = tmp1.indexOf('_');
                 // The value should be saved as follows: "_old_archive_ids": ["bilibili 907944915_part1"]
                 // And what I want to extract into tmp1 is "907944915_part1"
                         /*
                 if (tmp1.substring(tmp2) !== "_part1") {
                    return;
                 }     */
                 
                 let tmp3 = parsedJSON.id;
                 if (tmp3.includes('_')) tmp3 = parsedJSON.id.substring(0,parsedJSON.id.indexOf('_'));

                 testRun = false;
                 idsFound = true;

                 idTmp.push(tmp3);
                 idTmp.push("av" + tmp1.substring(0,tmp2));
              }
              
              if (!idsFound && parsedJSON.bv_id !== undefined) {
                 idTmp = [];
                 
                 let tmp1 = parsedJSON.id;
                 let tmp2 = tmp1.indexOf('_');
                 // Example: "id": "103373_part1", "bv_id": "BV1Zx411c7s5"
                           /*
                 if (tmp1.substring(tmp2) !== "_part1") {
                    return;
                 }       */

                 testRun = false;
                 idsFound = true;

                 let testtt = "This is here to crash the code for testing purposes lol";

                 let tmp3 = parsedJSON.bv_id;
                 if (tmp3.includes('_')) tmp3 = parsedJSON.bv_id.substring(0,parsedJSON.bv_id.indexOf('_'));

                 idTmp.push(tmp3);
                 idTmp.push("av" + tmp1.substring(0,tmp2));
              }

              if (!idsFound && (parsedJSON.webpage_url_basename.substring(0,2) === 'BV' || parsedJSON.webpage_url_basename.substring(0,2) === 'bv') && parsedJSON.webpage_url_basename.substring(2) !== parsedJSON.id) {
                 idTmp = [];

                 let tmpAv = "av" + parsedJSON.id;
                 if (parsedJSON.id.includes("_")) {
                    let tmpp2 = parsedJSON.id.substring(0, parsedJSON.id.indexOf("_"));
                    tmpAv = "av" + tmpp2;
                 }
                 
                 let tmpBv = parsedJSON.webpage_url_basename;
                 if (parsedJSON.webpage_url_basename.substring(0,2) === 'bv') {
                    tmpBv = "BV" + parsedJSON.webpage_url_basename.substring(2);
                 }

                 testRun = false;
                 idsFound = true;
                 idTmp.push(tmpBv);
                 idTmp.push(tmpAv);
              }

              if (!idsFound && parsedJSON.webpage_url_basename.substring(0,2) === 'av' && parsedJSON.id.includes(parsedJSON.webpage_url_basename.substring(2))) {
                 idTmp = [];
                 
                 let tmpStr = parsedJSON.webpage_url_basename;
                 if (tmpStr.includes("_")) {
                    tmpStr = parsedJSON.webpage_url_basename.substring(0, parsedJSON.webpage_url_basename.indexOf("_"));
                 }

                 //fs.appendFileSync('F:/Dropbox/NodeJS/bilibili-rering2.txt', 'https://www.bilibili.com/video/' + parsedJSON.webpage_url_basename + '/\n');
                 testRun = false;
                 idsFound = true;
                 idTmp.push(tmpStr.trim());
              }
              
              if (!idsFound && (parsedJSON.webpage_url_basename.substring(0,2) === 'BV' || parsedJSON.webpage_url_basename.substring(0,2) === 'bv') && parsedJSON.id.includes(parsedJSON.webpage_url_basename.substring(2))) {
                 idTmp = [];
                 
                 let tmpStr = parsedJSON.webpage_url_basename;
                 if (tmpStr.includes("_")) {
                    tmpStr = parsedJSON.webpage_url_basename.substring(0, parsedJSON.webpage_url_basename.indexOf("_"));
                 }
                 
                 if (tmpStr.substring(0,2) === 'bv') {
                    tmpStr = "BV" + tmpStr.substring(2);
                 }

                 //fs.appendFileSync('F:/Dropbox/NodeJS/bilibili-rering2.txt', 'https://www.bilibili.com/video/' + parsedJSON.webpage_url_basename + '/\n');
                 testRun = false;
                 idsFound = true;
                 idTmp.push(tmpStr.trim());
              }
              
              if (testRun) {
                 console.log("Check this ID: " + parsedJSON.id);
                 console.log(testtt);
                 //fs.appendFileSync('F:/Dropbox/NodeJS/bilibili-rering2.txt', 'https://www.bilibili.com/video/av' + parsedJSON.id + '/\n');
                 //fs.appendFileSync('F:/Dropbox/NodeJS/bilibili-rering2.txt', 'https://www.bilibili.com/video/BV' + parsedJSON.id + '/\n');
                 return;
              }

              console.log("Bilibili IDs: " + idTmp);
              vidId = idTmp;
           }
           if (tmp1 === "Youtube") {
              uPage = 'https://www.youtube.com/user/' + parsedJSON.uploader_id;
           }
           if (tmp1 === "Dailymotion") {
              uPage = 'https://www.dailymotion.com/' + parsedJSON.uploader;
           }
           if (tmp1 === "VK") {
              uPage = 'https://vk.com/videos' + parsedJSON.uploader_id;
           }
           if (tmp1 === "Kakao") {
              uPage = 'https://tv.kakao.com/channel/' + parsedJSON.uploader_id;
           }
        }
        
        let webbUrl = parsedJSON.webpage_url;


        if (tmp1 === "Twitter") {
            webbUrl = "https://twitter.com/" + parsedJSON.uploader_id + "/status/" + parsedJSON.display_id;
        }

        // let cmpStr = parsedJSON.upload_date + ' ' + parsedJSON.title + ' ' + parsedJSON.id + ' ' + parsedJSON.uploader + ' ' +  parsedJSON.uploader_url;

        let ext_tmp = parsedJSON.extractor_key;
        if (ext_tmp === "YoutubeWebArchive") {
            if (parsedJSON.upload_date === undefined) {
               console.log("Faulty arhived page from Wayback Machine, no upload_date. Not adding: " + parsedJSON.id);
               throw new Error("CHECK THE FILE");
               // return;
            }

            if (parsedJSON.uploader !== undefined && parsedJSON.channel_id === undefined && parsedJSON.uploader_id === undefined) {
               // parsedJSON["uploader_id"] = parsedJSON.uploader;
               console.log("Faulty arhived page from Wayback Machine, no uploader_id. Not adding: " + parsedJSON.id);
               throw new Error("CHECK THE FILE");
            }

            ext_tmp = "Youtube";
        }

        let newVideoInfo = {
            upload_date: parsedJSON.upload_date,
            id: vidId,
            webpage_url: webbUrl,
            title: parsedJSON.title,
            uploader: parsedJSON.uploader,
            uploader_id: parsedJSON.uploader_id,
            uploader_url: uPage,
            channel_id: parsedJSON.channel_id,
            duration: parsedJSON.duration,
            description: parsedJSON.description,
            tags: parsedJSON.tags,
            extractor_key: ext_tmp
        };

        console.log(newVideoInfo.id + ' -- ' + dirName);

        
        if (!readTwitterVids) {
           if (newVideoInfo.extractor_key === "Twitter") {
              console.log("Not adding Twitter videos currently");
              return;
              //willBeAdded = false;
           }
        }

        if (newVideoInfo.extractor_key === "VKUserVideos") {
           console.log("VKUserVideos: not adding");
           return;
           //willBeAdded = false;
        }

        if (newVideoInfo.extractor_key === "NiconicoUser") {
           console.log("NiconicoUser: not adding");
           return;
           //willBeAdded = false;
        }

        if (newVideoInfo.extractor_key === "NiconicoPlaylist") {
           console.log("NiconicoPlaylist: not adding");
           return;
           //willBeAdded = false;
        }

        if (newVideoInfo.extractor_key === "BilibiliChannel") {
           console.log("BilibiliChannel: not adding");
           return;
           //willBeAdded = false;
        }

        //if (ignoreBilibiliPlaylists) {
           if (newVideoInfo.extractor_key === "BiliBili" && newVideoInfo.upload_date === undefined) {
              console.log("Bilibili with undefined release date: not adding");
              return;
              //willBeAdded = false;
           }

           if (newVideoInfo.extractor_key === "BiliBili" && newVideoInfo.id.indexOf("_p") > -1 && ((newVideoInfo.id.indexOf("_part1") == -1 || newVideoInfo.id.substring(newVideoInfo.id.indexOf("_part1")).length > 6) && (newVideoInfo.id.indexOf("_p1") == -1 || newVideoInfo.id.substring(newVideoInfo.id.indexOf("_p1")).length > 3))) {
              console.log("Bilibili page that is not page 1: not adding");
              return;
              //willBeAdded = false;
           }
        //}
        

        
        if (newVideoInfo.extractor_key === "Niconico" && newVideoInfo.upload_date === undefined) {
           console.log("Niconico with undefined release date: not adding");
           return;
           //willBeAdded = false;
        }
        
        if (newVideoInfo.extractor_key === "YoutubeTab") {
           console.log("YoutubeTab: not adding");
           return;
           //willBeAdded = false;
        }
        
        if (newVideoInfo.extractor_key === "YoutubeSearchURL") {
           console.log("YoutubeSearchURL: not adding");
           return;
           //willBeAdded = false;
        }
        
        if (newVideoInfo.extractor_key === "NicovideoSearchURL") {
           console.log("NicovideoSearchURL: not adding");
           return;
           //willBeAdded = false;
        }
        
        if (newVideoInfo.extractor_key === "SoundcloudUser") {
           console.log("SoundcloudUser: not adding");
           return;
           //willBeAdded = false;
        }
        
        if (newVideoInfo.extractor_key === "SoundcloudSet") {
           console.log("SoundcloudSet: not adding");
           return;
           //willBeAdded = false;
        }

        if (newVideoInfo.extractor_key === "VimeoUser") {
           console.log("VimeoUser: not adding");
           return;
           //willBeAdded = false;
        }

        //if (!(newVideoInfo.extractor_key.indexOf("NiconicoUser") < 0 || newVideoInfo.extractor_key.indexOf("NiconicoPlaylist") < 0)) {
          if (willBeAdded) {
           toBeSortedList.push(newVideoInfo);
          }
        //}

     }
  });
  
  let i;
  
     /*
    console.log('Rearranging the list');
    
    // First, we sort by title
    toBeSortedList = toBeSortedList.sort(function(a,b) {
       let nameA = (a.title + ' ' + a.id).toUpperCase();
       let nameB = (b.title + ' ' + b.id).toUpperCase();

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
       let nameA = a.upload_date ;
       let nameB = b.upload_date ;
       
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
    */


          /*
    // Original method
    //let tmp1 = toBeSortedList;
    for (i = 0; i < toBeSortedList.length; i++) {
       //let tmp = toBeSortedList[i];
       let replaceNum = i;
       let j;
       for (j = i; j < toBeSortedList.length; j++) {
           if (toBeSortedList[replaceNum].upload_date < toBeSortedList[j].upload_date) {
               replaceNum = j;
           }
       }
       if (replaceNum != i) {
           let tmp = toBeSortedList[i];
           toBeSortedList[i] = toBeSortedList[replaceNum];
           toBeSortedList[replaceNum] = tmp;
       }

       console.log(toBeSortedList[i].upload_date);
    }   */

    console.log("Saving the JSON file");
    //let jsonifyData =  JSON.stringify({videos: toBeSortedList});
    //fs.writeFileSync('videoita.json', jsonifyData);
    //let nimii = 'YTPMV Metadata Archive JSON/videoita.json';
    let nimii = 'F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts/vids' + j + '.json';

    fs.writeFileSync(nimii, JSON.stringify({videos: toBeSortedList}));
    //fs.writeFileSync('videoita.json', JSON.stringify({videos: sortedList}));
    console.log("Saved");
    toBeSortedList = [];
    }

console.log('Folders read');    /*
readingDone = true;
if (readingDone) writeFile();
    }   */
