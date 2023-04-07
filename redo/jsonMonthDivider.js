//requiring path and fs modules
var path = require('path');
var fs = require('fs');
const url = require('url');
const http = require('http');
console.log("Amane");

const tagsList  = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/tags.json', 'utf8'));
//var tagsList  = [];
const nicoTags2 = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/nicoTags2.json', 'utf8'));
const nicoTags  = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/nicoTags.json', 'utf8'));
//nicoTags.push(...JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/nicoTags.json', 'utf8')));
/*
{
     console.log("Kanata");
  let nicoTags2 = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/nicoTags2.json', 'utf8'));
  for (let i = 0; i < nicoTags.length; i++) {
     let tmpTaag = nicoTags2.find(ent => ent.id === nicoTags[i].id);
     if (tmpTaag !== undefined) {
        nicoTags[i] = tmpTaag;
     }
  }

     console.log("is");
}   */

     console.log("Kanata");
const youtubeUserList = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/youtubeUserList2.json', 'utf8'));

var gatheredIds = [];

var ignoreUsers = [];
/*
for (var ttu = 0; ttu < youtubeUserList1.length; ttu++) {
   var tmpArr = youtubeUserList1[ttu].uploader_id;
   var addUser = false;
   for (var tty = 0; tty < tmpArr.length; tty++) {
      if (ignoreUsersTmp.includes(tmpArr[tty])) {
         addUser = true;
         break;
      }
   }

   if (addUser) {
      for (var tti = 0; tti < tmpArr.length; tti++) {
         ignoreUsers.push(tmpArr[tti]);
      }
   }
}
*/

{
  let ignoreUsersTmp = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/ignoreChannels.json', 'utf8'));
  let youtubeUserList1 = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/youtubeUserList.json', 'utf8'));

  for (let ttu = 0; ttu < ignoreUsersTmp.length; ttu++) {
    let ter = ignoreUsersTmp[ttu];
    let foundMoreIds = false;

    for (let tty = 0; tty < youtubeUserList1.length; tty++) {
      if (youtubeUserList1[tty].uploader_id.includes(ter)) {
        foundMoreIds = true;
          for (let ttz = 0; ttz < youtubeUserList1[tty].uploader_id.length; ttz++) {
            ignoreUsers.push(youtubeUserList1[tty].uploader_id[ttz]);
          }
          break;
      }
    }

    if (!foundMoreIds) ignoreUsers.push(ter);
  }
}

console.log(ignoreUsers);
       /*
var vidds = [];

for (let kii = 41; kii >= 1; kii--) {
   let tmppp = JSON.parse(fs.readFileSync(('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts/vids' + kii + '.json'), 'utf8')).videos;
   vidds.push(tmppp);
   console.log(kii);


   if (kii === 1) {
      let tmpppe = JSON.parse(fs.readFileSync(('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts/finnredo.json'), 'utf8'));
      vidds.push(tmpppe);
      console.log("Yay");
   }
}    */

//var toBeSortedList = [];

var startChecking = false;
var startCheckpoint = "202304";
//var startCheckpoint = "202005";

for (let yy = 2023; yy >= 2004; yy--) {
  for (let mm = 12; mm >= 1; mm--) {
    //forceGC();
    let toBeSortedList = [];
    let mm_tmp = mm + '';
    if (mm < 10) {
       mm_tmp  = '0' + mm;
    }
    let mm_tmp2 = (mm + 1) + '';
    if ((mm + 1) < 10) {
       mm_tmp2 = '0' + (mm + 1);
    }
    
    if (!startChecking) {
       let checkTmp = '' + yy + mm_tmp;
       if (checkTmp === startCheckpoint) {
          startChecking = true;
       } else {
          continue;
       }
    }

    let minDate = '' + yy + mm_tmp + '00';
    let maxDate = '' + yy + mm_tmp2 + '00';
    console.log("Videos from period: " + yy + mm_tmp);
    gatheredIds = [];

    //for (let tu = 0; tu < vidds.length; tu++) {
    for (let tu = 41; tu >= -1; tu--) {
       console.log("Checking vids" + tu);
       //var videoitaFile = fs.readFileSync('videoita.json', 'utf8');
       //var parsedVideos = JSON.parse(videoitaFile);
       let parsedVideos = [];
       if (tu === 0) parsedVideos = JSON.parse(fs.readFileSync(('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts/finnredo.json'), 'utf8'));
       if (tu === -1) parsedVideos = JSON.parse(fs.readFileSync(('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts/vids0.json'), 'utf8')).videos;
       if (tu > 0) parsedVideos = JSON.parse(fs.readFileSync(('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts/vids' + tu + '.json'), 'utf8')).videos;

       //let parsedVideos = vidds[tu];
       if (parsedVideos.some(ent => ent.upload_date > minDate && ent.upload_date < maxDate) === false) continue;
       parsedVideos = parsedVideos.filter(ent => ent.upload_date > minDate && ent.upload_date < maxDate);
       let lrn = parsedVideos.length;
       for (let oi = 0; oi < lrn; oi++) {
           if (parsedVideos[oi].extractor_key === "BiliBili" && parsedVideos[oi].upload_date === undefined) {
              // console.log("Bilibili with undefined release date: not adding");
              continue;
           }

           //if (parsedVideos[oi].upload_date > minDate && parsedVideos.videos[oi].upload_date < maxDate)
           {

               let tmpVid =  parsedVideos[oi];
               //if (tmpVid.uploader_id.includes("UCC_kncD0fjZiTlEM7Wdnv3g")) console.log("ZIIIIIIIIIIIIIIIIIIIIIIIP1");
               let addForSure = true;

               if (tmpVid.extractor_key === "Youtube" && (tmpVid.uploader_id === undefined || tmpVid.uploader_id === null)) {
                  // console.log(tmpVid);
                  tmpVid.uploader_id = tmpVid.channel_id;
               }

               if (ignoreUsers.includes(tmpVid.uploader_id)) addForSure = false;

               if (tmpVid.extractor_key === "Twitter") {
                  let truId = tmpVid.webpage_url.substring(tmpVid.webpage_url.indexOf('/status/') + 8);
                  tmpVid.id = truId;
                  tmpVid.title = '';
               }

               let tmpTagss = [];

               if (tmpVid.extractor_key === "Niconico") {
                  let tmpTags = nicoTags2.find(ent => ent.id === tmpVid.id);
                  if (tmpTags === undefined) tmpTags = nicoTags.find(ent => ent.id === tmpVid.id);
                  if (tmpTags !== undefined) {
                       let checkingTags = tmpTags.tags;

                       let checkke = [["&#x27;","'"],["&amp;","&"],["_"," "]];

                       for (let tt = 0; tt < checkingTags.length; tt++) {
                          for (let pp = 0; pp < checkke.length; pp++) {
                             let teeew = checkingTags[tt].indexOf(checkke[pp][0]);
                             while (teeew > -1) {
                                let tmoo1 = checkingTags[tt].substring(0,checkingTags[tt].indexOf(checkke[pp][0]));
                                let tmoo2 = checkingTags[tt].substring(checkingTags[tt].indexOf(checkke[pp][0]) + checkke[pp][0].length);
                                checkingTags[tt] = tmoo1 + checkke[pp][1] + tmoo2;
                                teeew = checkingTags[tt].indexOf(checkke[pp][0]);
                                // console.log("Patched Niconico tags");
                             }
                          }
                       }
                       if (checkingTags.length > 0) checkingTags = optimizeTags(checkingTags);

                       tmpTagss = checkingTags;
                  }
                  // console.log("Adding tags for " + tmpVid.id);
               }
               if (tmpVid.extractor_key !== "Niconico") {
                  if (tmpVid.tags !== undefined && tmpVid.tags !== null && tmpVid.tags.length > 0) tmpTagss = optimizeTags(tmpVid.tags);
               }

               tmpVid["tags"] = tmpTagss;

               if (tmpVid.extractor_key === "Youtube" && addForSure) {
                  let uploader_id_tmp = -1 // tmpVid.uploader_id;
                  let uploaderFound = false;

                  for (let i = 0; i < youtubeUserList.length; i++) {
                     for (let j = 0; j < youtubeUserList[i].length; j++) {
                        if (tmpVid.uploader_id === youtubeUserList[i][j]) {
                           uploader_id_tmp = i;
                           uploaderFound = true;
                           break;
                        }
                     }
                     if (uploaderFound) break;
                  }

                  if (uploaderFound) {
                     tmpVid["uId"] = uploader_id_tmp;
                     delete tmpVid["uploader_id"];
                     // console.log("Uploader order number: " + uploader_id_tmp);
                  }

                  delete tmpVid["channel_id"];
               }

               /*
               if (tmpVid.extractor_key === "Youtube" || tmpVid.extractor_key === "Niconico" || tmpVid.extractor_key === "Twitter") {
                  delete tmpVid["webpage_url"];
               } */

               if (tmpVid.extractor_key === "Youtube" || tmpVid.extractor_key === "BiliBili" || tmpVid.extractor_key === "Niconico" || tmpVid.extractor_key === "Twitter") {
                  delete tmpVid["uploader_url"];
                  delete tmpVid["webpage_url"];
               }

               if (tmpVid.extractor_key === "BiliBili") {
                  let tmpId = tmpVid.id;
                  if (Array.isArray(tmpVid.id)) tmpId = tmpVid.id[0];

                  if (tmpVid.id.includes("_p")) {
                     let teypi = tmpVid.id.indexOf("_p");
                     let teyp2 = tmpVid.id.substring(teypi);

                     if (teyp2 !== "_part1" || teyp2 !== "_p1") {
                        addForSure = false;
                        // console.log("Bilibili non page 1 video: " + tmpVid.id);
                     }
                  }

               }

               if (addForSure) {
                  console.log("Found: " + tmpVid.upload_date + " -- " + tmpVid.id);
                  let tmp_id = tmpVid.id;
                  if (Array.isArray(tmpVid.id)) tmp_id = tmpVid.id[0];



                  if (!gatheredIds.includes(tmp_id)) {
                     toBeSortedList.push(tmpVid);
                  } else {
                     console.log("Video (" + tmp_id + ") already added");
                     continue;
                  }

                  if (Array.isArray(tmpVid.id)) {
                     for (let i = 0; i < tmpVid.id.length; i++) {
                        gatheredIds.push(tmpVid.id[i]);
                     }
                  } else {
                     gatheredIds.push(tmpVid.id);
                  }
               } else {
                  console.log("Ignoring: " + tmpVid.upload_date + " -- " + tmpVid.id);
               }
           }
       }
    }

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
    console.log("Sorting 1");
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
    console.log("Sorting 2");

    if (toBeSortedList.length > 0) {
      let miii = 'F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts2/vids' + yy + mm_tmp + '.json';
      //fs.writeFileSync(miii, JSON.stringify({videos: toBeSortedList}));
      fs.writeFileSync(miii, JSON.stringify(toBeSortedList));
    } else {
      console.log("Nothing found on " + yy + mm_tmp);
    }
    //toBeSortedList = [];
}
    }


function optimizeTags(tagsArray) {
   let tmpTags = [];

   for (let k = 0; k < tagsArray.length; k++) {
      let tmpIndex = tagsList.findIndex(ent => ent === tagsArray[k].toLowerCase().trim());
      if (tmpIndex >= 0) tmpTags.push(tmpIndex);
      else tmpTags.push(tagsArray[k]);
   }
   
   return tmpTags;
}

function forceGC() {
   if (global.gc) {
      global.gc();
      console.log('Cleaning!');
   } else {
      console.warn('No GC hook! Start your program as `node --expose-gc file.js`.');
   }
}
