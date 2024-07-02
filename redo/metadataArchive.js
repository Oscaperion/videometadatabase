const fs = require('fs');
const readline = require('readline');
const url = require('url');
const http = require('http');
const XMLRequest = require("xmlhttprequest").XMLHttpRequest;

// let tmpConsole = '';

/*
   This is where the primary JSON files for video entries are located
*/
const jsonLocation = "F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts2/";
//const jsonLocation = "vidJson2/";

/*
   This is where the complementary JSON files for e.g. lists of tags and YouTube user IDs
     are located.
*/
const jsonLocationComp = "F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/";
//const jsonLocationComp = "vidJson2/";

/*
   These are used to process the JSON files that contain the entries for the database.
     The values are supposed to read as a year and a month (YYYYMM) and the files should
     be named like "vids*YYYYMM*.json" (e.g. "vids202301.json") for them to be processed
     correctly. If there are no files for certain months, the code will just ignore those
     months.
*/
const maxMonth = 202412;
const minMonth = 200601;
//const minMonth = 201501;

/*
   Determines how many entries are being shown per page.
*/
const videosPerPage = 15;

/*
   These are used as part of crude bot prevention measures. Any queries provided
     without these values (&*botCheckName*=*botCheckValue*) will be redirected to a
     placeholder page, which will provide instructions on how to carry on with the query
     for actual visitors. So far this has been surprisingly effective, but if bots ever
     learn to take this into consideration a more robust measure need to be implemented.
*/
const botCheckName = "rumour_do_be";
const botCheckValue = "chio_be_chompi";

/*
   Changes the language for the site. Currently only supports English and Japanese.
*/
let pageLanguage = 'en';

/*
   Used to show, when the database was last updated.
*/
let lastUpdated;
{
   let currentDate = new Date();
   let cDay = currentDate.getDate();
   if (cDay < 10) cDay = '0' + cDay;
   let cMonth = currentDate.getMonth() + 1;
   if (cMonth < 10) cMonth = '0' + cMonth;
   let cYear = currentDate.getFullYear() + '';
   lastUpdated = cYear + cMonth + cDay;
}

function getLastUpdated() {
   if (pageLanguage === 'jp') return lastUpdated + ' [&#9633;&#9633;&#9633;&#9633;&#24180;&#9633;&#9633;&#26376;&#9633;&#9633;&#26085;]';
   return lastUpdated + ' [YYYYMMDD]';
}

/*
   Link to an external Dropbox repository that has a backup of the JSON files used for
     the database.
*/
//const dropboxLink = 'https://www.dropbox.com/sh/veadx97ot0pmhvs/AACiy1Pqa7dMj33v-yqG_1GYa?dl=0';

/*
   These JSON arrays will be used in junction with the video entries.
 
   tagsList: Includes some of the more used tags. This list is compiled through a separate
     script. Some video entries have numerical .tags values, which refer to indexes in
     this array.

   youtubeUserList: Includes the vast majority of IDs related to YouTube users. All 
     entries are presented as string arrays, since most users are referred by multiple
     IDs. Most YouTube entries have numerical .uId values, which refer to indexes in
     this array.

   reuploadShowing: Includes pairings of video IDs as follows:
     .id        = An ID of a video that has been either deleted or otherwise unavailable
                  through video preview.
     .reup      = An ID of a video that is used as a replacement for video preview purposes.
     .reup_site = The site where the replacement video is located. Needs to match the
                   .extractor_key values from video entries.

   twitterUserList: Includes pairings of Twitter related user IDs as follows:
     .id     = A static ID attached to a Twitter account.
     .handle = An array that includes the non-static ID(s) used by the account referred
               by .id value.
     If a Twitter account isn't listed, the database will provide a non-static link.
*/

const tagsList = JSON.parse(fs.readFileSync(jsonLocationComp + 'tags.json', 'utf8'));
//const tagsList = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/tags.json', 'utf8'));
//const tagsList = JSON.parse(fs.readFileSync('vidJson2/tags.json', 'utf8'));

const youtubeUserList = JSON.parse(fs.readFileSync(jsonLocationComp + 'youtubeUserList2.json', 'utf8'));
//const youtubeUserList = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/youtubeUserList2.json', 'utf8'));
//const youtubeUserList = JSON.parse(fs.readFileSync('vidJson2/youtubeUserList2.json', 'utf8'));

const niconicoUserList = JSON.parse(fs.readFileSync(jsonLocationComp + 'niconicoUserList.json', 'utf8'));

const sameUserListLoc = jsonLocationComp + 'sameUsers.json';
//const sameUserListLoc = 'F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/sameUsers.json';
//const sameUserListLoc = 'vidJson2/sameUsers.json';
let sameUserList = JSON.parse(fs.readFileSync(sameUserListLoc, 'utf8'));

const reuploadListLoc = jsonLocationComp + 'reuploads.json';
//const reuploadListLoc = 'F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/reuploads.json';
//const reuploadListLoc = 'vidJson2/reuploads.json';
let reuploadShowing = JSON.parse(fs.readFileSync(reuploadListLoc, 'utf8'));

const twitterUserLoc = jsonLocationComp + 'twitterUserList.json';
//const twitterUserLoc = 'F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/twitterUserList.json';
//const twitterUserLoc = 'vidJson2/twitterUserList.json';
let twitterUserList = JSON.parse(fs.readFileSync(twitterUserLoc, 'utf8'));

const headerTextLoc = jsonLocationComp + 'forHeader.txt';
let headerText = fs.readFileSync(headerTextLoc, 'utf8');
const headerTextJpLoc = jsonLocationComp + 'forHeaderJp.txt';
let headerTextJp = fs.readFileSync(headerTextJpLoc, 'utf8');

function getHeaderText() {
   if (pageLanguage === 'jp') return headerTextJp;
   return headerText;
}

/*
   If JSON files for reuploadShowing, twitterUserList or sameUserList are changed, they will be
     reread by the database.
*/
fs.watchFile(reuploadListLoc, (curr,prev) => {
   try {
       console.log("Hoperiino"); 
       reuploadShowing = JSON.parse(fs.readFileSync(reuploadListLoc, 'utf8'));
       forceGC();
   } catch (error) {
       console.log ("Noperiino");
   }
});

fs.watchFile(twitterUserLoc, (curr,prev) => {
   try {
       console.log("Hoperiino"); 
       twitterUserList = JSON.parse(fs.readFileSync(twitterUserLoc, 'utf8'));
       forceGC();
   } catch (error) {
       console.log ("Noperiino");
   }
});

fs.watchFile(sameUserListLoc, (curr,prev) => {
   try {
       console.log("Hoperiino"); 
       sameUserList = JSON.parse(fs.readFileSync(sameUserListLoc, 'utf8'));
       forceGC();
   } catch (error) {
       console.log ("Noperiino");
   }
});

fs.watchFile(headerTextLoc, (curr,prev) => {
   try {
       console.log("Hoperiino"); 
       headerText = fs.readFileSync(headerTextLoc, 'utf8');
       forceGC();
   } catch (error) {
       console.log ("Noperiino");
   }
});

fs.watchFile(headerTextJpLoc, (curr,prev) => {
   try {
       console.log("Hoperiino"); 
       headerTextJp = fs.readFileSync(headerTextLocJp, 'utf8');
       forceGC();
   } catch (error) {
       console.log ("Noperiino");
   }
});


/*
   In case an uploader ID hasn't been specified in an entry, this string is used as a
     placeholder. Needs to be changed if a channel with a matching ID is ever added into
     the database. :D
*/
const nullUploaderPlaceholder = 'skaPiPiduuDelierp';

/*
   https://www.xarg.org/2016/06/forcing-garbage-collection-in-node-js-and-javascript/
*/
function forceGC() {
   if (global.gc) {
      global.gc();
   } else {
      console.warn('No GC hook! Start your program as `node --expose-gc file.js`.');
   }
}

/*
   Linebreak for strings
*/
const breakline =  '\r\n';

let pageNumber = 1;
let pageTotal = 1;
let foundVids = [];

/*
   This will be used to determine, whether or not the provided search words will be
     processed exactly as presented. Search words are processed separately by default.
     - true  = The provided search word will be processed as-is.
     - false = In case there are multiple words, each of them will be used separately.
*/
let exactWordSearch = false;

/*
   This will be used to determine, whether or not the entries will be accompanied by
     embedded video players. Check the createVideoPreview function to see which sites'
     videos currently have this feature. They are not shown by default.
     - true  = The video players are added along with the metadata.
     - false = The video players are not shown along with the metadata.
*/
let showVidPrev = false;

/*
   This will be used to store the search words of a query.
*/
let searchWords = [];

let searchedUser = "";
let searchingUser = false;

/*
   This determines, whether or not the database will process a query or show all the 
      videos in the database. If no search query is given, the database shows all
      videos by default.
*/
//var showAllVideos = true;

/*
   These are to be used as part of queries that specify certain dates. Also used to 
     ensure that the user won't just input whatever they please.
*/
let mostRecentDate;
let leastRecentDate;
let dateQueried1;
let dateQueried2;
let customRangeApplied = false;

/*
   These are used as part of a method to determine, whether or not to exclude particular
     sites from search results. Compares this list to the .extractor_key values of the
     entries, aside from the last option. The "Others" option covers every other site,
     that hasn't been listed.
*/
let sitesList = [ {'site': 'Youtube',    'isIgnored':true},
                  {'site': 'Niconico',   'isIgnored':true},
                  {'site': 'BiliBili',   'isIgnored':true},
                  {'site': 'Twitter',    'isIgnored':true},
                  {'site': 'Soundcloud', 'isIgnored':true},
                  {'site': 'VK',         'isIgnored':true},
                  {'site': 'Kakao',      'isIgnored':true}];
                  //{'site': 'Others',     'isIgnored':false}];

const otherSitePlaceholder = "Others";
{
  let terr = {};
  terr["site"] = otherSitePlaceholder;
  terr["isIgnored"] = false;
  sitesList.push(terr);
}

/*
   This is where the metadata entries are stored. The array will be processed during the
     startup and is not meant to be edited afterwards. The database assumes that the
     entries have already been sorted beforehand.
*/
const parsedVideos = [];

console.log('Loading metadata...');

/*
   This is where the video entries are processed into the database. The time range can
     be edited through maxMonth and minMonth values.
*/

{
   //let numm = 0;
   for (let y = maxMonth; y >= minMonth; y--) {
      let terappi = jsonLocation + 'vids' + y + '.json';
      //let terappi = 'F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts2/vids' + y + '.json';
      //let terappi = 'vidJson2/vids' + y + '.json';
      console.log('Loading ' + terappi)  ;
      try {
         parsedVideos.push(...JSON.parse(fs.readFileSync(terappi, 'utf8')));


         //let parSub = JSON.parse(fs.readFileSync(terappi, 'utf8'));
         console.log('Loaded!')  ;

         //numm++;
         console.log(terappi)  ;
         forceGC();
      } catch(e) {
         console.log("Oh wait, that doesn't exist");
      }
   }
}
         /*
//async function readAndProcessFiles() {
  for (let y = maxMonth; y >= minMonth; y--) {
    const terappi = jsonLocation + 'vids' + y + '.json';
    console.log('Loading ' + terappi);

    try {
      console.log('Zumi');
      const readStream = fs.createReadStream(terappi, { encoding: 'utf8' });
      let fileContent = '';

      readStream.on('data', (chunk) => {
        fileContent += chunk;
      console.log('Dokumi');
      });

      readStream.on('end', () => {
        const jsonData = JSON.parse(fileContent);
        parsedVideos.push(...jsonData);

        // Process parsedVideos here if needed

        // Clear the content of parsedVideos after processing
        parsedVideos.length = 0;

        console.log('Loaded and processed!');
        forceGC(); // Optional: To manually trigger garbage collection
      });

      readStream.on('error', (err) => {
        console.log("Error reading file:", err);
      });
    } catch (e) {
      console.log("Oh wait, that doesn't exist or there was an error:", e);
    }
  }   */
//}

//readAndProcessFiles();

console.log('All metadata loaded!');
console.log("Total number of entries: " + parsedVideos.length);

mostRecentDate = parsedVideos[0].upload_date;
leastRecentDate = parsedVideos[parsedVideos.length - 1].upload_date;
dateQueried1 = mostRecentDate;
dateQueried1 = leastRecentDate;

/*
   Used to turn seconds into more readable form.
*/
function formatDuration(justSeconds) {
    let minute = 60;

    let mins = 0;
    let secs = Math.ceil(justSeconds);

    while (secs >= minute) {
        mins++;
        secs = secs - minute;
    }

    /*
    if (secs < 10 && mins < 60) {
        return mins + ':0' + secs;
    }
    */

    if (mins < 60) {
        return mins + ':' + ("" + secs).padStart(2, '0');
    }

    let hours = 0;

    while (mins >= minute) {
        hours++;
        mins = mins - minute;
    }

    /*
    let retStr = hours + ':';

    if (mins < 10) {
        retStr = retStr + '0';
    }

    retStr = retStr + mins + ':';

    if (secs < 10) {
        retStr = retStr + '0';
    }

    retStr = retStr + secs;
    */

    return hours + ':' + ("" + mins).padStart(2, '0') + ':' + ("" + secs).padStart(2, '0');
}

/*
   Used to turn seconds into more sensible form.

function formatDuration_old(justSeconds) {
    let minute = 60;

    let mins = 0;
    let secs = Math.ceil(justSeconds);

    while (secs >= minute) {
        mins++;
        secs = secs - minute;
    }

    if (secs < 10 && mins < 60) {
        return mins + ':0' + secs;
    }

    if (mins < 60) {
        return mins + ':' + secs;
    }

    let hours = 0;

    while (mins >= minute) {
        hours++;
        mins = mins - minute;
    }

    let retStr = hours + ':';

    if (mins < 10) {
        retStr = retStr + '0';
    }

    retStr = retStr + mins + ':';

    if (secs < 10) {
        retStr = retStr + '0';
    }

    retStr = retStr + secs;

    return retStr;
}
*/

/*
   In case of separate search words, this optimizes them in two ways:
   1. Gets rid of search words that might already be part of other search words. For
      example, a query with "ant lantern" will be shortened to just "lantern".
   2. Sorts them from longest to shortest. The longer the search word, the less likely
      there will be matches and the database should be able to process them quicker.
*/
function optimizeSearching(searchWord,exactSearch) {
    if (searchWord === undefined || searchWord === null || (!Array.isArray(searchWord) && searchWord.trim().length === 0)) {
       searchWords = [];
       return undefined;
    }

    let searchWord_tmp = searchWord;
    
    if (Array.isArray(searchWord_tmp)) {
       searchWord_tmp = searchWord_tmp.join(' ');
    }

    if (exactSearch) {
       let ret = [searchWord_tmp.trim()];
       searchWords = ret;
       return ret;
    }

    let searchArray = searchWord_tmp.split(" ").filter(ent => ent.length > 0);
    searchWords = searchArray;

    let tmp1 = searchArray.sort((a, b) => a.length - b.length);
    let tmp2 = [];

    for (let k = 0; k < tmp1.length; k++) {
       let includeStr = true;

       for (let m = tmp1.length - 1; m > k; m--) {
          if (tmp1[m].includes(tmp1[k])) {
             includeStr = false;
             break;
          }
       }

       if (includeStr) tmp2.push(tmp1[k].toLowerCase());
    }

    return tmp2.sort((a, b) => b.length - a.length);
}

/*

*/
function isSameUser(searchUserStr,video) {
   /*
   let hasAltAccounts = checkForOtherChannels(video.extractor_key,video.uploader_id,video.uId);
   console.log(hasAltAccounts);

 if (hasAltAccounts) {
   let checkingArray = true;
   let checkingUser = video.uId;
   if (checkingUser === undefined) {
      checkingUser = video.uploader_id;
      checkingArray = false;
   } else {
      checkingUser = youtubeUserList[video.uId];
   }

   if (!checkingArray) {
      for (let i = 0; i < sameUserList.length; i++) {
         if (Object.values(sameUserList[i]).includes(searchUserStr.trim())) return true;
      }
   } if (checkingArray) {
      let userIds = youtubeUserList[youtubeUserList.findIndex(ent => ent.includes(searchUserStr.trim()))];

      for (let j = 0; j < userIds.length; j++) {
         for (let i = 0; i < sameUserList.length; i++) {
            if (Object.values(sameUserList[i]).includes(userIds[j])) return true;
         }
      }
   }
 }     */
   let tmpStr = [searchUserStr.trim()];

   if (searchedUploaderHasAlts) {
      tmpStr = uploadersAlts;
   }

   if (video.uId === undefined && video.extractor_key !== "Twitter") return tmpStr.includes(video.uploader_id); // return video.uploader_id === searchUserStr.trim();
   if (video.extractor_key === "Twitter") {
      let twtTmp = twitterUserList.find(ent => ent.handle.includes(video.uploader_id) || ent.id === video.uploader_id);
      //console.log(twtTmp);
      if (twtTmp === undefined) return tmpStr.includes(video.uploader_id); // return video.uploader_id === searchUserStr.trim();
      for (let k = 0; k < tmpStr.length; k++) {
         if (twtTmp.handle.includes(tmpStr[k])) return true;
      }

      return tmpStr.includes(twtTmp.id);
      // return (twtTmp.id === searchUserStr.trim() ||  twtTmp.handle.includes(searchUserStr.trim()));
   }
   
   if (video.uId !== undefined && video.extractor_key === "Niconico") {
      return tmpStr.includes(niconicoUserList[video.uId]);
   }

   for (let p = 0; p < tmpStr.length; p++) {
      if (youtubeUserList[video.uId].includes(tmpStr[p])) return true;
   }
   
   return false;

   //let userArr = youtubeUserList[video.uId];

   //return youtubeUserList[video.uId].includes(searchUserStr.trim());
}

/*
   Checks if any of the sites have been set to be ignored during searching
*/
function ignoredSitesPresent() {
   return sitesList.some(ent => ent.isIgnored === true);
}


function compileList() {
   let retStr = '<hr/>' + breakline;

   for (let i = 0; i < foundVids.length; i++) {
      retStr += compileEntry(parsedVideos[foundVids[i]]) + breakline + '<hr/>' + breakline;
   }

   return retStr;

  /*
   let retStr = '<hr/>' + breakline;

   let start_tmp = 0;
   if (foundVids.length > 15 && pageNumber > 1) start_tmp = videosPerPage;

   for (let i = start_tmp; i < foundVids.length; i++) {
      retStr += compileEntry(foundVids[i]) + breakline + '<hr/>' + breakline;
      //retStr += compileEntry(parsedVideos[foundVids[i]]) + breakline + '<hr/>' + breakline;
   }

   return retStr;  */
}

let searchedUploaderHasAlts = false;
let uploadersAlts = [];

function findVideos(searchWord,reqPage = 1,exactSearch = false,searchUploaderId = null) {
   searchedUploaderHasAlts = false;
   uploadersAlts = [];
  {
   let showAllVideos = false;
   foundVids = [];
   let searchTmp = optimizeSearching(searchWord,exactSearch);
   //console.log(searchTmp);
   if (searchTmp === undefined && searchUploaderId === null && !ignoredSitesPresent()) showAllVideos = true;
   //else showAllVideos = false;

   if (showAllVideos) {
      pageTotal = Math.ceil(parsedVideos.length / videosPerPage);

      let pageTmp = reqPage;
      if (pageTmp > pageTotal || pageTmp < 1) pageTmp = 1;
      let searchThres = (pageTmp - 1) * videosPerPage;
      pageNumber = pageTmp;

      foundVids = [];

      for (let u = searchThres; u < (searchThres + videosPerPage) && u < parsedVideos.length; u++) {
         // foundVids.push(u);
         foundVids.push(u);
      }
   }

   else {
      let searchUploaderToo = !(searchUploaderId === null);

      if (searchUploaderToo) {
         let checkTmp = idPlacementInAltList(searchUploaderId);
         if (checkTmp >= 0) {
            searchedUploaderHasAlts = true;
            let tmpArr = youtubeUserList.filter(ent => {
               for (let j = 0; j < ent.length; j++) {
                  if (Object.values(sameUserList[checkTmp]).includes(ent[j])) return true;
               }
               return false;
            });
            let tmpArr2 = Object.values(sameUserList[checkTmp]);
            for (let j = 0; j < tmpArr.length; j++) {
               tmpArr2.push(...tmpArr[j]);
            }
            // console.log(tmpArr2);
            // console.log(tmpArr);
            uploadersAlts = tmpArr2;
         }
      }

      /*
      let vidTmp1 = parsedVideos.map((ent,ind) => {
         let tmp2 = sitesList.findIndex(siteEnt => siteEnt.site === ent.extractor_key);
         if (tmp2 === -1) tmp2 = sitesList.length - 1;
         if (sitesList[tmp2].isIgnored) return undefined;
         if (searchUploaderToo && !isSameUser(searchUploaderId,ent)) return undefined;
         if (!hasSearchWords(searchTmp,ent)) return undefined;
         return ind;
      }).filter(ent => ent !== undefined);    
      */

      let startTmp1 = 0;
      let startTmp2 = videosPerPage;

      let pageTmp = reqPage;
      if (pageTmp < 1) pageTmp = 1;
      let endTmp1 = (pageTmp - 1) * videosPerPage;
      let endTmp2 = pageTmp * videosPerPage;
      pageNumber = pageTmp;

      //console.log(itIsFirstPage);
      let foundVidAmount = 0;
      let vidTmp1 = [];
      let foundMore = false;

      // FOR OFFLINE BLACLISTING PURPOSES
      // amountBlack = {};
      // amountWhite = {};
     
     {
      let itIsFirstPage = (startTmp1 === endTmp1);
      let foundVidAmoun2 = 0;
      let alreadyEnough = false;

      //console.log(`Values : ${startTmp1} - ${startTmp2} > ${endTmp1} - ${endTmp2}`);


      let vidTmp_ = parsedVideos.filter((ent,ind) => {
         let tmp2 = sitesList.findIndex(siteEnt => siteEnt.site === ent.extractor_key);
         if (tmp2 === -1) tmp2 = sitesList.length - 1;
         if (sitesList[tmp2].isIgnored) return false;
         if (searchUploaderToo && !isSameUser(searchUploaderId,ent)) return false;
         if (!hasSearchWords(searchTmp,ent)) return false;

         //console.log(ind);

         if (!alreadyEnough && startTmp1 <= foundVidAmount && startTmp2 > foundVidAmount) {
            // console.log("lol");
            foundVidAmount++;
            foundVidAmoun2++;
            if (itIsFirstPage && foundVidAmoun2 >= videosPerPage) alreadyEnough = true;
            vidTmp1.push(ind);
            return false;
         }

         if (!alreadyEnough && endTmp1 <= foundVidAmount && endTmp2 > foundVidAmount) {
            if (!foundMore) {
               foundMore = true;
               vidTmp1 = [];
            }
            // console.log("lol2");
            foundVidAmount++;
            foundVidAmoun2++;
            if (foundVidAmoun2 >= (videosPerPage * 2)) alreadyEnough = true;
            vidTmp1.push(ind);
            return false;
         }

         foundVidAmount++;
         return false;
      });
     }
     
      // blaclListCheck();
      //console.log(vidTmp1);

      //let foundVidAmount = vidTmp1.length;
      pageTotal = Math.ceil(foundVidAmount / videosPerPage);

      if (!foundMore) {
      //if (foundVidAmount <= videosPerPage) {
         pageNumber = 1;
         //itIsFirstPage = true;
      }
      
      foundVids = vidTmp1;

      //if (foundVidAmount)
      /*
      foundVids = vidTmp1.filter((ent,ind) => (ind >= ((pageNumber - 1) * videosPerPage) && ind < (pageNumber * videosPerPage)));
      */
   }
  }
   forceGC();
}

// FOR OFFLINE BLACKLISTING PURPOSES, DON'T HAVE THIS WHEN PUTTING THIS ONLINE
// let amountBlack = {};
// let amountWhite = {};

function hasSearchWords(searchWord,video) {
   /*
   if (video.uId !== undefined) {
      if (amountWhite[youtubeUserList[video.uId][0]] === undefined) amountWhite[youtubeUserList[video.uId][0]] = 0;
      amountWhite[youtubeUserList[video.uId][0]]++;
   }
   else {
      if (amountWhite[video.uploader_id] === undefined) amountWhite[video.uploader_id] = 0;
      amountWhite[video.uploader_id]++;
   }
   */


   if (searchWord === undefined || searchWord === null || searchWord.length === 0) return true;

   let tmpVid = Object.values(video).filter((ent,ind) => {
      let compTmp = Object.keys(video)[ind];
      if (compTmp === "tags" || compTmp === "uId" || compTmp === "duration" || compTmp === "extractor_key" || compTmp === "webpage_url" || compTmp === "uploader_url") return false;
      return true;
   }).join(" ").toLowerCase();

   //tmpVid.push(...videoTags(video.tags));

   //if (video.uId !== undefined) tmpVid.push(...youtubeUserList[video.uId]);

   // USE THIS FOR NORMAL ONLINE USE
   return searchWord.every(srcWrd => tmpVid.includes(srcWrd) || videoTags(video.tags).join(" ").toLowerCase().includes(srcWrd) || (video.uId !== undefined && video.extractor_key === "Niconico" && niconicoUserList[video.uId].includes(srcWrd)) || (video.uId !== undefined && video.extractor_key === "Youtube" && youtubeUserList[video.uId].join(" ").toLowerCase().includes(srcWrd)));

   // FOR OFFLINE BLACKLISTING PURPOSES
   /*
   let retVal = searchWord.every(srcWrd => tmpVid.includes(srcWrd) || videoTags(video.tags).join(" ").toLowerCase().includes(srcWrd) || (video.uId !== undefined && youtubeUserList[video.uId].join(" ").toLowerCase().includes(srcWrd)));

   if (retVal) {
      if (video.uId !== undefined) {
         if (amountBlack[youtubeUserList[video.uId][0]] === undefined) amountBlack[youtubeUserList[video.uId][0]] = 0;
         amountBlack[youtubeUserList[video.uId][0]]++;
      }
      else {  
         if (amountBlack[video.uploader_id] === undefined) amountBlack[video.uploader_id] = 0;
         amountBlack[video.uploader_id]++;
      }
   }
   */
   
   return retVal;
}

/*
function blaclListCheck() {
   let blackUsers = Object.keys(amountBlack);
   console.log(amountBlack);
   let blackList = [];

   for (let i = 0; i < blackUsers.length; i++) {
      if (amountBlack[blackUsers[i]] === 1) continue;

      if (amountBlack[blackUsers[i]] >= 50) {
          blackList.push(blackUsers[i]);
          continue;
      }

      if (amountBlack[blackUsers[i]] >= ( Math.floor(amountWhite[blackUsers[i]] * (2 / 3)) ) ) {
          blackList.push(blackUsers[i]);
      }
   }
   
   let writerino = '"' + blackList.join('","') + '"';

   fs.writeFileSync('F:/Dropbox/NodeJS/blacklisterino.txt', writerino);
} 
*/

function htmlBlockCompiler(typeHtm,txt,additionalInfo = null) {
   if (additionalInfo === null) return '<' + typeHtm + '>' + txt + '</' + typeHtm + '>' ;

   return '<' + typeHtm + ' ' + additionalInfo + '>' + txt + '</' + typeHtm + '>' ;
}

function htmlLinkCompiler(address,txt = null,targetBlank = true) {
   let tmpTxt = txt;
   if (tmpTxt === null) tmpTxt = address;

   if (targetBlank) return '<a href="' + address + '" target="_blank">' + tmpTxt + '</a>';
   return '<a href="' + address + '">' + tmpTxt + '</a>';
}

function userLinkCompiler(userName,userId,site) {
   let langTmp = '';
   if (pageLanguage === "jp") langTmp = '&lang=jp';

   let searchUploaderStr = '[Search uploader]';
   if (pageLanguage === 'jp') searchUploaderStr = '[&#25237;&#31295;&#32773;&#12434;&#26908;&#32034;]';

   if (site === "Youtube") {
      let idTmp = userId;
      let multipleId = false;
      if (Number.isInteger(userId)) {
         idTmp = youtubeUserList[userId];
         multipleId = true;
      }

      if (!multipleId) return htmlLinkCompiler(userAddressCompiler(idTmp,site),(userName + ' [' + htmlBlockCompiler("code",idTmp) + ']')) + " &#8887; " + htmlLinkCompiler("results.html?uploader_id=" + userId + `${langTmp}&${botCheckName}=${botCheckValue}`,htmlBlockCompiler("code",searchUploaderStr),false);

      let retStr = htmlLinkCompiler(userAddressCompiler(idTmp[0],site),(userName + ' [' + htmlBlockCompiler("code",idTmp[0]) + ']'));
      for (let j = 1; j < idTmp.length; j++) {
         retStr += ' ' + htmlLinkCompiler(userAddressCompiler(idTmp[j],site),('[' + htmlBlockCompiler("code",idTmp[j]) + ']'));
      }
      retStr += " &#8887; " + htmlLinkCompiler("results.html?uploader_id=" + idTmp[idTmp.length - 1] + `${langTmp}&${botCheckName}=${botCheckValue}`,htmlBlockCompiler("code",searchUploaderStr),false);

      return retStr;
   }
   if (site === "Twitter" || site === "Niconico" || site === "BiliBili") {
      return htmlLinkCompiler(userAddressCompiler(userId,site),(userName + ' [' + htmlBlockCompiler("code",userId) + ']')) + " &#8887; " +  htmlLinkCompiler("results.html?uploader_id=" + userId + `${langTmp}&${botCheckName}=${botCheckValue}`,htmlBlockCompiler("code",searchUploaderStr),false);
   }
}

function userAddressCompiler(id_,site) {
   if (site === "Twitter") {
      let tmp1 = twitterUserList.findIndex(ent => ent.handle.includes(id_));
      if (tmp1 === -1) return 'https://twitter.com/' + id_;
      return 'https://twitter.com/i/user/' + twitterUserList[tmp1].id;
   }

   if (site === "Youtube") {
      // console.log(tmpConsole);
      if (id_.length === 24 && id_.substring(0,2) === 'UC') return "https://www.youtube.com/channel/" + id_;
      if (id_.charAt(0) === '@' || id_.substring(0, 2) === 'c/') return "https://www.youtube.com/" + id_;
      return "https://www.youtube.com/user/" + id_;
   }

   if (site === "Niconico") {
      return "https://www.nicovideo.jp/user/" + id_;
   }

   if (site === "BiliBili") {
      return "https://space.bilibili.com/" + id_;
   }
}

function videoTags(vidTags) {
   if (vidTags === undefined || vidTags === null) return [];

   let tagsTmp = [];

   for (let i = 0; i < vidTags.length; i++) {
      if (Number.isInteger(vidTags[i])) tagsTmp.push(tagsList[vidTags[i]]);
      else tagsTmp.push(vidTags[i]);
   }

   return tagsTmp;
}

function videoLinkCompiler(id,site) {
   if (site === "Twitter")  return htmlLinkCompiler('https://twitter.com/i/status/' + id);
   if (site === "Youtube")  return htmlLinkCompiler('https://www.youtube.com/watch?v=' + id);
   if (site === "Niconico") return htmlLinkCompiler('https://www.nicovideo.jp/watch/' + id);
   if (site === "BiliBili") {
      if (id.length === 2) return htmlLinkCompiler('https://www.bilibili.com/video/' + id[0]) + ' / ' + htmlLinkCompiler('https://www.bilibili.com/video/' + id[1],id[1]);
      else if (id.length === 1) return htmlLinkCompiler('https://www.bilibili.com/video/' + id[0]);
   }
}

function addLinks(descri) {
   //return descri;

   let checkHttp1 = 'http';
   //let checkHttp2 = ['\n',' '];
   //let checkHttp2 = ['<br/>',' '];
   let checkHttp2 = [' '];
   // let checkHttp3 = ['youtu.be/'];

   let descr = descri.split("\n").join(" <br/>");

   let retArr = [];

   let tmpHt = descr.indexOf(checkHttp1);
               /*
   for (let j = 0; j < checkHttp3.length; j++) {
      let tmpCh = descr.indexOf(checkHttp3[j]);
      if ((tmpHt === -1) || (tmpCh !== -1 && tmpHt > tmpCh)) {
         tmpHt = tmpCh;
      }
   }         */

   if (tmpHt === -1) return descri;

   //let tmppp = 0;

   while (tmpHt > -1) {
      retArr.push(descr.substring(0,tmpHt));

      descr = descr.substring(tmpHt);

      let arrrtmp = [];

      let tmppp = -1;
      for (let i = 0; i < checkHttp2.length; i++) {
         arrrtmp.push(descr.indexOf(checkHttp2[i]));
      }
      tmppp = Math.min(...arrrtmp);
      if (tmppp === -1) tmppp = descr.length;
      //console.log(tmppp + " -- " + descr);

      retArr.push(editLink(descr.substring(0,tmppp)));

      descr = descr.substring(tmppp);

      tmpHt = descr.indexOf(checkHttp1);
         /*
      for (let j = 0; j < checkHttp3.length; j++) {
         let tmpCh = descr.indexOf(checkHttp3[j]);
         if ((tmpHt === -1) || (tmpCh !== -1 && tmpHt > tmpCh)) {
            tmpHt = tmpCh;
         }
      }    */
   }

   retArr.push(descr);

   /*
   while (tmpHt > -1) {
      tmppp = -1;
      let arrrtmp = [];
      //console.log(tmpHt);
      for (let i = 0; i < checkHttp2.length; i++) {
         arrrtmp.push(descr.indexOf(checkHttp2[i]));
         //if (tmppp === -1 || tmppp > descr.indexOf(checkHttp2[i],tmpHt + 1)) tmppp = descr.indexOf(checkHttp2[i],tmpHt + 1);
      }
      tmppp = Math.min(...arrrtmp);
      //console.log("A " + tmppp);

      retArr.push(descr.substring(0,tmpHt));
      //let linkPart   = "";
      if (tmppp === -1) retArr.push(editLink(descr.substring(tmpHt)));
      else retArr.push(editLink(descr.substring(tmpHt,tmppp)));
      let secondPart = "";
      if (tmppp > -1) secondPart = descr.substring(tmppp);
      descr = secondPart;

      tmpHt = descr.indexOf(checkHttp1);

      if (tmpHt === -1) retArr.push(descr);
   } */

   return retArr.join("");
}

function editLink(linkTmp) {
   let tmpp1 = linkTmp;

   let youTubeChecking   = ["youtu.be/","youtube.com/watch?v=","youtube.com/shorts/"];
   let nicovideoChecking = ["nicovideo.jp/watch/","nico.ms/"];

   let youtubeIdLength = 11;

   let searchIdStr = "[Search ID]";
   if (pageLanguage === 'jp') searchIdStr = "[ID&#12434;&#26908;&#32034;]";

   let addSearchLinkYoutube = false;
   let addSearchLinkNiconico = false;

   let tempp = Math.max(youTubeChecking.length,nicovideoChecking.length);

   for (let i = 0; i < tempp; i++) {
      if (youTubeChecking.length > i && tmpp1.includes(youTubeChecking[i])) {
         addSearchLinkYoutube = true;
         break;
      } if (nicovideoChecking.length > i && tmpp1.includes(nicovideoChecking[i])) {
         addSearchLinkNiconico = true;
         break;
      }
   }

   if (!addSearchLinkYoutube && !addSearchLinkNiconico) return htmlLinkCompiler(linkTmp);

   if (addSearchLinkNiconico) {
      let tmpLinkerino = -1;
      for (let y = 0; y < nicovideoChecking.length; y++) {
         if (tmpLinkerino === -1) {
            if (tmpp1.indexOf(nicovideoChecking[y]) > -1) {
               tmpLinkerino = y;
               break;
            }
         }
      }

      let tmpLinkerino3 = tmpp1.indexOf(nicovideoChecking[tmpLinkerino]) + nicovideoChecking[tmpLinkerino].length;
      let tmpLinkerino2 = tmpp1.substring(tmpLinkerino3);
      let tmpLinkerino4 = 0;

      //console.log(tmpLinkerino2);

      if (tmpLinkerino2.indexOf(" ") > 0) tmpLinkerino4 = tmpLinkerino2.indexOf(" ");
      if (tmpLinkerino2.indexOf("?") > 0 && (tmpLinkerino4 > tmpLinkerino2.indexOf("?") || tmpLinkerino4 === 0)) tmpLinkerino4 = tmpLinkerino2.indexOf("?");
      if (tmpLinkerino2.indexOf(")") > 0 && (tmpLinkerino4 > tmpLinkerino2.indexOf(")") || tmpLinkerino4 === 0)) tmpLinkerino4 = tmpLinkerino2.indexOf(")");
      if (tmpLinkerino2.indexOf(".") > 0 && (tmpLinkerino4 > tmpLinkerino2.indexOf(")") || tmpLinkerino4 === 0)) tmpLinkerino4 = tmpLinkerino2.indexOf(".");
      if (tmpLinkerino4 === 0) tmpLinkerino4 = tmpLinkerino2.length;

      // Checking if there is a video with this ID
      

      return htmlLinkCompiler(linkTmp) + " " + htmlLinkCompiler('results.html?search=' + encodeURIComponent(tmpLinkerino2.substring(0,tmpLinkerino4)) + `&${botCheckName}=${botCheckValue}`, htmlBlockCompiler("code",searchIdStr),false);
   }

   if (addSearchLinkYoutube) {
      let tmpLinkerino = -1;
      for (let y = 0; y < youTubeChecking.length; y++) {
         if (tmpLinkerino === -1) {
            if (tmpp1.indexOf(youTubeChecking[y]) > -1) {
               tmpLinkerino = y;
               break;
            }
         }
      }

      let tmpLinkerino3 = tmpp1.indexOf(youTubeChecking[tmpLinkerino]) + youTubeChecking[tmpLinkerino].length;
      let tmpLinkerino2 = tmpp1.substring(tmpLinkerino3);
      if (tmpLinkerino2.length > youtubeIdLength) {
         tmpLinkerino2 = tmpLinkerino2.substring(0,youtubeIdLength);
      }

      //console.log (tmpp1.charAt(tmpLinkerino3 + youtubeIdLength));

      let checkerCh = tmpp1.charAt(tmpLinkerino3 + youtubeIdLength);
      let linkTmp2 = linkTmp;
      //if (tmpp1.charAt(tmpLinkerino3 + youtubeIdLength) !== '&') linkTmp2 = tmpp1.substring(0,tmpLinkerino3 + youtubeIdLength);
      //if (!linkTmp2.includes('http')) linkTmp2 = 'https://' + linkTmp2;

      if (checkerCh !== '&' && checkerCh !== '?') return htmlLinkCompiler(tmpp1.substring(0,tmpLinkerino3 + youtubeIdLength)) + " " + htmlLinkCompiler('results.html?search=' + encodeURIComponent(tmpLinkerino2) + `&${botCheckName}=${botCheckValue}`, htmlBlockCompiler("code",searchIdStr),false) + " " + tmpp1.substring(tmpp1.indexOf(youTubeChecking[tmpLinkerino]) + youTubeChecking[tmpLinkerino].length + youtubeIdLength);
      //if (checkerCh !== '&' && checkerCh !== '?') return htmlLinkCompiler("https://www.youtube.com/watch?v=" + tmpLinkerino2,tmpp1.substring(0,tmpLinkerino3 + youtubeIdLength)) + " " + htmlLinkCompiler('results.html?search=' + tmpLinkerino2, htmlBlockCompiler("code","[Search ID]"),false) + " " + tmpp1.substring(tmpp1.indexOf(youTubeChecking[tmpLinkerino]) + youTubeChecking[tmpLinkerino].length + youtubeIdLength);

      return htmlLinkCompiler(linkTmp) + " " + htmlLinkCompiler('results.html?search=' + encodeURIComponent(tmpLinkerino2) + `&${botCheckName}=${botCheckValue}`, htmlBlockCompiler("code",searchIdStr),false);
      //return htmlLinkCompiler("https://www.youtube.com/watch?v=" + tmpLinkerino2,linkTmp) + " " + htmlLinkCompiler('results.html?search=' + tmpLinkerino2, htmlBlockCompiler("code","[Search ID]"),false);

      //htmlLinkCompiler('results.html?search=' +
   }
   return htmlLinkCompiler(linkTmp);
}

function editDescription(ogDesc,descExtr) {
   if (ogDesc === undefined || ogDesc === null || ogDesc.trim().length === 0) return putDescriptionInBox(htmlBlockCompiler("code","[No description]"));

   let descTmp = ogDesc.trim();

   if (descExtr !== "Niconico" && descTmp.includes('http')) {
      descTmp = addLinks(ogDesc);
   }

   let lineBreakN = '\n';
   let lineBreakLoc = descTmp.indexOf(lineBreakN);
   if (lineBreakLoc === -1) return putDescriptionInBox(descTmp.trim());

   let retDesc = "";
   let tmpPos = 0;
   while (lineBreakLoc !== -1) {
      let tmpStr1 = descTmp.substring(tmpPos,lineBreakLoc);
      retDesc += tmpStr1 + '<br/>';
      tmpPos = lineBreakLoc + lineBreakN.length;
      lineBreakLoc = descTmp.indexOf(lineBreakN,lineBreakLoc + 1);
   }
   retDesc += descTmp.substring(tmpPos);
   return putDescriptionInBox(retDesc.trim());
}

function putDescriptionInBox(descr) {
   return htmlBlockCompiler("div",descr,'class="videoDescription"');
}

/*
console.log(compileEntry(parsedVideos[0]));
console.log(compileEntry(parsedVideos.find(ent => ent.extractor_key === "Youtube")));
console.log(compileEntry(parsedVideos.find(ent => ent.tags.length > 0)));
console.log(compileEntry(parsedVideos.find(ent => ent.webpage_url !== undefined && ent.extractor_key !== "VK"))); */

function idPresentInAltList(checkUploaderId) {
   let valueArr = [];

   sameUserList.forEach(item => {
      Object.values(item).forEach(value => {
         if (Array.isArray(value)) {
            valueArr.push(...value);
         } else {
            valueArr.push(value);
         }
      });
   });
   
   return valueArr.includes(checkUploaderId.trim());
}

function idPlacementInAltList(checkUploaderId) {
   /*
   sameUserList.forEach(item => {
      Object.values(item).forEach(value => {
         if (Array.isArray(value)) {
            //valueArr.push(...value);
         } else {
            if ()
            //valueArr.push(value);
         }
      });
   });    */
   
   for (let i = 0; i < sameUserList.length; i++) {
       let tmop = Object.values(sameUserList[i]);
       if (tmop.includes(checkUploaderId.trim())) return i;
   }
   
   return -1;
}

/*
   Provides
*/
function checkForOtherChannels(siteKey,checkUploaderId,checkuId) {
   let valueArr = [];

   sameUserList.forEach(item => {
      Object.values(item).forEach(value => {
         if (Array.isArray(value)) {
            valueArr.push(...value);
         } else {
            valueArr.push(value);
         }
      });
   });

   // console.log(valueArr);

   if ((siteKey === "Youtube" || siteKey === "Niconico") && checkuId !== undefined) {
      if (siteKey === "Youtube") {
         let userIdss = youtubeUserList[checkuId];
         for (let i = 0; i < userIdss.length; i++) {
            if (valueArr.includes(userIdss[i])) return true;
         }
      } if (siteKey === "Niconico") {
         return valueArr.includes(niconicoUserList[checkuId]);
      }
   }
   
   if (valueArr.includes(checkUploaderId)) return true;

   return false;
}

function addOtherChannels(siteKey,checkUploaderId,checkuId) {
   let userArr = -1;
   let ignoreStr = "";

   for (let j = 0; j < sameUserList.length; j++) {
      let checkArr = Object.values(sameUserList[j]);
      let ignoreSlot = -1;

      if ((siteKey === "Youtube" || siteKey === "Niconico") && checkuId !== undefined) {
         if (siteKey === "Youtube") {
            let userIdss = youtubeUserList[checkuId];
            for (let i = 0; i < userIdss.length; i++) {
               if (checkArr.includes(userIdss[i])) {
                 userArr = j;
                 break;
               }
            }
         } if (siteKey === "Niconico" && checkArr.includes(niconicoUserList[checkuId])) {
            userArr = j;
            break;
         }
      }

      if (checkArr.includes(checkUploaderId)) userArr = j;
      
      if (userArr !== -1) break;
   }

   let retStr = "Alt channels:";
   if (pageLanguage === 'jp') retStr = "&#21029;&#12481;&#12515;&#12531;&#12493;&#12523;:";
   let vals = Object.values(sameUserList[userArr]);
   //console.log(vals);
   for (let h = 0; h < vals.length; h++) {
      if (checkUploaderId !== undefined && vals[h] === checkUploaderId) continue;
      if (checkuId !== undefined && youtubeUserList[checkuId].includes(vals[h])) continue;
      if (checkuId !== undefined && niconicoUserList[checkuId] === vals[h]) continue;

      let tmpLink = 'results.html?uploader_id=' + vals[h];
      if (showVidPrev) tmpLink += '&preview=true';
      if (pageLanguage === "jp") tmpLink += '&lang=jp';
      tmpLink += '&' + botCheckName + '=' + botCheckValue;
      
      retStr += " " + htmlLinkCompiler(tmpLink,"[" + vals[h] + "]",false);
   }

   /*
   if (sameUserList[userArr].mainYoutube !== undefined) retStr += " " + htmlLinkCompiler('results.html?uploader_id=' + sameUserList[userArr].mainYoutube + '&' + botCheckName + '=' + botCheckValue,"[" + sameUserList[userArr].mainYoutube + "]",false);
   
   if (sameUserList[userArr].altYoutube !== undefined) {
      for (let h = 0; h < sameUserList[userArr].altYoutube.length; h++) {
         retStr += " " + htmlLinkCompiler('results.html?uploader_id=' + sameUserList[userArr].altYoutube[h] + '&' + botCheckName + '=' + botCheckValue,"[" + sameUserList[userArr].altYoutube[h] + "]",false);
      }
   }

   if (sameUserList[userArr].mainNiconico !== undefined) retStr += " " + htmlLinkCompiler('results.html?uploader_id=' + sameUserList[userArr].mainNiconico + '&' + botCheckName + '=' + botCheckValue,"[" + sameUserList[userArr].mainNiconico + "]",false); */
   
   return htmlBlockCompiler("code",retStr);
}

/*
   Creates a <div> segment of a singular video entry.
*/
function compileEntry(video) {
   console.log(video.id);
   
   let searchUploaderStr = '[Search uploader]';
   if (pageLanguage === 'jp') searchUploaderStr = '[&#25237;&#31295;&#32773;&#12434;&#26908;&#32034;]';

   let userAddress = "";
   if (video.uploader_url !== undefined && video.uploader_url !== null) userAddress = htmlLinkCompiler(video.uploader_url,video.uploader + ' [' + htmlBlockCompiler("code",video.uploader_id) + ']') + " &#8887; " + htmlLinkCompiler(`results.html?uploader_id=${video.uploader_id}&${botCheckName}=${botCheckValue}`,htmlBlockCompiler("code",searchUploaderStr),false);
   else {
      if ((video.extractor_key === "Youtube" || video.extractor_key === "Niconico") && video.uId !== undefined) {

         if (video.extractor_key === "Youtube") {
             // tmpConsole = video;
             //if (video.uId === undefined) console.log(video);
             userAddress = userLinkCompiler(video.uploader,video.uId,video.extractor_key);
         }
         if (video.extractor_key === "Niconico") userAddress = userLinkCompiler(video.uploader,niconicoUserList[video.uId],video.extractor_key);
      }
      else { 
         // console.log(video);
         userAddress = userLinkCompiler(video.uploader,video.uploader_id,video.extractor_key);
      }
   }

   let titleTmp = videoLinkCompiler(video.id, video.extractor_key) + ' (' + formatDuration(video.duration) + ')';
   if (video.extractor_key !== "Twitter") {
      titleTmp = htmlBlockCompiler("b",video.title) + ' (' + formatDuration(video.duration) + ')<br/>' + breakline;
      if (video.webpage_url !== undefined) titleTmp += htmlBlockCompiler("code",htmlLinkCompiler(video.webpage_url));
      else titleTmp += htmlBlockCompiler("code",videoLinkCompiler(video.id,video.extractor_key));
   }

   if (pageLanguage === "jp") {
      userAddress = "<br/><br/>" + breakline + "&#25237;&#31295;&#32773;: " + userAddress + breakline;
   } else {
      userAddress = "<br/><br/>" + breakline + "Uploader: " + userAddress + breakline;
   }

   if (checkForOtherChannels(video.extractor_key,video.uploader_id,video.uId)) userAddress += ' &#8212; ' + addOtherChannels(video.extractor_key,video.uploader_id,video.uId) + breakline;

   userAddress += '<br/>';

   let releaseDate = "Release date: " + video.upload_date + '<br/><br/>' + breakline;
   if (pageLanguage === "jp") {
     releaseDate = "&#20844;&#38283;&#26085;: " + video.upload_date + '<br/><br/>' + breakline;
   }

   let descTmp = editDescription(video.description,video.extractor_key) + '<br/>' + breakline;

   let tagsTmp = htmlBlockCompiler("code",urlizeTags(videoTags(video.tags)));

   let prevTmp = createVideoPreview(video.id,video.extractor_key);

   return htmlBlockCompiler("div",titleTmp + userAddress + releaseDate + prevTmp + descTmp + tagsTmp);
}

function urlizeTags(tagsArray) {
   let strRet = "Tags:";
   if (pageLanguage === "jp") {
      strRet = "&#12479;&#12464;:";
   }

   if (tagsArray.length > 0) {
      for (let p = 0; p < tagsArray.length; p++) {
         strRet += " " + htmlLinkCompiler("results.html?" + switchLister(1,tagsArray[p]),tagsArray[p],false);
      }
   } else strRet += " &#60;NONE&#62;";

   return strRet;
}

function createVideoPreview(vidId,vidSite) {
    if (!showVidPrev) return '';

    //reuploadShowing

    let tmpId = vidId;
    let tmpSite = vidSite;
    let tmpStr = '';

    if (reuploadShowing.some(entry => entry.id === vidId)) {
       let tmp1 = reuploadShowing.find(entry => entry.id === vidId);

       tmpId = tmp1.reup;
       tmpSite = tmp1.reup_site;
       tmpStr += `<code><b>NOTE:</b> Original upload deleted! The following video preview is from ${tmpId} (${tmpSite})</code><br/><br/>`;
    }

    if (tmpSite === 'Youtube') return tmpStr  + createVideoPreviewYoutube(tmpId) + '<br/><br/>' + breakline;
    if (tmpSite === 'Niconico') return tmpStr  + createVideoPreviewNiconico(tmpId) + '<br/><br/>' + breakline;
    if (tmpSite === 'Twitter') return tmpStr  + createVideoPreviewTwitter(tmpId) + breakline;
    if (tmpSite === 'Soundcloud') return tmpStr  + createAudioPreviewSoundcloud(tmpId) + '<br/><br/>' + breakline;
    if (tmpSite === 'Vimeo') return tmpStr  + createVideoPreviewVimeo(tmpId) + '<br/><br/>' + breakline;
    if (tmpSite === 'Kakao') return tmpStr  + createVideoPreviewKakao(tmpId) + '<br/><br/>' + breakline;
    if (tmpSite === 'Dailymotion') return tmpStr  + createVideoPreviewDailymotion(tmpId) + '<br/><br/>' + breakline;
    // Autoplays the video as of now, so I've decided to disable this until I figure out how to stop it from doing that
    // if (tmpSite === 'BiliBili') return tmpStr + createVideoPreviewBilibili(tmpId) + '<br/><br/>' + br;
    return '';
}

// The player keeps autoplaying the videos, I'll try tweak this later
function createVideoPreviewBilibili(vidId) {
    let embbee = '<iframe src="https://player.bilibili.com/player.html?aid=' + vidId + '&autoplay=false" width="640" height="480" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>';
    return embbee;
}

function createVideoPreviewYoutube(vidId) {
    let embbee = '<iframe width="640" height="480" src="https://www.youtube.com/embed/' + vidId + '" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>';
    return embbee;
}

function createVideoPreviewNiconico(vidId) {
    let embbee = '<iframe width="640" height="480" src="https://embed.nicovideo.jp/watch/' + vidId + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>';
    return embbee;
}

function createAudioPreviewSoundcloud(vidId) {
    let embbee = '<iframe width="640" height="300" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' + vidId + '&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe>';
    return embbee;
}

function createVideoPreviewVimeo(vidId) {
    let embbee = '<iframe src="https://player.vimeo.com/video/' + vidId + '" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>';

    return embbee;
}

function createVideoPreviewKakao(vidId) {
    let embbee = '<iframe width="640" height="480" src="https://play-tv.kakao.com/embed/player/cliplink/' + vidId + '?service=player_share" allowfullscreen frameborder="0" scrolling="no" allow="autoplay; fullscreen; encrypted-media"></iframe>';

    return embbee;
}

function createVideoPreviewDailymotion(vidId) {
    let embbee = '<iframe frameborder="0" type="text/html" src="https://www.dailymotion.com/embed/video/' + vidId + '" width="640" height="480" allowfullscreen></iframe>';

    return embbee;
}

function createVideoPreviewTwitter(vidId) {
    let requ = new XMLRequest();
    let apiLink = 'https://publish.twitter.com/oembed?url=https%3A%2F%2Ftwitter.com%2Fi%2Fstatus%2F' + vidId;
    let embbee = '';
    requ.onreadystatechange = function() {
      if (requ.readyState == 4 && requ.status == 200){
        embbee = JSON.parse(requ.responseText).html;
        console.log("JSON succesfully fetched from Twitter's site");
      }
    };
    requ.open("GET", apiLink, false);
    requ.send(null);
    requ.abort();
    requ = null;

    embbee = embbee.trim();

    if (embbee === '') embbee = '<br/>[No video preview. The tweet seem to have been deleted.]<br/>';

    return embbee;
}

function htmlHeadCompiler(htmlTitle = null) {

   let htmlStrHead1 = `<!DOCTYPE html>
<html>

<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<link rel="stylesheet" href="https://finnrepo.a2hosted.com/assets/dark_theme_style.css">` + breakline;
   // let titleStr =  'YTPMV Metadata Archive';
   // if (htmlTitle !== null) titleStr = 'YTPMV Metadata Archive - ' + htmlTitle;

   let titleStr =  'YTPMV Metadata Archive';
   let lastUpdStr = 'Last updated';
   if (pageLanguage === 'jp') {
      titleStr   = "YTPMV&#12513;&#12479;&#12487;&#12540;&#12479;&#12539;&#12450;&#12540;&#12459;&#12452;&#12502;";
      lastUpdStr = '&#26368;&#32066;&#26356;&#26032;&#26085;';
   }

   let htmlStrGead2 = `<body>
<div><h2>${titleStr}</h2>${lastUpdStr}: ${getLastUpdated()} &nbsp;&#124;
${getHeaderText()}
</div>
<hr/>`;

   if (htmlTitle !== null) titleStr += ' - ' + htmlTitle;

   return htmlStrHead1 + htmlBlockCompiler("title",titleStr) + breakline + '</head>' + htmlStrGead2;
}

function createPageLinks() {
   let currentPage = htmlBlockCompiler('b',`&#139;${pageNumber}&#155;`);
   //console.log(pageNumber + " / " + pageTotal);

   if (pageTotal === 1) return htmlBlockCompiler("div",currentPage);

   let gapMark = ' &#9674; ';

   let retPageLink = "";

   let retArray = [];

   if (pageNumber !== 1) retArray.push(htmlLinkCompiler('results.html?' + switchLister(1), '&#171;&nbsp;1',false));
   if (pageNumber - 1 > 1) retArray.push(htmlLinkCompiler('results.html?' + switchLister(pageNumber - 1), `&#139;&nbsp;${pageNumber - 1}`,false));
   retArray.push(currentPage);
   if (pageNumber + 1 < pageTotal) retArray.push(htmlLinkCompiler('results.html?' + switchLister(pageNumber + 1), `${pageNumber + 1}&nbsp;&#155;`,false));
   if (pageNumber !== pageTotal && pageTotal !== 0) retArray.push(htmlLinkCompiler('results.html?' + switchLister(pageTotal), pageTotal + '&nbsp;&#187;',false));
   return htmlBlockCompiler("div",retArray.join(gapMark));
}

// sitesList = [ {'site': 'Youtube',    'isIgnored
function switchLister(pageN = 1, searchW = null, prev = null, changeLang = null) {
   let retStr = [];

   let searchTmmp = searchWords;
   if (searchW !== null) searchTmmp = [searchW.trim()];

   if (searchTmmp.length > 0) retStr.push('search=' + encodeURIComponent(searchTmmp.join(" ")));

   if (searchingUser) retStr.push('uploader_id=' + searchedUser);

   if (exactWordSearch) retStr.push("exactSearch=true");

   for (let j = 0; j < sitesList.length; j++) {
      if (sitesList[j].isIgnored) retStr.push(`${sitesList[j].site}=${sitesList[j].isIgnored}`);
   }

   retStr.push("page=" + pageN);

   let prevTmp = showVidPrev;
   if (prev !== null && (prev === false || prev === true)) prevTmp = prev;
   if (prevTmp) retStr.push('preview=' + prevTmp);

   if (pageLanguage === 'jp' && changeLang === null) retStr.push('lang=jp');
   
   // if (changeLang !== 'en' &&)
   if (pageLanguage === 'en' && changeLang !== null && changeLang === 'jp') retStr.push('lang=' + changeLang);
   if (pageLanguage === 'jp' && changeLang !== null) retStr.push('lang=' + changeLang);

   retStr.push(`${botCheckName}=${botCheckValue}`);

   return retStr.join("&");
}

// pageLanguage               
function makeSearchBar(searchStr = "",previewing = false) {
   let boolTmp = false;
   if (previewing !== false && previewing.trim().toLowerCase() === "true") boolTmp = true;

   //console.log("Hakase Fuyuki");
   //console.log(searchStr);
   //console.log(boolTmp);
   
   // let searchStr_tmp = searchStr;
   // if (Array.isArray(searchStr)) searchStr_tmp = searchStr.join(' ');

   let prevTxt1 = "Show video previews";
   if (!boolTmp && pageLanguage === "jp") prevTxt1 = "&#21205;&#30011;&#12503;&#12524;&#12499;&#12517;&#12540;ON";
   if (boolTmp  && pageLanguage === "en") prevTxt1 = "Hide video previews";
   if (boolTmp  && pageLanguage === "jp") prevTxt1 = "&#21205;&#30011;&#12503;&#12524;&#12499;&#12517;&#12540;OFF";
   let prevTxt2 = htmlLinkCompiler("results.html?" + switchLister(pageNumber,null,!boolTmp),prevTxt1,false);
   
   let changeLangStr = '&#26085;&#26412;&#35486;&#12395;&#20999;&#12426;&#26367;&#12360;&#12427;';
   if (pageLanguage === 'jp') changeLangStr = 'Change to English';
   
   let changeLangLink = 'results.html?';
   if (pageLanguage === 'jp') changeLangLink += switchLister(pageNumber, null, null, "en");
   else changeLangLink += switchLister(pageNumber, null, null, "jp");
   
   let changeLangStr2 = htmlLinkCompiler(changeLangLink,changeLangStr,false);

   let searchText1 = 'Search for videos:';
   if (pageLanguage === 'jp') searchText1 = '&#21205;&#30011;&#12434;&#26908;&#32034;:';
   
   let searchText2 = 'Search';
   if (pageLanguage === 'jp') searchText2 = "&#26908;&#32034;";

   let searchText3 = 'Exact word search';
   if (pageLanguage === 'jp') searchText3 = "&#23436;&#20840;&#19968;&#33268;&#26908;&#32034;";

   let searchText4 = 'Exclude from search:';
   if (pageLanguage === 'jp') searchText4 = "&#26908;&#32034;&#12363;&#12425;&#38500;&#22806;:";

   let retStr = `${changeLangStr2}<hr/>

${searchText1}<br/><br/>
<form action="results.html" method="GET">
<input type="text" name="search" value="${searchStr}" />&nbsp;
<input type="submit" value="${searchText2}" />&nbsp;&#124;
<input type="checkbox" id="exactSearch" name="exactSearch" value="true"`
   if (exactWordSearch) retStr += ' checked="yes"';
   retStr += `><label for="exactSearch">&nbsp;${searchText3}</label> &nbsp;&#124; ${prevTxt2}
<input type="hidden" name="${botCheckName}" value="${botCheckValue}" />
<br/><br/>
${searchText4}` + breakline;

   for (let y = 0; y < sitesList.length; y++) {
      retStr += `<input type="checkbox" id="${sitesList[y].site}" name="${sitesList[y].site}" value="true"`;
      if (sitesList[y].isIgnored) retStr += ' checked="yes"';
      retStr += `><label for="${sitesList[y].site}">&nbsp;${sitesList[y].site}</label>` + breakline;
   }

   retStr += '</form><hr/>';

   return htmlBlockCompiler("div",retStr);
}

/*
   Initializing HTML code for index.html
*/
function htmlStrIndex(querie) {
   let htmlStrIndex = 'Search for videos:' + breakline;

   if ('/YTPMV_Database' === querie) {
      htmlStrIndex += '<form action="YTPMV_Database/results.html" method="GET">';
   } else {
      htmlStrIndex += '<form action="results.html" method="GET">';
   }

   htmlStrIndex += '<br/>' + breakline + '<input type="text" name="search" />&nbsp;' + breakline;
   htmlStrIndex += '<input type="submit" value="Search" />' + breakline;
   htmlStrIndex += '<input type="hidden" name="' + botCheckName + '" value="' + botCheckValue + '" />' + breakline;
   htmlStrIndex += '</form><br/>' + breakline;

   return htmlBlockCompiler("div",htmlStrIndex);
}

function urlValueCheker(urlValue) {
   if (urlValue === undefined) return "";
   
   let isArray = Array.isArray(urlValue);
   
   if (isArray) return urlValue[0].trim();
   
   return urlValue.trim();
}

// sitesList = [ {'site': 'Youtube',    'isIgnored':true},
let srvr = http.createServer(function (req, res) {

   let quer = url.parse(req.url, true);
   pageLanguage = 'en';
   // if (quer.query.lang !== undefined && quer.query.lang.trim().toLowerCase() === 'jp') pageLanguage = 'jp';
   if (urlValueCheker(quer.query.lang).toLowerCase() === 'jp') pageLanguage = 'jp';

   let htmPage = '/YTPMV_Database';
   // let searchTmp = quer.query.search;
   // if (searchTmp === undefined) searchTmp = "";
   // if (Array.isArray(searchTmp)) searchTmp = searchTmp.join(' ');
   
   let searchTmp = urlValueCheker(quer.query.search);

   let pageTmp = urlValueCheker(quer.query.page);
   
   // let ipAddr = req.connection.remoteAddress; // || req.socket.remoteAddress;
   // console.log('IP: ' + ipAddr);
   console.log(quer.pathname);
   console.log(quer.query);
   // if (pageTmp === undefined || isNaN(pageTmp.trim())) pageTmp = 1;
   // console.log('Page number: \'' + pageTmp + '\' (' + isNaN(pageTmp) + ')');
   if (isNaN(pageTmp) || pageTmp === '') pageTmp = 1;
   else pageTmp = parseInt(pageTmp);

 {
   let exactTmp = false;
   // if (quer.query.exactSearch !== undefined && quer.query.exactSearch === 'true') exactTmp = true;
   if (urlValueCheker(quer.query.exactSearch) === 'true') exactTmp = true;
   exactWordSearch = exactTmp;
 }

 {
   for (let s = 0; s < sitesList.length; s++) {
      // if (quer.query[sitesList[s].site] !== undefined && quer.query[sitesList[s].site].trim() === 'true') sitesList[s].isIgnored = true;
      if (urlValueCheker(quer.query[sitesList[s].site]) === 'true') sitesList[s].isIgnored = true;
      else sitesList[s].isIgnored = false;
   }

   let uploaderTmp = urlValueCheker(quer.query.uploader_id);
   // if (uploaderTmp === undefined) {
   if (uploaderTmp === '') {
      searchingUser = false;
   } else {
      /* In case any values for uploader_id has been passed on as an array, this will take the array and
         only use the first given uploader_id value as the search value.
      */
      // let uploaderTmp2 = uploaderTmp;
      // if (Array.isArray(uploaderTmp2)) uploaderTmp2 = uploaderTmp[0];

      // searchingUser = true;
      // searchedUser = uploaderTmp2.trim();
      
      searchingUser = true;
      searchedUser = uploaderTmp;
   }

   let previewTmp = urlValueCheker(quer.query.preview);
   // if (previewTmp === undefined || previewTmp.trim() !== 'true') showVidPrev = false;
   if (previewTmp !== 'true') showVidPrev = false;
   else showVidPrev = true;
 }

   let doThis = true;                                                                                            // botCheckName
   // let botCheckTmp = (quer.query[botCheckName] !== undefined && quer.query[botCheckName] === botCheckValue);     // botCheckValue
   let botCheckTmp = (urlValueCheker(quer.query[botCheckName]) === botCheckValue);                               // botCheckValue

   //console.log( quer.query);
                /*
   if ((htmPage + '/video.html') === quer.pathname) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      
      let tmpId = quer.query.id;
      
      if (tmpId === undefined) {
          
      }

      let tmpStr = htmlHeadCompiler();



      doThis = false;
   }          */

   if (!botCheckTmp && (htmPage + '/results.html') === quer.pathname) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      let excepTmp = htmlHeadCompiler("Search bot prevention");
      excepTmp += htmlBlockCompiler("div",`<b>Search bot prevention</b>
<br/><br/>
This page is here to mitigate the load caused by search bots. ` + htmlLinkCompiler("results.html?" + Object.entries(quer.query).map(([key, value]) => `${key}=${value}`).join("&") + `&${botCheckName}=${botCheckValue}`, "Click here",false) + " to complete your query");

      res.write(excepTmp + '</body></html>');

      res.end();

      doThis = false;
   }

   // Results page
   if (botCheckTmp && (htmPage + '/results.html') === quer.pathname) {
      res.writeHead(200, {'Content-Type': 'text/html'});

      if (!searchingUser) findVideos(searchTmp,pageTmp,exactWordSearch);
      else findVideos(searchTmp,pageTmp,exactWordSearch,searchedUser);

      //let showingList = compileList();

      let linksTmp = createPageLinks();

      let headTmo = '';

      if (searchWords.length === 0 && !searchingUser && !ignoredSitesPresent()) {
         if (pageLanguage === 'jp') { headTmo = htmlHeadCompiler(`&#12377;&#12409;&#12390;&#12398;&#21205;&#30011;&#12434;&#34920;&#31034;&#20013; - &#12506;&#12540;&#12472;: ${pageNumber}/${pageTotal}`); }
         else { headTmo = htmlHeadCompiler(`Showing all videos - Page: ${pageNumber}/${pageTotal}`); }
      }
      else {
        if (pageLanguage === 'jp') {
         headTmo = '&#26908;&#32034;&#20013;'; // in middle of search (add at end)

         if (searchWords.length === 0) {
            let userTmmp = '';
            if (searchingUser) userTmmp = `&#12300;${searchedUser}&#12301;&#12373;&#12435;&#12398;`;
            headTmo = userTmmp + '&#12377;&#12409;&#12390;&#12398;&#21205;&#30011;&#12434;' + headTmo;  // all videos
         }
         if (searchWords.length > 0) {
            let userTmmp = '';
            if (searchingUser) userTmmp = `&#12300;${searchedUser}&#12301;&#12373;&#12435;&#12398;&#21205;&#30011;&#12434;`;
            headTmo = userTmmp + `&#12300;${searchTmp.trim()}&#12301;&#12391;` + headTmo; // searching based on search word
         }
         
         //if (searchingUser) headTmo = `${searchedUser}&#12373;&#12435;&#12398;&#21205;&#30011;&#12434;` + headTmo;

         if (ignoredSitesPresent()) {
            // sitesList = [ {'site': 'Youtube',    'isIgnored'
            let tmoo = sitesList.filter(ent => !ent.isIgnored).map(ent => ent.site);
            if (tmoo.length > 0) headTmo = tmoo.join('&#12392;') + '&#12363;&#12425;' + headTmo;
            else headTmo += " from no site (Why would you exclude every site, you dumbass?)";
         }
         
         headTmo = htmlHeadCompiler(headTmo + ` - &#12506;&#12540;&#12472;: ${pageNumber}/${pageTotal}`);

        }

        else {
         headTmo = "Searching";

         if (searchWords.length === 0) headTmo += ' all videos';
         if (!Array.isArray(searchWords) && searchWords.length > 0) headTmo += ` "${searchTmp.trim()}"`;

         if (searchingUser) headTmo += ` by ${searchedUser}`;

         if (ignoredSitesPresent()) {
            // sitesList = [ {'site': 'Youtube',    'isIgnored'
            let tmoo = sitesList.filter(ent => !ent.isIgnored).map(ent => ent.site);
            if (tmoo.length > 0) headTmo += " from " + tmoo.join(', ');
            else headTmo += " from no site (Why would you exclude every site, you dumbass?)";
         }

         headTmo = htmlHeadCompiler(headTmo + ` - Page: ${pageNumber}/${pageTotal}`);
        }
      }

      if (headTmo === '') headTmo = htmlHeadCompiler();

      res.write(headTmo + makeSearchBar(urlValueCheker(quer.query.search),quer.query.preview) + linksTmp  + compileList() + linksTmp + '</body></html>');

      res.end();

      doThis = false;
   }

   // Index page
   if (htmPage === quer.pathname || (htmPage + '/') === quer.pathname || (htmPage + '/index.html') === quer.pathname) {
      res.writeHead(200, {'Content-Type': 'text/html'});

      res.write(htmlHeadCompiler() + htmlStrIndex(quer.pathname) + '</body></html>');

      res.end();

      doThis = false;
   }

   // For everything else
   if (doThis) {
      console.log('Tried to get to: ' +  quer.pathname);
      res.writeHead(404, {'Content-Type': 'text/html'});
      res.end("404 Not Found. Tried to get to: " +  quer.pathname);
   }

   forceGC();
});

srvr.listen(3535);