//requiring path and fs modules
let path = require('path');
let fs = require('fs');
const JSONStream = require('JSONStream');
console.log("Amane");

const maxJsonAmount = 53;

const maxMonth = 202412;
const minMonth = 200601;

//const maxMonth = 202204;
//const minMonth = 202204;

const tagsList  = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/tags.json', 'utf8'));
//var tagsList  = [];
const nicoTags2 = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/nicoTags2.json', 'utf8'));
const nicoTags  = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/nicoTags.json', 'utf8'));

const youtubeUserList  = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/youtubeUserList2.json', 'utf8'));
const niconicoUserList = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/niconicoUserList.json', 'utf8'));

const missingNicoUsers = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/missingNicoUid2.json', 'utf8'));

console.log("Kanata");
let ignoreUsers = [];

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
let allEntries = {};
let pathsS = [];
let pathCurrent = 0;

for (let tu = maxJsonAmount; tu >= -1; tu--) {

    //for (let tu = 0; tu < vidds.length; tu++) {
    //for (let tu = 41; tu >= -1; tu--) {
       //console.log("Checking vids" + tu);
       //var videoitaFile = fs.readFileSync('videoita.json', 'utf8');
       //var parsedVideos = JSON.parse(videoitaFile);
       if (tu === 0) {
          let filepath = 'F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts/finnredo.json';
          pathsS.push(filepath);
       }
       if (tu === -1) {
          let filepath = 'F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts/vids0.json';
          pathsS.push(filepath);
       }
       if (tu > 0) {
          let filepath = 'F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts/vids' + tu + '.json';
          pathsS.push(filepath);
       }
}

let monthCheck = {};

for (let tr = 0; tr < pathsS.length; tr++) {
   let tmoe = JSON.parse(fs.readFileSync(pathsS[tr], 'utf8'));
   if (!pathsS[tr].includes("finnredo")) tmoe = tmoe.videos;
   
   for (let wer = maxMonth; wer >= minMonth; wer--) {
      let tmpsstr = wer + "_" + tr;
      let tmmw  = tmoe.findIndex(ent => ent.upload_date !== undefined && ent.upload_date.substring(0,6) === ('' + wer) );
      let tmmw2 = true;
      if (tmmw === -1) tmmw2 = false;

      monthCheck[tmpsstr] = tmmw2;
      
      console.log(tmpsstr + " -> " + tmmw2);

      if ((wer + '').substring(4) === '01' ) wer = wer - 88;
   }
   // console.log(tr);

   //maxMonth
   //minMonth
}

console.log(monthCheck);

/*
for (let jj = 0; jj < pathsS.length; jj++) {
   readFileJ(pathsS[jj]);
} */

let gatheredIds = [];

//const dayRange = [[1,10],[11,20],[21,31]];

for (let mont = maxMonth; mont >= minMonth; mont--) {
 // for (let dRangeId = 0; dRangeId < dayRange.length; dRangeId++) {
   let tmpMo = [];
   gatheredIds = [];

   for (let jj = 0; jj < pathsS.length; jj++) {
      console.log ("Fuyo " + pathsS[jj] + " " + mont);

      let tmpMo2 = [];
      if (monthCheck[mont + "_" + jj]) tmpMo2 = readFileMonthly(pathsS[jj],mont /* ,dRangeId */ );
      else console.log("Skipping " + mont);

      tmpMo.push(...tmpMo2);
   }
   
   tmpMo.sort((a,b) => {
      //let titleA = a.title + a.id;
      //if (a.extractor_key === "Twitter") titleA = a.id;
      //let titleB = b.title + b.id;
      //if (b.extractor_key === "Twitter") titleB = b.id;
      
      if (a.upload_date + a.title + a.id > b.upload_date + b.title + b.id) return -1
      return 1;
   });

   if (tmpMo.length > 0) fs.writeFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts2/vids' + mont + /* '' + dRangeId + */ '.json', JSON.stringify(tmpMo));

   let moont = mont + '';

   if (moont.substring(4) === '01' ) mont = mont - 88;
 // }
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

function listId(id_entry) {
   if (Array.isArray(id_entry)) gatheredIds.push(...id_entry);
   else gatheredIds.push(id_entry);
}


function readFileMonthly_redoAttempt(pathh,targetMonth,dayRangeId) {
    let tmpRet = [];


    let tmpArray = JSON.parse(fs.readFileSync(pathh, 'utf8'));
    if (!pathh.includes('finnredo')) tmpArray = tmpArray.videos;
    let tmpTarg = '' + targetMonth;
    let tmpPos = tmpArray.findIndex(ent => ( (ent.upload_date !== undefined) && (ent.upload_date.substring(0,6) === tmpTarg) && ((ent.upload_date >= (tmpTarg + dayRange[dayRangeId][0])) && (ent.upload_date <= (tmpTarg + dayRange[dayRangeId][1]))) ));

    if (tmpPos === -1)  return tmpRet;


    //for (let iop = 0; iop < tmpArray.length; iop++) {
    while (tmpPos !== -1) {
       let tmppVid = entryEditor(tmpArray[tmpPos],tmpTarg);

       if (tmppVid === undefined) {
          tmpPos = tmpArray.findIndex((ent,ind) => ( (ind > tmpPos) && (ent.upload_date !== undefined) && (ent.upload_date.substring(0,6) === tmpTarg) && ((ent.upload_date >= (tmpTarg + dayRange[dayRangeId][0])) && (ent.upload_date <= (tmpTarg + dayRange[dayRangeId][1]))) ));
          continue;
       }

       //let monthThmp = tmppVid.upload_date.substring(0,6);

       /*
       if (tmpTarg !== monthThmp) {
          console.log(tmppVid.id + " doesn't fit upload month");
          continue;
       }      */
         console.log(pathh);
         console.log("Adding to " + tmpTarg);
         //gatheredIds.push(tmppVid.id);
         tmpRet.push(tmppVid);
         listId(tmppVid.id);
         tmpPos = tmpArray.findIndex((ent,ind) => ( (ind > tmpPos) && (ent.upload_date !== undefined) && (ent.upload_date.substring(0,6) === tmpTarg) && ((ent.upload_date >= (tmpTarg + dayRange[dayRangeId][0])) && (ent.upload_date <= (tmpTarg + dayRange[dayRangeId][1]))) ));
    }
    return tmpRet;
}

function readFileMonthly(pathh,targetMonth) {
    let tmpRet = [];


    let tmpArray = JSON.parse(fs.readFileSync(pathh, 'utf8'));
    if (!pathh.includes('finnredo')) tmpArray = tmpArray.videos;
    let tmpTarg = '' + targetMonth;
    let tmpPos = tmpArray.findIndex(ent => ( (ent.upload_date !== undefined) && (ent.upload_date.substring(0,6) === tmpTarg) ));

    if (tmpPos === -1)  return tmpRet;


    //for (let iop = 0; iop < tmpArray.length; iop++) {
    while (tmpPos !== -1) {
       let tmppVid = entryEditor(tmpArray[tmpPos],tmpTarg);

       if (tmppVid === undefined) {
          tmpPos = tmpArray.findIndex((ent,ind) => ( (ind > tmpPos) && (ent.upload_date !== undefined) && (ent.upload_date.substring(0,6) === tmpTarg) ));
          continue;
       }

       //let monthThmp = tmppVid.upload_date.substring(0,6);

       /*
       if (tmpTarg !== monthThmp) {
          console.log(tmppVid.id + " doesn't fit upload month");
          continue;
       }      */
         console.log(pathh);
         console.log("Adding to " + tmpTarg);
         //gatheredIds.push(tmppVid.id);
         tmpRet.push(tmppVid);
         listId(tmppVid.id);
         tmpPos = tmpArray.findIndex((ent,ind) => ( (ind > tmpPos) && (ent.upload_date !== undefined) && (ent.upload_date.substring(0,6) === tmpTarg) ));
    }
    return tmpRet;
}

function readFileJ(pathh) {
    let tmpArray = JSON.parse(fs.readFileSync(pathh, 'utf8'));
    if (!pathh.includes("finnredo")) tmpArray = tmpArray.videos;
    
    for (let iop = 0; iop < tmpArray.length; iop++) {
       let tmppVid = entryEditor(tmpArray[iop]);

       if (tmppVid !== undefined /* && tmppVid.upload_date !== undefined */ ) {
          if ( !ignoreUsers.includes(tmppVid.uploader_id)) {

               console.log(pathh);
               //console.log(tmppVid);
               let  monthThmp = tmppVid.upload_date.substring(0,6);

               if (allEntries[monthThmp]) {
                  if (allEntries[monthThmp].findIndex(ent => ent.id === tmppVid.id) === -1) {

                     console.log("Adding to " + monthThmp);
                     allEntries[monthThmp].push(tmppVid);
                     //listId(tmppVid.id);
                  } else {
                     console.log ("Already in " + monthThmp);
                  }
               }
               else {
                  console.log("Initializing " + monthThmp);
                  allEntries[monthThmp] = [tmppVid] ;
                  //listId(tmppVid.id);
               }

          }
       }
    }
}

function readFileJStream(pathh) {
   //let tmpArray = [];
   let stream = fs.createReadStream(pathh, { encoding: 'utf8' });
   console.log(pathh);
   let parser = JSONStream.parse('videos.*');
   if (pathh.includes('finnredo')) parser = JSONStream.parse('*');

   //let tmppVid = undefined;

   parser.on('data', function(data) {
      //console.log(data);
      let tmppVid = entryEditor(data);
      if (tmppVid !== undefined /* && tmppVid.upload_date !== undefined */ ) {
         if ( !ignoreUsers.includes(tmppVid.uploader_id)) {

               console.log(pathh);
               //console.log(tmppVid);
               let  monthThmp = tmppVid.upload_date.substring(0,6);

               if (allEntries[monthThmp]) {
                  if (allEntries[monthThmp].findIndex(ent => ent.id === tmppVid.id) === -1) {

                     console.log("Adding to " + monthThmp);
                     allEntries[monthThmp].push(tmppVid);
                     //listId(tmppVid.id);
                  } else {
                     console.log ("Already in " + monthThmp);
                  }
               }
               else {
                  console.log("Initializing " + monthThmp);
                  allEntries[monthThmp] = [tmppVid] ;
                  //listId(tmppVid.id);
               }

         }
      }
   });

   parser.on('error', err => {
      console.error(err);
   });
   
   parser.on('end', () => {
       pathCurrent++;
       if (pathCurrent < pathsS.length) {
          readFileJ(pathsS[pathCurrent]);
       } else {
          writeFiles();
       }
   });

   stream.pipe(parser);
}

function writeFiles() {
   let valueNames = Object.keys(allEntries);
   
   for (let i = 0; i < valueNames.length; i++) {
       let entTmp = allEntries[valueNames[i]];
       
       entTmp.sort((a,b) => {
          let titleA = a.title;
          if (a.extractor_key === "Twitter") titleA = a.id;
          let titleB = b.title;
          if (b.extractor_key === "Twitter") titleB = b.id;
          
          if (a.upload_date + titleA > b.upload_date + titleB) return -1
          return 1;
       });
       
       fs.writeFileSync('F:/test/vids' + valueNames[i] + '.json', JSON.stringify(entTmp));
       console.log(valueNames[i] + ": " + entTmp[0].upload_date);
   }
}

function entryEditor(entryVid,targetMonth) {
   let entry = entryVid;
   //let parsedVideos = vidds[tu];
   //if (entry.upload_date > minDate && entry.upload_date < maxDate) return undefined;
   {
     // TEMPORARY! Unables Bilibili videos for the time being
     // if (entry.extractor_key === "BiliBili") return undefined;

     // let tmpUploaderId = entry.uploader_id;
     // let tmpUploader   = entry.uploader;

     // For Niconico entries that are missing uploader info
     if (entry.extractor_key === "Niconico" && (entry.uploader_id === undefined || entry.uploader_id === null)) {
        if (missingNicoUsers.map(item => item.id).includes(entry.id)) {
           let tmpUserInfo = missingNicoUsers.find(item => item.id === entry.id);
           if (tmpUserInfo.nicologEntry) {
              entry["uploader_id"] = tmpUserInfo.uId;
              entry["uploader"] = tmpUserInfo.uploader;
              console.log("User info patched for " + entry.id + ": " + tmpUserInfo.uploader + " (" + tmpUserInfo.uId + ")");
           }
        }
     }

     if (ignoreUsers.includes(entry.channel_id) || ignoreUsers.includes(entry.uploader_id)) return undefined;
     let tttmp_id = entry.id;
     if (Array.isArray(entry.id)) tttmp_id = entry.id[0];
     if (gatheredIds.includes(tttmp_id)) return undefined;
   }

   if (entry.upload_date === undefined || entry.upload_date === null) {
   //if (entry.extractor_key === "BiliBili" && entry.upload_date === undefined) {
      // console.log("Bilibili with undefined release date: not adding");
      return undefined;
   }
   //console.log(entry.upload_date.substring(0,6) + " --- " + targetMonth + (entry.upload_date.substring(0,6) === targetMonth));
   if (entry.upload_date.substring(0,6) !== targetMonth) return undefined;

   //if (parsedVideos[oi].upload_date > minDate && parsedVideos.videos[oi].upload_date < maxDate)
   {

       let tmpVid =  entry;
       //if (tmpVid.uploader_id.includes("UCC_kncD0fjZiTlEM7Wdnv3g")) console.log("ZIIIIIIIIIIIIIIIIIIIIIIIP1");
       let addForSure = true;
              /*
       // if (tmpVid.extractor_key === "Youtube" && (tmpVid.uploader_id === undefined || tmpVid.uploader_id === null)) {
       if (tmpVid.extractor_key === "Youtube" && (tmpVid.channel_id === undefined || tmpVid.channel_id === null)) {
          // console.log(tmpVid);
          tmpVid["uploader_id"] = tmpVid.channel_id;
       }    */

       if (ignoreUsers.includes(tmpVid.uploader_id)) return undefined; // addForSure = false;

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
          
          // If the uploader ID is present in the external list of IDs, this'll add the ID matching that list
          if (niconicoUserList.includes(tmpVid.uploader_id)) {
             tmpVid["uId"] = niconicoUserList.indexOf(tmpVid.uploader_id);
             delete tmpVid["uploader_id"];
          }
       }
       if (tmpVid.extractor_key !== "Niconico") {
          if (tmpVid.tags !== undefined && tmpVid.tags !== null && tmpVid.tags.length > 0) tmpTagss = optimizeTags(tmpVid.tags);
       }

       tmpVid["tags"] = tmpTagss;

       if (tmpVid.extractor_key === "Youtube" && addForSure) {
          let uploader_id_tmp = -1 // tmpVid.uploader_id;
          let uploaderFound = false;

          let userIid = tmpVid.channel_id;
          if (userIid === undefined || userIid === null) userIid = tmpVid.uploader_id;

          for (let i = 0; i < youtubeUserList.length; i++) {
             for (let j = 0; j < youtubeUserList[i].length; j++) {
                if (userIid  === youtubeUserList[i][j]) {
                // if (tmpVid.uploader_id === youtubeUserList[i][j]) {
                   uploader_id_tmp = i;
                   uploaderFound = true;
                   break;
                }
             }
             if (uploaderFound) break;
          }

          if (uploaderFound) {
             tmpVid["uId"] = uploader_id_tmp;
             // console.log("Uploader order number: " + uploader_id_tmp);
          }

          delete tmpVid["uploader_id"];
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
                return undefined; //addForSure = false;
                // console.log("Bilibili non page 1 video: " + tmpVid.id);
             }
          }

       }

       if (addForSure) {
          console.log("Found: " + tmpVid.upload_date + " -- " + tmpVid.id);
          let tmp_id = tmpVid.id;
          if (Array.isArray(tmpVid.id)) tmp_id = tmpVid.id[0];

          if (gatheredIds.includes(tmp_id)) {
             console.log("Video (" + tmp_id + ") already added");
             return undefined; // continue;
          }

               /*
          if (!gatheredIds.includes(tmp_id)) {
             toBeSortedList.push(tmpVid);
          } else {
             console.log("Video (" + tmp_id + ") already added");
             continue;
          }  */

          if (Array.isArray(tmpVid.id)) {
             for (let i = 0; i < tmpVid.id.length; i++) {
                gatheredIds.push(tmpVid.id[i]);
             }
          } else {
             gatheredIds.push(tmpVid.id);
          }
          
          return tmpVid;
       } else {
          console.log("Ignoring: " + tmpVid.upload_date + " -- " + tmpVid.id);
          return undefined;
       }
   }

}