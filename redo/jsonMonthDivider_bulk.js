/*

This script takes the unsorted JSON files generated through jsonFolderReader.js and
reorganizes all the metadata. The resulting JSON files will be split based on the
release months.

*/

//requiring path and fs modules
let path = require('path');
let fs = require('fs');
const JSONStream = require('JSONStream');
console.log("Amane");

// This determines how many JSON files are to be sorted
const maxJsonAmount = 66;

/* These determine the time frame that will be processed. If a video was released outside
   of this time frame or has an undefined release date, its metadata won't be processed and
   included.                                                                                   
*/
const maxMonth = 202512;
const minMonth = 200401;

//const maxMonth = 202204;
//const minMonth = 202204;

/* A list of the most common tags used across all videos, generated through tagsLogger.js.
   Used to replace these most common tags from the metadata with their respective indexes
   within this list.
*/
const tagsList  = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/tags.json', 'utf8'));

/* These files include the tags for videos from Niconico. Due to yt-dlp not including them,
   they've been gathered and compiled into these files through nicoTagExtractor.js and
   nicoTagExtractor-nicolog.js. The script will couple each set of tags to their respective
   videos.
*/
const nicoTags2 = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/nicoTags2.json', 'utf8'));
const nicoTags  = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/nicoTags.json', 'utf8'));

/* This file includes

*/
const youtubeUserList  = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/youtubeUserList.json', 'utf8'));

const niconicoUserList = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/niconicoUserList.json', 'utf8'));

const missingNicoUsers = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/missingNicoUid2.json', 'utf8'));

console.log("Kanata");
let ignoreUsers = [];

{
  let ignoreUsersTmp = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/ignoreChannels.json', 'utf8'));
  let youtubeUserList1 = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/youtubeUserList-uncompressed.json', 'utf8'));

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

const missingNicoUsers_idSet = new Set(missingNicoUsers.map(item => item.id));
const ignoreUsersSet = new Set(ignoreUsers);
const nicoTagsMap  = new Map(nicoTags.map(item => [item.id, item]));
const nicoTags2Map = new Map(nicoTags2.map(item => [item.id, item]));
const niconicoUserListSet = new Set(niconicoUserList);
const tagsListMap = new Map(tagsList.map((tag, index) => [tag.toLowerCase().trim(), index]));

const youtubeUserListMap = new Map();
youtubeUserList.forEach((userIds, index) => {
    userIds.forEach(id => {
        youtubeUserListMap.set(id, index);
    });
});
    
let allEntries = {};
let pathsS = [];
// let pathCurrent = 0;
//let parsedData = [];

//for (let tu = 65; tu >= 25; tu--) {
for (let tu = maxJsonAmount; tu >= -1; tu--) {
// for (let tu = 0; tu >= -1; tu--) {

    //for (let tu = 0; tu < vidds.length; tu++) {
    //for (let tu = 41; tu >= -1; tu--) {
       //console.log("Checking vids" + tu);
       //var videoitaFile = fs.readFileSync('videoita.json', 'utf8');
       //var parsedVideos = JSON.parse(videoitaFile);
       if (tu === 0) {
          let filepath = 'F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts/finnredo.json';
          // let filepath = 'C:/Users/Public/test/split_parts/finnredo.json';
          pathsS.push(filepath);
          console.log(filepath);
          // let tmpArrar = JSON.parse(fs.readFileSync(filepath, 'utf8'));
          // parsedData.push(tmpArrar);
       }
       if (tu === -1) {
          let filepath = 'F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts/vids0.json';
          // let filepath = 'C:/Users/Public/test/split_parts/vids0.json';
          pathsS.push(filepath);
          console.log(filepath);
          // let tmpArrar =  JSON.parse(fs.readFileSync(filepath, 'utf8')).videos;
          // parsedData.push(tmpArrar);
       }
       if (tu > 0) {
          let filepath = 'F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts/vids' + tu + '.json';
          console.log(filepath);
          // let filepath = 'C:/Users/Public/test/split_parts/vids' + tu + '.json';
          pathsS.push(filepath);
          // let tmpArrar = JSON.parse(fs.readFileSync(filepath, 'utf8')).videos;
          // console.log(tmpArrar);
          // parsedData.push(tmpArrar);
       }
}

// let monthCheck = {};

/*

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
}  */

// console.log(monthCheck);

/*
for (let jj = 0; jj < pathsS.length; jj++) {
   readFileJ(pathsS[jj]);
} */

// let gatheredIds = [];

//const dayRange = [[1,10],[11,20],[21,31]];

let parsedData2 = {};
const gatheredIds = new Set();

for (let i = 0; i < pathsS.length; i++) {
   const parsedData = JSON.parse(fs.readFileSync(pathsS[i], 'utf8')).videos;
   console.log("Checking: " + pathsS[i]);

   for (let j = 0; j < parsedData.length; j++) {
      let idTmp = parsedData[j].id;
      //console.log((i + 1) + "/" + pathsS.length + " --- " + (j + 1) + "/" + parsedData.length);
      if (!parsedData[j].upload_date && !parsedData[j].timestamp) {
         //console.log("Video with ID " + idTmp + " doesn't have upload date");
         continue;
      }

      if (Array.isArray(idTmp)) idTmp = idTmp[0];

      if (gatheredIds.has(idTmp)) { 
         //console.log("Video with ID " + idTmp + " already present");
         continue;
      }

      let tmpEnt = entryEditor(parsedData[j]);

      if (!tmpEnt) { 
         //console.log("Video with ID " + idTmp + " was discarded due to entryEditor");
         continue;
      }

      let uploadDateTmp = parsedData[j].upload_date;
      if (!uploadDateTmp) {
         let dateTmp = new Date(parsedData[j].timestamp * 1000);
         uploadDateTmp = dateTmp.getUTCFullYear() + "" + String(dateTmp.getUTCMonth() + 1).padStart(2, '0');
      }
      else uploadDateTmp = uploadDateTmp.substring(0,6);
      
      // if (!parsedData2[parsedData[j].upload_date.substring(0,6)]) parsedData2[parsedData[j].upload_date.substring(0,6)] = [];
      // parsedData2[parsedData[j].upload_date.substring(0,6)].push(tmpEnt);
      
      if (!parsedData2[uploadDateTmp]) parsedData2[uploadDateTmp] = [];
      parsedData2[uploadDateTmp].push(tmpEnt);

      if (Array.isArray(parsedData[j].id)) parsedData[j].id.forEach(id => gatheredIds.add(id));
      else gatheredIds.add(parsedData[j].id);

      // console.log(parsedData[j].upload_date.substring(0,6) + " --- " + parsedData[j].id);
   }
   // console.log(parsedData2);
}    

              /*
let indexList = [];

for (let i = 0; i < parsedData.length; i++) {
   for (let j = 0; j < parsedData[i].length; j++) {
      let tmpIndLi  = {};
      tmpIndLi.ind1 = i;
      tmpIndLi.ind2 = j;
      indexList.push(tmpIndLi);
   }
}

console.log("Marco");

let idList = indexList.map(ent => { return parsedData[ent.ind1][ent.ind2].id });

indexList = indexList.filter((ent, ind) => {

  if (!parsedData[ent.ind1][ent.ind2].upload_date) return false;

  // if (idList.indexOf(idList[ind]) !== ind) return false;

  return true;

});

let months = [];

for (let yyyy = 2025; yyyy >= 2004; yyyy--) {
   for (let mm = 12; mm >= 1; mm--) {
      let strMont = "" + yyyy + ("" + mm).padStart(2,"0");
      months.push(strMont);
      console.log(strMont);
   }
}

console.log(months);

console.log("Polo");

for (let m = 0; m < months.length; m++) {
  
   let gatheredIds = [];

   let tmpList = indexList.filter((ent, ind) => {
      if (parsedData[ent.ind1][ent.ind2].upload_date.substring(0,6) !== months[m]) return false;
      
      if (gatheredIds.includes(parsedData[ent.ind1][ent.ind2].id)) return false;
      gatheredIds.push(parsedData[ent.ind1][ent.ind2].id);

      // if (idList.indexOf(idList[ind]) === ind) return true;

      return true;
   });

   // tmpList = indexList.filter((ent, ind) => { if (idList.indexOf(parsedData[ent.ind1][ent.ind2].id) === ind) return true; return false; });
   
   if (tmpList.length === 0) continue;

   tmpList = tmpList.sort((a,b) => {
      let tmpEntA = parsedData[a.ind1][a.ind2];
      let tmpEntB = parsedData[b.ind1][b.ind2];

      if (tmpEntA.upload_date + tmpEntA.title + tmpEntA.id > tmpEntB.upload_date + tmpEntB.title + tmpEntB.id) return -1
      return 1;
   });
   
   tmpList = tmpList.map(ent => { return entryEditor(parsedData[ent.ind1][ent.ind2]) });

   tmpList = tmpList.filter(ent => { if (!ent) return false; return true; } );

   console.log("Handling: " + months[m]);
   fs.writeFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts2/vids' + months[m] + '.json', JSON.stringify(tmpList));
}     */

/*
indexList = indexList.sort((a,b) => {

   let tmpEntA = parsedData[a.ind1][a.ind2];
   let tmpEntB = parsedData[b.ind1][b.ind2];

   if (tmpEntA.upload_date + tmpEntA.title + tmpEntA.id > tmpEntB.upload_date + tmpEntB.title + tmpEntB.id) return -1
   return 1;
});

console.log(indexList);
console.log(parsedData[indexList[0].ind1][indexList[0].ind2]);  */


for (let k = 0; k < Object.keys(parsedData2).length; k++) {
   let keyTmp = Object.keys(parsedData2)[k];

   console.log("Handling: " + keyTmp);

   let monthlyArray = parsedData2[keyTmp].sort((a,b) => {
      //let titleA = a.title + a.id;
      //if (a.extractor_key === "Twitter") titleA = a.id;
      //let titleB = b.title + b.id;
      //if (b.extractor_key === "Twitter") titleB = b.id;
      
      let tmpADate = a.upload_date;
      if (!tmpADate) {
         let timestampTmpA = new Date(a.timestamp * 1000);
         tmpADate = timestampTmpA.getUTCFullYear() + String(timestampTmpA.getUTCMonth() + 1).padStart(2, '0') + String(timestampTmpA.getUTCDate()).padStart(2, '0') +
                    String(timestampTmpA.getUTCHours()).padStart(2, '0') + String(timestampTmpA.getUTCMinutes()).padStart(2, '0') + String(timestampTmpA.getUTCSeconds()).padStart(2, '0');
      }
      else tmpADate = tmpADate + "000000";

      let tmpBDate = b.upload_date;
      if (!tmpBDate) {
         let timestampTmpB = new Date(b.timestamp * 1000);
         tmpBDate = timestampTmpB.getUTCFullYear() + String(timestampTmpB.getUTCMonth() + 1).padStart(2, '0') + String(timestampTmpB.getUTCDate()).padStart(2, '0') +
                    String(timestampTmpB.getUTCHours()).padStart(2, '0') + String(timestampTmpB.getUTCMinutes()).padStart(2, '0') + String(timestampTmpB.getUTCSeconds()).padStart(2, '0');
      }
      else tmpBDate = tmpBDate + "000000";

      // if (a.upload_date + a.title + a.id > b.upload_date + b.title + b.id) return -1
      if (tmpADate + a.title + a.id > tmpBDate + b.title + b.id) return -1
      return 1;
   });

   //parsedData2
   fs.writeFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts2/vids' + keyTmp + '.json', JSON.stringify(monthlyArray));
}

/*

for (let mont = maxMonth; mont >= minMonth; mont--) {
 // for (let dRangeId = 0; dRangeId < dayRange.length; dRangeId++) {
   let tmpMo = [];
   // gatheredIds = [];

   // tmpMo = parsedData.filter(ent => ent.upload_date && ent.upload_date.substring(0,6) === mont && entryEditor(ent) !== undefined);




   for (let jj = 0; jj < parsedData.length; jj++) {
      let tmpMoom = parsedData[jj].filter(ent => ent.upload_date !== undefined && ent.upload_date.substring(0,6) === mont && entryEditor(ent) !== undefined);
      console.log(tmpMoom);
      tmpMo.push(...tmpMoom);
   }


   for (let jj = 0; jj < pathsS.length; jj++) {
      console.log ("Fuyo " + pathsS[jj] + " " + mont);

      let tmpMo2 = [];
      if (monthCheck[mont + "_" + jj]) tmpMo2 = readFileMonthly(pathsS[jj],mont  ,dRangeId );
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

   if (tmpMo.length > 0) fs.writeFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts2/vids' + mont +  '' + dRangeId +  '-test2.json', JSON.stringify(tmpMo));

   let moont = mont + '';

   if (moont.substring(4) === '01' ) mont = mont - 88;
 // }
}      */


function optimizeTags(tagsArray) {
   let tmpTags = [];

   for (let k = 0; k < tagsArray.length; k++) {
      let normalizedTag = tagsArray[k].toLowerCase().trim();
      let tmpIndex = tagsListMap.get(normalizedTag);
      if (tmpIndex !== undefined) tmpTags.push(tmpIndex);

      // let tmpIndex = tagsList.findIndex(ent => ent === tagsArray[k].toLowerCase().trim());
      // if (tmpIndex >= 0) tmpTags.push(tmpIndex);
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

    tmpRet = tmpArray.filter(ent => ( (ent.upload_date !== undefined) && (ent.upload_date.substring(0,6) === tmpTarg)));

    if (!tmpRet)  return [];

    return tmpRet.map(ent => entryEditor(ent,tmpTarg));
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
         // console.log(pathh);
         // console.log("Adding to " + tmpTarg);
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

function entryEditor(entryVid) {
   if (ignoreUsersSet.has(entryVid.channel_id) || ignoreUsersSet.has(entryVid.uploader_id)) return undefined;
   
   if (!entryVid.upload_date && !entryVid.timestamp) return undefined;

   let entry = entryVid;

   //let parsedVideos = vidds[tu];
   //if (entry.upload_date > minDate && entry.upload_date < maxDate) return undefined;
   {
     // TEMPORARY! Unables Bilibili videos for the time being
     // if (entry.extractor_key === "BiliBili") return undefined;

     // let tmpUploaderId = entry.uploader_id;
     // let tmpUploader   = entry.uploader;

     // For Niconico entries that are missing uploader info
     if (entry.extractor_key === "Niconico" && (!entry.uploader_id)) {
        if (missingNicoUsers_idSet.has(entryVid.id)) {
           let tmpUserInfo = missingNicoUsers.find(item => item.id === entry.id);
           if (tmpUserInfo.nicologEntry) {
              entry["uploader_id"] = tmpUserInfo.uId;
              entry["uploader"] = tmpUserInfo.uploader;
              //console.log("User info patched for " + entry.id + ": " + tmpUserInfo.uploader + " (" + tmpUserInfo.uId + ")");
           }
        }
     }

     /*
     let tttmp_id = entry.id;
     if (Array.isArray(entry.id)) tttmp_id = entry.id[0];
     if (gatheredIds.includes(tttmp_id)) return undefined;   */
   }

   {

       let tmpVid =  entry;
       //if (tmpVid.uploader_id.includes("UCC_kncD0fjZiTlEM7Wdnv3g")) console.log("ZIIIIIIIIIIIIIIIIIIIIIIIP1");
       let addForSure = true;


       // if (ignoreUsers.includes(tmpVid.uploader_id)) return undefined; // addForSure = false;

       if (tmpVid.extractor_key === "Twitter") {
          let truId = tmpVid.webpage_url.substring(tmpVid.webpage_url.indexOf('/status/') + 8);
          tmpVid.id = truId;
          tmpVid.title = '';
       }
       
       // This handles entries from the site Odysee
       if (tmpVid.extractor_key === "LBRY" && tmpVid.webpage_url.includes('odysee.com/')) {
          tmpVid.extractor_key = "Odysee";
          tmpVid.webpage_url = "https://odysee.com/video:" + tmpVid.id;

       }

       let tmpTagss = [];

       if (tmpVid.extractor_key === "Niconico") {
          if (!tmpVid.tags || tmpVid.tags.length === 0) {

            // console.log("Testoriinoni");

            let tmpTags = nicoTags2Map.get(tmpVid.id);
            // let tmpTags = nicoTags2.find(ent => ent.id === tmpVid.id);
            if (!tmpTags) tmpTags = nicoTagsMap.get(tmpVid.id); // nicoTags.find(ent => ent.id === tmpVid.id);
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
          }

          if (tmpVid.tags && tmpVid.tags.length > 0) tmpTagss = optimizeTags(tmpVid.tags);

          // If the uploader ID is present in the external list of IDs, this'll add the ID matching that list
          // if (niconicoUserList.includes(tmpVid.uploader_id)) {
          if (niconicoUserListSet.has(tmpVid.uploader_id)) {
             tmpVid["uId"] = niconicoUserList.indexOf(tmpVid.uploader_id);
             delete tmpVid["uploader_id"];
          }
       }
       else {
       // if (tmpVid.extractor_key !== "Niconico") {
          // if (tmpVid.tags && tmpVid.tags.length > 0) tmpTagss = optimizeTags(tmpVid.tags);
          if (tmpVid.tags !== undefined && tmpVid.tags !== null && tmpVid.tags.length > 0) tmpTagss = optimizeTags(tmpVid.tags);
       }

       tmpVid["tags"] = tmpTagss;

       /*
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
       }    */
       
       if (tmpVid.extractor_key === "Youtube" && addForSure) {
          let userIid = tmpVid.channel_id || tmpVid.uploader_id;
          if (userIid) {
             let uId = youtubeUserListMap.get(userIid);
             if (uId !== undefined) {
                tmpVid["uId"] = uId;
             }
             delete tmpVid["uploader_id"];
             delete tmpVid["channel_id"];
         }
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

          return tmpVid;
       } else {
          // console.log("Ignoring: " + tmpVid.upload_date + " -- " + tmpVid.id);
          return undefined;
       }
   }

}