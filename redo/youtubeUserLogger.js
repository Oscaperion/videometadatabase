//requiring path and fs modules
let path = require('path');
let fs = require('fs');
const url = require('url');
const http = require('http');

                             /*
const keyword1 = 'nicovideo.jp/tag';
const keyword2 = 'fwvaa1c';
const search1 = '>';
const search2 = '</div>';  */

let foundTags;

// let vids = {"videos": JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts/finnredo.json', 'utf8')) };
let vids = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts/vids66.json', 'utf8'));
//let vids = {"videos": JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts2/vids202210.json', 'utf8')) };

let replll =  JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/youtubeUserList-uncompressed.json', 'utf8'));
//let tmprep =  replll.map(entry => entry.uploader_id).flat();
//console.log(tmprep);

let orttt = 0;

//while (orttt < vids.videos.length) {
for (let orttt = 0; orttt < vids.videos.length; orttt++) {

//let ertt = 10 + (10 * opp);
//if (ertt >  vids.videos.length ) ertt = vids.videos.length;
//let orttt2 = 0;
//console.log("Abba");

// while (orttt2 < 10 && orttt < vids.videos.length) {
  //console.log("aAbba " + orttt);
  if (vids.videos[orttt].extractor_key === "Youtube") {
     let doIt = true;

     for (let j = 0; j < replll.length; j++) {
         if (vids.videos[orttt].channel_id === undefined) {
            //if (vids.videos[orttt].uploader_id !== undefined && !tmprep.includes(vids.videos[orttt].uploader_id)) {
            if (vids.videos[orttt].uploader_id.substring(0,2) === "UC" && vids.videos[orttt].uploader_id.length === 24) {
               vids.videos[orttt].channel_id = vids.videos[orttt].uploader_id;

            } else {
               doIt = false;
            }
         }
         if (!doIt) break;

         if (vids.videos[orttt].channel_id === replll[j].channel_id) {
            for (let iop = 0; iop < replll[j].uploader_id.length; iop++) {
               if (replll[j].uploader_id[iop] === vids.videos[orttt].uploader_id) {
                 doIt = false;
                 break;
               }
            }
         }
         if (!doIt) break;
     }

     if (doIt) {
       checkVideo(vids.videos[orttt]);
       //orttt2++;
      // orttt++;
     }
//console.log("bAbba" + orttt2);
 // }

     //  orttt++;
 }                        /*
console.log("Temporary save");
fs.writeFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/youtubeUserList.json', JSON.stringify(replll));
replll = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/youtubeUserList.json', 'utf8'));       */
}
console.log("Dun");
fs.writeFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/youtubeUserList-uncompressed.json', JSON.stringify(replll));

function checkVideo(video) {
   let dewIt = true;

   for (let jee = 0; jee < replll.length; jee++) {
       if (video.channel_id === replll[jee].channel_id) {
          if (video.uploader_id !== undefined) replll[jee].uploader_id.push(video.uploader_id);
          dewIt = false;
          console.log(replll[jee]);
          break;
       }
   }

   if (dewIt) {
      let teee = {};
      teee["channel_id"] = video.channel_id;
      teee["uploader_id"] = [];
      if (video.uploader_id !== undefined && video.uploader_id !== null) teee.uploader_id.push(video.uploader_id);
      if (video.channel_id !== video.uploader_id && video.channel_id !== undefined && video.channel_id !== null) teee.uploader_id.push(video.channel_id);
      console.log(teee);
      replll.push(teee);
   }
}
