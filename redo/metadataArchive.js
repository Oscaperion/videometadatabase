/*
   This is here in order to help the match-all run in the older NodeJS version on
     A2 Hosting (v10.24.0). Uncomment if you get errors regarding "matchAll".
     For function "addLinks"
*/
// require('core-js/modules/es.string.match-all');

//const XMLRequest = require("xmlhttprequest").XMLHttpRequest;

const fs = require('fs');
const url = require('url');
const http = require('http');
console.log(__dirname);

/*
   This is the port number where the database can be accessed once it's running. The link
     would be in the following form:
   
   http://localhost:[portNumber]/YTPMV_Database/

*/
const portNumber = 3535;

/*
   This is where the primary JSON files for video entries are located
*/
const jsonLocation = "K:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts2/";
// const jsonLocation = __dirname + "/Videos/";

/*
   This is where the complementary JSON files for e.g. lists of tags and YouTube user IDs
     are located.
*/
const jsonLocationComp = "K:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/";
// const jsonLocationComp = __dirname + "/Others/";

/*
   These are used to process the JSON files that contain the entries for the database.
     The values are supposed to read as a year and a month (YYYYMM) and the files should
     be named like "vids*YYYYMM*.json" (e.g. "vids202301.json") for them to be processed
     correctly. If there are no files for certain months, the code will just ignore those
     months.
*/
// const maxMonth = 202512;
// const minMonth = 200401;

/*
   Determines how many entries are being shown per page.
*/
const videosPerPage = 15;

/*
   Determines how many entries are allowed to be stacked for the page intended for
     individual videos. I try to prevent someone making crazy long playlists.
*/
const limitForVideoPage = 30;

/*
   FOR ONLINE PURPOSES! NO NEED FOR THESE ON LOCAL ENVIRONMENTS
   These are used as part of crude bot prevention measures. Any queries provided
     without these values (&*botCheckName*=*botCheckValue*) will be redirected to a
     placeholder page, which will provide instructions on how to carry on with the query
     for actual visitors. So far this has been surprisingly effective, but if bots ever
     learn to take this into consideration, a more robust measure need to be implemented.
*/
// const botCheckName = "rumour_do_be";
// const botCheckValue = "chio_be_chompi";

/*
   Changes the language for the site. Currently only supports English (en) and
     Japanese (jp).
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

/*
   For getting a string of the date when the current instance of the database was launched.
*/
function getLastUpdated() {
   if (pageLanguage === 'jp') return lastUpdated + ' [&#9633;&#9633;&#9633;&#9633;&#24180;&#9633;&#9633;&#26376;&#9633;&#9633;&#26085;]';
   return lastUpdated + ' [YYYYMMDD]';
}

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
     .id        = An ID of a video that has been deleted or otherwise unavailable through
                  video preview.
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

const youtubeUserList = JSON.parse(fs.readFileSync(jsonLocationComp + 'youtubeUserList.json', 'utf8'));
// const youtubeUserList = JSON.parse(fs.readFileSync(jsonLocationComp + 'youtubeUserList-with-channelNames.json', 'utf8'));

// const niconicoUserList = JSON.parse(fs.readFileSync(jsonLocationComp + 'niconicoUserList-without-channelNames.json', 'utf8'));
const niconicoUserList = JSON.parse(fs.readFileSync(jsonLocationComp + 'niconicoUserList.json', 'utf8'));
// console.log(niconicoUserList);

const sameUserListLoc = jsonLocationComp + 'sameUsers.json';
let sameUserList = [];
try { sameUserList = JSON.parse(fs.readFileSync(sameUserListLoc, 'utf8')); console.log("Same user list present! Loaded!"); } catch (error) { console.log("Same user not present!"); }

const reuploadListLoc = jsonLocationComp + 'reuploads.json';
let reuploadShowing = [];
try { reuploadShowing = JSON.parse(fs.readFileSync(reuploadListLoc, 'utf8')); console.log("Reuploaded videos list present! Loaded!");  } catch (error) { console.log("Reuploaded videos list not present!"); }

const twitterUserLoc = jsonLocationComp + 'twitterUserList.json';
let twitterUserList = [];
try { twitterUserList = JSON.parse(fs.readFileSync(twitterUserLoc, 'utf8')); console.log("Twitter handle list present! Loaded!"); } catch (error) { console.log("Twitter handle list not present!"); }

const headerTextLoc = jsonLocationComp + 'forHeader.txt';
let headerText = fs.readFileSync(headerTextLoc, 'utf8');
const headerTextJpLoc = jsonLocationComp + 'forHeaderJp.txt';
let headerTextJp = fs.readFileSync(headerTextJpLoc, 'utf8');

function getHeaderText() {
   if (pageLanguage === 'jp') return headerTextJp;
   return headerText;
}

/*
   If JSON files for reuploadShowing, twitterUserList, sameUserList or headers are changed,
     they will be reread by the database.
*/
fs.watchFile(reuploadListLoc, (curr,prev) => {
   try {
       console.log("Hoperiino"); 
       reuploadShowing = JSON.parse(fs.readFileSync(reuploadListLoc, 'utf8'));
       // forceGC();
   } catch (error) {
       console.log ("Noperiino");
   }
});

fs.watchFile(twitterUserLoc, (curr,prev) => {
   try {
       console.log("Hoperiino");
       twitterUserList = JSON.parse(fs.readFileSync(twitterUserLoc, 'utf8'));
       // forceGC();
   } catch (error) {
       console.log ("Noperiino");
   }
});

fs.watchFile(sameUserListLoc, (curr,prev) => {
   try {
       console.log("Hoperiino"); 
       sameUserList = JSON.parse(fs.readFileSync(sameUserListLoc, 'utf8'));
       // forceGC();
   } catch (error) {
       console.log ("Noperiino");
   }
});

fs.watchFile(headerTextLoc, (curr,prev) => {
   try {
       console.log("Hoperiino"); 
       headerText = fs.readFileSync(headerTextLoc, 'utf8');
       // forceGC();
   } catch (error) {
       console.log ("Noperiino");
   }
});

fs.watchFile(headerTextJpLoc, (curr,prev) => {
   try {
       console.log("Hoperiino"); 
       headerTextJp = fs.readFileSync(headerTextLocJp, 'utf8');
       // forceGC();
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
   IF YOU NEED TO BE MINDFUL OF MEMORY USAGE, UNCOMMENT THIS BIT AS WELL AS ALL
     "forceGC();" FOUND IN THIS SCRIPT
   https://www.xarg.org/2016/06/forcing-garbage-collection-in-node-js-and-javascript/
*/  /*
function forceGC() {
   if (global.gc) {
      global.gc();
   } else {
      console.warn('No GC hook! Start your program as `node --expose-gc file.js`.');
   }
} */

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

fs.readdir(jsonLocation, (err, files) => {
   if (err) throw err;
   // localeCompare is meant to put the files in a most-to-least-recent order
   files.sort((a, b) => b.localeCompare(a)).forEach(file => {
      console.log(file);
      let jsonFile = jsonLocation + file;
      try {
         parsedVideos.push(...JSON.parse(fs.readFileSync(jsonFile, 'utf8')));
         console.log('Loaded!');
         // forceGC();
      } catch(e) {
         console.log("ERROR! FILE COULDN'T BE READ!");
      }
   });

   console.log('All metadata loaded!');
   console.log("Total number of entries: " + parsedVideos.length);
});

/*
{
   //let numm = 0;
   for (let y = maxMonth; y >= minMonth; y--) {
      let terappi = jsonLocation + 'vids' + y + '.json';
      //let terappi = 'K:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts2/vids' + y + '.json';
      //let terappi = 'vidJson2/vids' + y + '.json';
      console.log('Loading ' + terappi)  ;
      try {
         parsedVideos.push(...JSON.parse(fs.readFileSync(terappi, 'utf8')));

         console.log('Loaded!')  ;

         console.log(terappi)  ;
         forceGC();
      } catch(e) {
         console.log("Oh wait, that doesn't exist");
      }
   }
}  */

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

    if (mins < 60) {
        return mins + ':' + ("" + secs).padStart(2, '0');
    }

    let hours = 0;

    while (mins >= minute) {
        hours++;
        mins = mins - minute;
    }

    return hours + ':' + ("" + mins).padStart(2, '0') + ':' + ("" + secs).padStart(2, '0');
}

/*
   Provides the upload date of a video in "YYYYMMDD HH:MM:SS UTC" format. If an entry does
     not have a "timestamp" value, the script will provide the "upload_date" value in
     "YYYYMMDD ??:??:?? UTC" format.
*/
function getUploadDate(entry) {
   if (!entry.timestamp) return entry.upload_date + " &#63;&#63;:&#63;&#63;:&#63;&#63; UTC";

   let dateTmp = new Date(entry.timestamp * 1000);
   const entYear = dateTmp.getUTCFullYear();
   const entMonth = String(dateTmp.getUTCMonth() + 1).padStart(2, '0');
   const entDay = String(dateTmp.getUTCDate()).padStart(2, '0');
   const entHours = String(dateTmp.getUTCHours()).padStart(2, '0');
   const entMinutes = String(dateTmp.getUTCMinutes()).padStart(2, '0');
   const entSeconds = String(dateTmp.getUTCSeconds()).padStart(2, '0');

   return `${entYear}${entMonth}${entDay} ${entHours}:${entMinutes}:${entSeconds} UTC`;
}

/*
   These are for converting video metadata into more decipherable form.
   parsedVideosId: the index in the parsedVideos array.
*/
function videoEntryFromParsedVideo(parsedVideosId) {
   if (parsedVideos[parsedVideosId]) return videoEntryConverter(parsedVideos[parsedVideosId]);

   return undefined;
}

/*
   videoId: ID of the searched video
   videoSite: The site where we want to find the video (Optional, has to be in form of site's extractor_key)
*/
function videoEntryWithId(videoId, videoSite = null) {
   let vidTmp = parsedVideos.find(vid => (!videoSite && vid.id === videoId) || (!!videoSite && vid.id === videoId && vid.extractor_key === videoSite));

   // if (videoSite && vidTmp) vidTmp = parsedVideos.find(vid => (vid.id === videoId && vid.extractor_key === videoSite));
   if (!vidTmp) return undefined;

   // return videoEntryConverter(vidTmp);
   return vidTmp;
}

function videoEntryConverter(vidEnt) {

   // Helper function to convert tags when requested
   function getConvertedTags() {
      if (!vidEnt.tags) return [];

      return vidEnt.tags.map(tag => {
         if (Number.isInteger(tag)) return tagsList[tag];
         return tag; // Return non-integer tags as-is
      });
   }

   // Helper function for uploader_id
   function getUploaderId() {
      // Look for uId and convert based on the extractor
      if (vidEnt.uId) {
         switch(vidEnt.extractor_key) {
            case "Niconico":
               return niconicoUserList[vidEnt.uId].channelId;
            case "Youtube":
               return youtubeUserList[vidEnt.uId].channelIds;
            default:
               return undefined; // If extractor_key doesn't match known cases
         }
      }
      return vidEnt.uploader_id; // If uId is not present, return existing uploader_id or undefined
   }

   return vidEnt;
}

function getUploaderId(vidEnt) {
   // Look for uId and convert based on the extractor
   if (vidEnt.uId) {
      switch(vidEnt.extractor_key) {
         case "Niconico":
            return niconicoUserList[vidEnt.uId].channelId;
         case "Youtube":
            return youtubeUserList[vidEnt.uId].channelIds;
         default:
            return undefined; // If extractor_key doesn't match known cases
      }
   }
   return vidEnt.uploader_id; // If uId is not present, return existing uploader_id or undefined
}



/*
   In case of separate search words, this optimizes them in two ways:
   1. Gets rid of search words that might already be part of other search words. For
      example, a query with "ant lantern" will be shortened to just "lantern".
   2. Sorts them from longest to shortest. The longer the search word, the less likely
      there will be matches and the database should be able to process them quicker.
*/
function optimizeSearching(searchWord,exactSearch) {
    if (!searchWord || (!Array.isArray(searchWord) && searchWord.trim().length === 0)) {
       searchWords = [];
       return undefined;
    }

    let searchWord_tmp = searchWord;
    
    if (Array.isArray(searchWord_tmp)) {
       searchWord_tmp = searchWord_tmp.join(' ');
    }

    if (exactSearch) {
       let ret = [searchWord_tmp.trim().toLowerCase()];
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

    console.log(tmp2);

    return tmp2.sort((a, b) => b.length - a.length);
}

/*

*/
function isSameUser(searchUserStr,video) {
   let tmpStr = [searchUserStr.trim()];

   if (searchedUploaderHasAlts) {
      tmpStr = uploadersAlts;
   }

   if (video.extractor_key === "Twitter") {
      let twtTmp = twitterUserList.find(ent => ent.handle.includes(video.uploader_id) || ent.id === video.uploader_id);
      if (!twtTmp) return tmpStr.includes(video.uploader_id);
      for (let k = 0; k < tmpStr.length; k++) {
         if (twtTmp.handle.includes(tmpStr[k])) return true;
      }

      return tmpStr.includes(twtTmp.id);
   }

   let upIdTmp = getUploaderId(video);
   if (Array.isArray(upIdTmp)) {
      for (let p = 0; p < tmpStr.length; p++) {
         if (upIdTmp.includes(tmpStr[p])) return true;
      }
      return false;
   }
   
   return tmpStr.includes(upIdTmp);
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
      retStr += compileEntry(foundVids[i]) + breakline + '<hr/>' + breakline;
   }

   return retStr;
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
   if (!searchTmp && !searchUploaderId && !ignoredSitesPresent()) showAllVideos = true;

   if (showAllVideos) {
      pageTotal = Math.ceil(parsedVideos.length / videosPerPage);

      let pageTmp = reqPage;
      if (pageTmp > pageTotal || pageTmp < 1) pageTmp = 1;
      let searchThres = (pageTmp - 1) * videosPerPage;
      pageNumber = pageTmp;

      foundVids = [];

      for (let u = searchThres; u < (searchThres + videosPerPage) && u < parsedVideos.length; u++) {
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
                  if (Object.values(sameUserList[checkTmp]).includes(ent[j].channelIds)) return true;
               }
               return false;
            });
            let tmpArr2 = Object.values(sameUserList[checkTmp]);
            for (let j = 0; j < tmpArr.length; j++) {
               tmpArr2.push(...tmpArr[j]);
            }
            uploadersAlts = tmpArr2;
         }
      }

      let startTmp1 = 0;
      let startTmp2 = videosPerPage;
      let foundVidAmount = 0;
      let foundMore = false;
      let foundVidAmoun2 = 0;
      let alreadyEnough = false;

      let vidTmp_ = parsedVideos.map((val, ind) => ind).filter(ind => {
         let val = parsedVideos[ind];
         {
            let tmp2 = sitesList.findIndex(siteEnt => siteEnt.site === val.extractor_key);
            if (tmp2 === -1) tmp2 = sitesList.length - 1;
            if (sitesList[tmp2].isIgnored) return false;
         }
         if (searchUploaderToo && !isSameUser(searchUploaderId,val)) return false;
         return hasSearchWords(searchTmp,val);
      });

      pageTotal = Math.ceil(vidTmp_.length / videosPerPage);
      let pageTmp = reqPage;
      if (pageTmp > pageTotal || pageTmp < 1) pageTmp = 1;
      pageNumber = pageTmp;

      let startVidInd = (pageTmp - 1) * videosPerPage;
      let endVidInd   = pageTmp * videosPerPage;
      if (endVidInd > (pageTotal * videosPerPage)) endVidInd = vidTmp_.length;

      foundVids = vidTmp_.slice(startVidInd,endVidInd);
   }
  }
  // forceGC();
}

function hasSearchWords(searchWord,video) {
   if (!searchWord) return true;

   let tagsTmp = videoTags2(video).join(" ").toLowerCase();
   let uploaderIdTmp = getUploaderId(video);
   if (video.extractor_key === "Youtube" && Array.isArray(uploaderIdTmp)) uploaderIdTmp = uploaderIdTmp.join(" ");
   if (!uploaderIdTmp) uploaderIdTmp = "";

   return searchWord.every(srcWrd => {
         if ((video.id && !Array.isArray(video.id) && video.id.toLowerCase().includes(srcWrd)) ||
             (video.id && Array.isArray(video.id)  && video.id.join(" ").toLowerCase().includes(srcWrd)) ||
             (video.title && video.title.toLowerCase().includes(srcWrd)) ||
             (video.description && video.description.toLowerCase().includes(srcWrd)) ||
             tagsTmp.includes(srcWrd) ||
             (video.uploader && video.uploader.toLowerCase().includes(srcWrd)) ||
             (video.extractor_key === "Youtube" && !!video.uId && !!youtubeUserList[video.uId].channelNames && youtubeUserList[video.uId].channelNames.join(' ').toLowerCase().includes(srcWrd)) ||
             (video.extractor_key === "Niconico" && !!video.uId && !!niconicoUserList[video.uId].channelNames && niconicoUserList[video.uId].channelNames.join(' ').toLowerCase().includes(srcWrd)) ||
             uploaderIdTmp.toLowerCase().includes(srcWrd) ||
             getUploadDate(video).includes(srcWrd)
             ) return true;

         return false;
      });
}

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
         idTmp = youtubeUserList[userId].channelIds;
         multipleId = true;
      }

      if (!multipleId) return htmlLinkCompiler(userAddressCompiler(idTmp,site),(userName + ' [' + htmlBlockCompiler("code",idTmp) + ']')) + " &#8887; " + htmlLinkCompiler("results.html?uploader_id=" + userId + langTmp /* + `&${botCheckName}=${botCheckValue}` */ ,htmlBlockCompiler("code",searchUploaderStr),false);

      let retStr = htmlLinkCompiler(userAddressCompiler(idTmp[0],site),(userName + ' [' + htmlBlockCompiler("code",idTmp[0]) + ']'));
      for (let j = 1; j < idTmp.length; j++) {
         retStr += ' ' + htmlLinkCompiler(userAddressCompiler(idTmp[j],site),('[' + htmlBlockCompiler("code",idTmp[j]) + ']'));
      }
      retStr += " &#8887; " + htmlLinkCompiler("results.html?uploader_id=" + idTmp[idTmp.length - 1] + langTmp /* + `&${botCheckName}=${botCheckValue}` */,htmlBlockCompiler("code",searchUploaderStr),false);

      return retStr;
   }
   if (site === "Twitter" || site === "Niconico" || site === "BiliBili") {
      return htmlLinkCompiler(userAddressCompiler(userId,site),(userName + ' [' + htmlBlockCompiler("code",userId) + ']')) + " &#8887; " +  htmlLinkCompiler("results.html?uploader_id=" + userId + langTmp /* + `&${botCheckName}=${botCheckValue}` */ ,htmlBlockCompiler("code",searchUploaderStr),false);
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

function videoTags(vidInd) {
   if (!parsedVideos[vidInd].tags) return [];

   return parsedVideos[vidInd].tags.map(tag => {
         if (Number.isInteger(tag)) return tagsList[tag];
         return tag;
      });
}


function videoTags2(vidEnt) {
   if (!vidEnt.tags) return [];

   return vidEnt.tags.map(tag => {
         if (Number.isInteger(tag)) return tagsList[tag];
         return tag;
      });
}

function videoLinkCompiler(id,site) {
   if (site === "Twitter")  return htmlLinkCompiler('https://twitter.com/i/status/' + id);
   if (site === "Youtube")  return htmlLinkCompiler('https://www.youtube.com/watch?v=' + id);
   if (site === "Niconico") return htmlLinkCompiler('https://www.nicovideo.jp/watch/' + id);
   if (site === "BiliBili") {
      let userUrl = 'https://www.bilibili.com/video/' + id[0];
      if (id.length === 2) return htmlLinkCompiler(userUrl + '/', userUrl) + ' / ' + htmlLinkCompiler('https://www.bilibili.com/video/' + id[1] + '/',id[1]);
      else if (id.length === 1) return htmlLinkCompiler(userUrl + '/', userUrl);
   }
}

// These will recognize Niconico ID and mylist/ values in descriptions.
const smIdRegex = /([sn]m\d+)/g; // Covers both sm and nm IDs
const mylistRegex = /(mylist\/\d+)/g; 
const smIdRegexNeg = /([=\/][sn]m\d+)/g;
const mylistRegexNeg = /([=\/]mylist\/\d+)/g;

function addLinks(descri) {
   let checkHttp1 = 'http';
   let checkHttp2 = [' '];

   let descr = descri.split("\n").join(" <br/>");

   let retArr = [];

   let tmpHt = descr.indexOf(checkHttp1);


   if (tmpHt > -1) {

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

      retArr.push(editLink(descr.substring(0,tmppp)));

      descr = descr.substring(tmppp);

      tmpHt = descr.indexOf(checkHttp1);

     }
     retArr.push(descr);
     retArr = retArr.join("");
   } else retArr = descr;
   
   // This is for identifying any video and mylist IDs related to Niconico videos, as well as trying to weed out full URLs

   let smMatches = Array.from(retArr.matchAll(smIdRegex), (m) => ({
      id: m[0],
      strIndex: m.index
    }));
   let smMatchesNeg = Array.from(retArr.matchAll(smIdRegexNeg), (m) => (
      m.index + 1
    ));

   let noURLs = false;
   if (smMatchesNeg) noURLs = true;

   let indexOffSet = 0;
   
   let linkChek1 = ['<a','</a>'];
   let linkChek2 = retArr.indexOf(linkChek1[0]);
   let linkChek3 = [];
   while (linkChek2 > -1) {
      let linkChek4 = retArr.indexOf(linkChek1[1],linkChek2);
      
      linkChek3.push(linkChek2);
      linkChek3.push(linkChek4);
      
      linkChek2 = retArr.indexOf(linkChek1[0],linkChek4);
   }

   for (let i = 0; i < smMatches.length; i++) {
      if (smMatchesNeg.includes(smMatches[i].strIndex)) continue;

      let checkTmp = 0;
      let checkTmp2 = true;
      while ((checkTmp < linkChek3.length) && checkTmp2) {
         if (smMatches[i].strIndex > linkChek3[checkTmp] && smMatches[i].strIndex < linkChek3[checkTmp + 1]) {
            // console.log("Foapofifsf");
            checkTmp2 = false;
            continue;
         }
         // console.log("Foapofi");
         checkTmp = checkTmp + 2;
      }
      if (!checkTmp2) continue;

      let newLink = editLink('https://www.nicovideo.jp/watch/' + smMatches[i].id,true);
      let substringTmp = smMatches[i].strIndex + smMatches[i].id.length + indexOffSet;

      retArr = retArr.substring(0,(smMatches[i].strIndex + indexOffSet)) + newLink + retArr.substring(substringTmp);

      indexOffSet = indexOffSet + newLink.length - smMatches[i].id.length;
   }
   
   indexOffSet = 0;

   let mylistMatches = Array.from(retArr.matchAll(mylistRegex), (m) => ({
      id: m[0],
      strIndex: m.index
    }));
   let mylistMatchesNeg = Array.from(retArr.matchAll(mylistRegexNeg), (m) => (
      m.index + 1
    ));
    
   for (let j = 0; j < mylistMatches.length; j++) {
      if (mylistMatchesNeg.includes(mylistMatches[j].strIndex)) continue;

      let newLink = htmlLinkCompiler('https://www.nicovideo.jp/' + mylistMatches[j].id, mylistMatches[j].id);
      let substringTmp = mylistMatches[j].strIndex + mylistMatches[j].id.length + indexOffSet;

      retArr = retArr.substring(0,(mylistMatches[j].strIndex + indexOffSet)) + newLink + retArr.substring(substringTmp);

      indexOffSet = indexOffSet + newLink.length - mylistMatches[j].id.length;
   }
   
   return retArr;
}

function editLink(linkTmp, onlyShowId = false) {
   let tmpp1 = linkTmp;

   let youTubeChecking   = ["youtu.be/","youtube.com/watch?v=","youtube.com/shorts/"];
   let nicovideoChecking = ["nicovideo.jp/watch/","nico.ms/"];

   let youtubeIdLength = 11;

   let langStr = "";
   let searchIdStr = "[Search ID]";
   let videoMetaStr = "[Video Metadata Page]";

   if (pageLanguage === 'jp') {
      langStr = "&lang=jp";                       
      searchIdStr = "[ID&#12434;&#26908;&#32034;]";
      videoMetaStr = "[&#21205;&#30011;&#12398;&#12513;&#12479;&#12487;&#12540;&#12479;]";
   }

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

      if (tmpLinkerino2.indexOf(" ") > 0) tmpLinkerino4 = tmpLinkerino2.indexOf(" ");
      if (tmpLinkerino2.indexOf("?") > 0 && (tmpLinkerino4 > tmpLinkerino2.indexOf("?") || tmpLinkerino4 === 0)) tmpLinkerino4 = tmpLinkerino2.indexOf("?");
      if (tmpLinkerino2.indexOf(")") > 0 && (tmpLinkerino4 > tmpLinkerino2.indexOf(")") || tmpLinkerino4 === 0)) tmpLinkerino4 = tmpLinkerino2.indexOf(")");
      if (tmpLinkerino2.indexOf(".") > 0 && (tmpLinkerino4 > tmpLinkerino2.indexOf(")") || tmpLinkerino4 === 0)) tmpLinkerino4 = tmpLinkerino2.indexOf(".");
      if (tmpLinkerino4 === 0) tmpLinkerino4 = tmpLinkerino2.length;

      let extractedId = tmpLinkerino2.substring(0,tmpLinkerino4);

      // Checking if there is a video with this ID
      let matchingVid = parsedVideos.find(vid => vid.id === extractedId);
      if (matchingVid) {
         let uploaderName = matchingVid.uploader;
         if (!uploaderName && matchingVid.extractor_key === "Youtube") uploaderName = youtubeUserList[matchingVid.uId].channelNames[0];
         if (!uploaderName && matchingVid.extractor_key === "Niconico") uploaderName = niconicoUserList[matchingVid.uId].channelNames[0];
         let linkStr = matchingVid.title + ' by ' + uploaderName;
         if (pageLanguage === 'jp') linkStr = uploaderName + "&#27663;&#12395;&#12424;&#12427;&#12302;" + matchingVid.title + "&#12303;";

         return htmlLinkCompiler(linkTmp, linkStr) + " "
                + htmlLinkCompiler('video.html?id=' + encodeURIComponent(extractedId) + langStr /* + `&${botCheckName}=${botCheckValue}` */, htmlBlockCompiler("code",videoMetaStr),false) + " "
                + htmlLinkCompiler('results.html?search=' + encodeURIComponent(extractedId) + langStr /* + `&${botCheckName}=${botCheckValue}` */, htmlBlockCompiler("code",searchIdStr),false);
      }

      return htmlLinkCompiler(linkTmp) + " "
             + htmlLinkCompiler('results.html?search=' + encodeURIComponent(extractedId) + langStr /* + `&${botCheckName}=${botCheckValue}` */, htmlBlockCompiler("code",searchIdStr),false);
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

      let checkerCh = tmpp1.charAt(tmpLinkerino3 + youtubeIdLength);
      let linkTmp2 = linkTmp;
      let extractedId = tmpLinkerino2;
      let linkStr = linkTmp;
      if (onlyShowId) linkStr = extractedId;
      let metadatStr = "";
      {
        let matchingVid = parsedVideos.find(vid => vid.id === extractedId);
        if (matchingVid) {
           let uploaderName = matchingVid.uploader;
           if (!uploaderName && matchingVid.extractor_key === "Youtube") uploaderName = youtubeUserList[matchingVid.uId].channelNames[0];
           linkStr =  matchingVid.title + ' by ' + uploaderName;
           if (pageLanguage === 'jp')  linkStr = uploaderName + "&#27663;&#12395;&#12424;&#12427;&#12302;" + matchingVid.title + "&#12303;";
           metadatStr = htmlLinkCompiler('video.html?id=' + encodeURIComponent(extractedId) + langStr /* + `&${botCheckName}=${botCheckValue}` */,videoMetaStr) ;
           // metadatStr +=
        }
      }

      if (checkerCh !== '&' && checkerCh !== '?') {
      return htmlLinkCompiler(tmpp1.substring(0,tmpLinkerino3 + youtubeIdLength), linkStr) + " "
             + htmlBlockCompiler("code",metadatStr) + " "
             + htmlLinkCompiler('results.html?search=' + encodeURIComponent(extractedId) + langStr /* + `&${botCheckName}=${botCheckValue}` */, htmlBlockCompiler("code",searchIdStr),false) + " " + tmpp1.substring(tmpp1.indexOf(youTubeChecking[tmpLinkerino]) + youTubeChecking[tmpLinkerino].length + youtubeIdLength);
      }

      return htmlLinkCompiler(linkTmp, linkStr) + " " + htmlBlockCompiler("code",metadatStr) + " " + htmlLinkCompiler('results.html?search=' + encodeURIComponent(tmpLinkerino2) + langStr /* + `&${botCheckName}=${botCheckValue}` */, htmlBlockCompiler("code",searchIdStr),false);
   }
   return htmlLinkCompiler(linkTmp);
}

// This is what ChatGPT suggested for conversion, testing it here
function convertToHTMLEntities(str) {
    if (!str) return str;

    return str.replace(/[\u00A0-\u9999]/g, function(i) {
       return '&#'+i.charCodeAt(0)+';';
    });
}

function editDescription(ogDesc,descExtr) {
   if (!ogDesc || ogDesc.trim().length === 0) return putDescriptionInBox(htmlBlockCompiler("code","[No description]"));

   let descTmp = ogDesc.trim();

   if (!descTmp.includes('</a>')) {
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
   return htmlBlockCompiler("div",convertToHTMLEntities(descr),'class="videoDescription"');
}

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

   if ((siteKey === "Youtube" || siteKey === "Niconico") && checkuId !== undefined) {
      if (siteKey === "Youtube") {
         let userIdss = youtubeUserList[checkuId].channelIds;
         for (let i = 0; i < userIdss.length; i++) {
            if (valueArr.includes(userIdss[i])) return true;
         }
      } if (siteKey === "Niconico") {
         return valueArr.includes(niconicoUserList[checkuId].channelId);
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
            let userIdss = youtubeUserList[checkuId].channelIds;
            for (let i = 0; i < userIdss.length; i++) {
               if (checkArr.includes(userIdss[i])) {
                 userArr = j;
                 break;
               }
            }
         } if (siteKey === "Niconico" && checkArr.includes(niconicoUserList[checkuId].channelId)) {
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
   for (let h = 0; h < vals.length; h++) {
      if (checkUploaderId && vals[h] === checkUploaderId) continue;
      if (checkuId && siteKey === "Youtube" && youtubeUserList[checkuId].channelIds.includes(vals[h])) continue;
      // console.log(checkuId + " - loafk");
      if (checkuId && siteKey === "Niconico" && niconicoUserList[checkuId].channelId === vals[h]) continue;

      let tmpLink = 'results.html?uploader_id=' + vals[h];
      if (showVidPrev) tmpLink += '&preview=true';
      if (pageLanguage === "jp") tmpLink += '&lang=jp';
      // tmpLink += '&' + botCheckName + '=' + botCheckValue;
      
      retStr += " " + htmlLinkCompiler(tmpLink,"[" + vals[h] + "]",false);
   }

   return htmlBlockCompiler("code",retStr);
}

/*
   Creates a <div> segment of a singular video entry.
*/
function compileEntry(videoInd) {
   let video = parsedVideos[videoInd];
                                                                       /*
   console.log(video.uId + " - arfj");
   console.log(niconicoUserList[video.uId] + " - arf");
   console.log(niconicoUserList);
   console.log(niconicoUserList[video.uId].channelNames + " - sad"); */
                                    /*
   console.log(niconicoUserList[0]);
   console.log(niconicoUserList[0].channelNames + " - sad");
   console.log(niconicoUserList[0].channelId + " - sad");
   console.log(niconicoUserList); */
                                                          /*
   console.log(video);
   let daffdaf = video.uId;
   console.log(niconicoUserList[daffdaf].channelId + " - sad");
   console.log(niconicoUserList[58369].channelId + " - sads");
   console.log(niconicoUserList.length + " - sads");    */


   let searchUploaderStr = '[Search uploader]';
   if (pageLanguage === 'jp') searchUploaderStr = '[&#25237;&#31295;&#32773;&#12434;&#26908;&#32034;]';

   let userAddress = "";
   if (video.uploader_url) userAddress = htmlLinkCompiler(video.uploader_url,video.uploader + ' [' + htmlBlockCompiler("code",video.uploader_id) + ']') + " &#8887; " + htmlLinkCompiler(`results.html?uploader_id=${video.uploader_id}` /* + `&${botCheckName}=${botCheckValue}` */,htmlBlockCompiler("code",searchUploaderStr),false);
   else {
      if ((video.extractor_key === "Youtube" || video.extractor_key === "Niconico") && video.uId !== undefined) {

         if (video.extractor_key === "Youtube") {
             // tmpConsole = video;
             //if (video.uId === undefined) console.log(video);
             if (!!youtubeUserList[video.uId].channelNames) userAddress = userLinkCompiler(convertToHTMLEntities(youtubeUserList[video.uId].channelNames[0]),video.uId,video.extractor_key);
             else { userAddress = userLinkCompiler(convertToHTMLEntities(video.uploader),video.uId,video.extractor_key); }
         }
         if (video.extractor_key === "Niconico") {
             if (!!niconicoUserList[video.uId].channelNames) {  userAddress = userLinkCompiler(convertToHTMLEntities(niconicoUserList[video.uId].channelNames[0]),niconicoUserList[video.uId].channelId,video.extractor_key); }
             else { userAddress = userLinkCompiler(convertToHTMLEntities(video.uploader),niconicoUserList[video.uId].channelId,video.extractor_key); }
         }
      }
      else {
         // console.log(video);
         userAddress = userLinkCompiler(convertToHTMLEntities(video.uploader),video.uploader_id,video.extractor_key);
      }
   }

   let titleTmp = videoLinkCompiler(video.id, video.extractor_key) + ' (' + formatDuration(video.duration) + ')';
   if (video.extractor_key !== "Twitter") {
      titleTmp = htmlBlockCompiler("b",convertToHTMLEntities(video.title)) + ' (' + formatDuration(video.duration) + ')<br/>' + breakline;
      if (video.webpage_url) titleTmp += htmlBlockCompiler("code",htmlLinkCompiler(video.webpage_url));
      else titleTmp += htmlBlockCompiler("code",videoLinkCompiler(video.id,video.extractor_key));

      let idenTmp = video.id;
      if (Array.isArray(video.id)) idenTmp = video.id[0];
      let linkDescForVid = "[Video Metadata Page]";
      let singleVideoUrl = "video.html?id=" + idenTmp;
      // let singleVideoUrl = "video.html?id=";
      // if (Array.isArray(video.id)) singleVideoUrl += video.id[0];
      // else singleVideoUrl += video.id;
      if (pageLanguage === "jp") {
         linkDescForVid = "[&#21205;&#30011;&#12398;&#12513;&#12479;&#12487;&#12540;&#12479;]";
         singleVideoUrl += "&lang=jp";
      }
      // singleVideoUrl += '&' + botCheckName + '=' + botCheckValue;
      titleTmp += htmlBlockCompiler("code"," &#8887; " + htmlLinkCompiler(singleVideoUrl,linkDescForVid, false));
      
      // Link to provide a JSON file of the video metadata
      let jsonDownloadText = "[JSON File]";
      if (pageLanguage === "jp") jsonDownloadText = "[JSON&#12501;&#12449;&#12452;&#12523;]";
      titleTmp += " " + htmlBlockCompiler("code", htmlLinkCompiler("json/" + video.extractor_key.toLowerCase() + "-" + idenTmp + ".json",jsonDownloadText,true));
   }

   if (pageLanguage === "jp") {
      userAddress = "<br/><br/>" + breakline + "&#25237;&#31295;&#32773;: " + userAddress + breakline;
   } else {
      userAddress = "<br/><br/>" + breakline + "Uploader: " + userAddress + breakline;
   }

   if (checkForOtherChannels(video.extractor_key,video.uploader_id,video.uId)) userAddress += ' &#8212; ' + addOtherChannels(video.extractor_key,video.uploader_id,video.uId) + breakline;

   userAddress += '<br/>';  

   if (video.extractor_key === "Youtube" && !!youtubeUserList[video.uId].channelNames && youtubeUserList[video.uId].channelNames.length > 1) {
      userAddress += '&nbsp;&nbsp;&#10551;&nbsp;<code>';
      if (pageLanguage === "jp") {
         userAddress += '&#26087;&#12495;&#12531;&#12489;&#12523;&#21517;: ';
      } else {
         userAddress += 'Also known as: ';
      }
      
      userAddress += youtubeUserList[video.uId].channelNames.slice(1).join(', ') + '</code><br/><br/>';
   }
   
   if (video.extractor_key === "Niconico" && !!niconicoUserList[video.uId].channelNames && niconicoUserList[video.uId].channelNames.length > 1) {
      userAddress += '&nbsp;&nbsp;&#10551;&nbsp;<code>';
      if (pageLanguage === "jp") {
         userAddress += '&#26087;&#12495;&#12531;&#12489;&#12523;&#21517;: ';
      } else {
         userAddress += 'Also known as: ';
      }
      
      userAddress += niconicoUserList[video.uId].channelNames.slice(1).join(', ') + '</code><br/><br/>';
   }

   // let releaseDate = "Release date: " + video.upload_date + '<br/><br/>' + breakline;
   let releaseDate = "Release date: " + getUploadDate(video) + '<br/><br/>' + breakline;
   if (pageLanguage === "jp") {
     // releaseDate = "&#20844;&#38283;&#26085;: " + video.upload_date + '<br/><br/>' + breakline;
     releaseDate = "&#20844;&#38283;&#26085;: " + getUploadDate(video) + '<br/><br/>' + breakline;
   }

   let descTmp = editDescription(video.description,video.extractor_key) + '<br/>' + breakline;

   let tagsTmp = htmlBlockCompiler("code",urlizeTags(videoTags(videoInd)));

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
         strRet += " " + htmlLinkCompiler("results.html?" + switchLister(1,tagsArray[p]),convertToHTMLEntities(tagsArray[p]),false);
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
       if (pageLanguage === 'jp') tmpStr += "<code><b>&#27880;&#24847;:</b> " + 
          htmlLinkCompiler('video.html?id=' + encodeURIComponent(tmpId) + `&lang=jp` /* + `&${botCheckName}=${botCheckValue}` */,tmpId) +
          `(${tmpSite})&#12363;&#12425;&#12398;&#21205;&#30011;&#12503;&#12524;&#12499;&#12517;&#12540;&#12391;&#12377;&#12290;</code><br/><br/>`;
       else tmpStr += // `<code><b>NOTE:</b> The following video preview is from ${tmpId} (${tmpSite})</code><br/><br/>`;
          "<code><b>NOTE:</b> The following video preview is from " +
          htmlLinkCompiler('video.html?id=' + encodeURIComponent(tmpId) /* + `&${botCheckName}=${botCheckValue}` */, tmpId) +
          ` (${tmpSite})</code><br/><br/>`;

    }

    if (tmpSite === 'Youtube')     return tmpStr  + createVideoPreviewYoutube(tmpId) + '<br/><br/>' + breakline;
    if (tmpSite === 'Niconico')    return tmpStr  + createVideoPreviewNiconico(tmpId) + '<br/><br/>' + breakline;
    if (tmpSite === 'Twitter')     return tmpStr  + createVideoPreviewTwitter(tmpId) + breakline;
    if (tmpSite === 'Soundcloud')  return tmpStr  + createAudioPreviewSoundcloud(tmpId) + '<br/><br/>' + breakline;
    if (tmpSite === 'Vimeo')       return tmpStr  + createVideoPreviewVimeo(tmpId) + '<br/><br/>' + breakline;
    if (tmpSite === 'Kakao')       return tmpStr  + createVideoPreviewKakao(tmpId) + '<br/><br/>' + breakline;
    if (tmpSite === 'Dailymotion') return tmpStr  + createVideoPreviewDailymotion(tmpId) + '<br/><br/>' + breakline;
    // Autoplays the video as of now, so I've decided to disable this until I figure out how to stop it from doing that
    // if (tmpSite === 'BiliBili') return tmpStr + createVideoPreviewBilibili(tmpId) + '<br/><br/>' + br;
    return '';
}

// CURRENTLY NOT IN USE!!
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
         /*
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
}       */

// Creates the metadata header and part of the top of the page
function htmlHeadCompiler(htmlTitle = null) {

   let htmlStrHead1 = `<!DOCTYPE html>
<html>

<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<style>

body {
   background-color: #292929;
   color: white;
}

a {
   text-decoration: none;
}

/* unvisited link */
a:link {
   color: #788BFF;
}

/* visited link */
a:visited {
  color: #9BB1FF;
}

/* mouse over link */
a:hover {
  color: #BFD7FF;
}

/* selected link */
a:active {
  color: #E2FDFF;
}


/* For description */
.videoDescription {
   background-color: #3C3C3C;
   /* These two together make it 640px in width */
   max-width: 620px;
   padding: 10px;
   
   border-radius: 15px;
   
   word-wrap: break-word;   
   overflow-wrap: break-word; 
   white-space: normal; 
}

</style>` + breakline;
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

// Creates a set of links based on the current page
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

   // retStr.push(`${botCheckName}=${botCheckValue}`);

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
<input type="checkbox" id="exactSearch" name="exactSearch" value="true"`;
   if (exactWordSearch) retStr += ' checked="yes"';
   retStr += `><label for="exactSearch">&nbsp;${searchText3}</label> &nbsp;&#124; ${prevTxt2}
<br/><br/>
${searchText4}` /* + `<input type="hidden" name="${botCheckName}" value="${botCheckValue}" />` */ + breakline;

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
   // htmlStrIndex += '<input type="hidden" name="' + botCheckName + '" value="' + botCheckValue + '" />' + breakline;
   htmlStrIndex += '</form><br/>' + breakline;

   return htmlBlockCompiler("div",htmlStrIndex);
}

function urlValueCheker(urlValue) {
   if (!urlValue) return "";
   
   let isArray = Array.isArray(urlValue);
   
   if (isArray) return urlValue[0].trim();
   
   return urlValue.trim();
}

function checkUserInputs(userStr) {
   return userStr
       .replace(/&/g, "&amp;")
       .replace(/</g, "&lt;")
       .replace(/>/g, "&gt;")
       .replace(/{/g, "&lbrace;")
       .replace(/}/g, "&rbrace;")
       .replace(/"/g, "&quot;")
       .replace(/'/g, "&#039;");
}

function getJson(videoId, videoExtractorKey) {
//function getJson(vidEnt) {
   console.log(videoId);
   let videoTmp = parsedVideos.find(vid => (vid.id === videoId || vid.id.includes(videoId)) && vid.extractor_key.toLowerCase() === videoExtractorKey.toLowerCase());
   // let videoTmp = vidEnt;

   if (!videoTmp) return undefined;

   let uploaderIdTmp = (() => {
      if (videoTmp.uId === 0 || !!videoTmp.uId) {
         switch(videoTmp.extractor_key) {
            case "Niconico":
               return niconicoUserList[videoTmp.uId].channelId;
            case "Youtube":
               return youtubeUserList[videoTmp.uId].channelIds;
            default:
               return undefined; // If extractor_key doesn't match known cases
         }
      }
      return videoTmp.uploader_id; // If uId is not present, return existing uploader_id or undefined
   })();    /*
   let uploaderIdTmp = videoTmp.uploader_id;

   if (!!videoTmp.uId) {
      switch(videoTmp.extractor_key) {
         case "Niconico":
            return niconicoUserList[videoTmp.uId];
         case "Youtube":
            return youtubeUserList[videoTmp.uId];
         default:
            return undefined; // If extractor_key doesn't match known cases
      }
   }      */

   if (!uploaderIdTmp) uploaderIdTmp = null;

   let tagsTmp = (() => {
      if (!videoTmp.tags) return [];

      return videoTmp.tags.map(tag => {
         if (Number.isInteger(tag)) return tagsList[tag];
         return tag; // Return non-integer tags as-is
      });
   })();

   let upload_dateTmp = getUploadDate(videoTmp).substring(0,8);
   
   let webpageTmp = videoTmp.webpage_url;
   
   if (!webpageTmp) {
      switch(videoTmp.extractor_key) {
         case "Niconico":
            webpageTmp = "https://www.nicovideo.jp/watch/" + videoTmp.id;
            break;
         case "Youtube":
            webpageTmp = "https://www.youtube.com/watch?v=" + videoTmp.id;
            break;
         case "BiliBili":
            webpageTmp = videoTmp.id.map(iden => "https://www.bilibili.com/video/" + iden + "/");
            break;
         case "Twitter":
            webpageTmp = "https://twitter.com/" + videoTmp.uploader_id + "/status/" + videoTmp.id;
            break;
         default:
            webpageTmp = null; // If extractor_key doesn't match known cases
      }
   }
   
   let uploaderUrlTmp = videoTmp.uploader_url;

   if (!uploaderUrlTmp) {
      switch(videoTmp.extractor_key) {
         case "Niconico":
            uploaderUrlTmp = "https://www.nicovideo.jp/user/" + uploaderIdTmp;
            break;
         case "Youtube":
            uploaderUrlTmp = uploaderIdTmp.map(uploId => {
                  if (uploId.charAt(0) === "@" || uploId.substring(0,2) === "c/") return "https://www.youtube.com/" + uploId;
                  if (uploId.length === 24 && uploId.substring(0,2) === "UC") return "https://www.youtube.com/channel/" + uploId;
                  return "https://www.youtube.com/user/" + uploId;
              });
            break;
         case "BiliBili":
            uploaderUrlTmp = "https://space.bilibili.com/" + uploaderIdTmp;
            break;
         case "Twitter":
            uploaderUrlTmp = ["https://twitter.com/" + videoTmp.uploader_id];
            let twitCheck = twitterUserList.findIndex(ent => ent.handle.includes(videoTmp.uploader_id));
            if (twitCheck >= 0) uploaderUrlTmp.push("https://twitter.com/i/user/" + twitterUserList[twitCheck].id);
            break;
         default:
            uploaderUrlTmp = null; // If extractor_key doesn't match known cases
      }
   }


   let jsonTmp = {
      "id":videoTmp.id,
      "title":videoTmp.title,
      "upload_date":upload_dateTmp,
      "uploader":videoTmp.uploader,
      "uploader_id": uploaderIdTmp,
      "duration": videoTmp.duration,
      "description": videoTmp.description,
      "webpage_url": webpageTmp,
      "uploader_url": uploaderUrlTmp,
      "tags":tagsTmp
   };

   if (!!videoTmp.timestamp) jsonTmp["timestamp"] = videoTmp.timestamp;
   
   jsonTmp["extractor_key"] = videoTmp.extractor_key;
   
   jsonTmp["_json_source"] = "YTPMV Metadata Archive";
   
   return jsonTmp;
}


// sitesList = [ {'site': 'Youtube',    'isIgnored':true},
let srvr = http.createServer(function (req, res) {

   // console.log(parsedVideos);
   // console.log(videoEntryWithId("sm44501923"));
   // console.log(videoEntryWithId("sm44501923")._tags);
    // console.log(getJson("9_wU0qhEPR8","Youtube"));
    //console.log(parsedVideos[10]);

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

   let doThis = true;

   /*
      This is for the bot mitigation page
   */  
   /*
   let botCheckTmp = (urlValueCheker(quer.query[botCheckName]) === botCheckValue);
   if (!botCheckTmp && (htmPage + '/results.html') === quer.pathname) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      let excepTmp = htmlHeadCompiler("Search bot prevention");
      excepTmp += htmlBlockCompiler("div",`<b>Search bot prevention</b>
<br/><br/>
This page is here to mitigate the load caused by search bots. ` + htmlLinkCompiler("results.html?" + Object.entries(quer.query).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join("&")  + `&${botCheckName}=${botCheckValue}`, "Click here",false) + " to complete your query");

      res.write(excepTmp + '</body></html>');

      res.end();

      doThis = false;
   }

   if (!botCheckTmp && (htmPage + '/video.html') === quer.pathname) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      let excepTmp = htmlHeadCompiler("Search bot prevention");
      excepTmp += htmlBlockCompiler("div",`<b>Search bot prevention</b>
<br/><br/>
This page is here to mitigate the load caused by search bots. ` + htmlLinkCompiler("video.html?" + Object.entries(quer.query).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join("&") + `&${botCheckName}=${botCheckValue}`, "Click here",false) + " to complete your query");

      res.write(excepTmp + '</body></html>');

      res.end();

      doThis = false;
   }  */

   // Individual entry page
   if (/* botCheckTmp && */ (htmPage + '/video.html') === quer.pathname) {
      res.writeHead(200, {'Content-Type': 'text/html'});

      let queryValues = quer.query;
      
      let listTitle = urlValueCheker(queryValues.title);
      
      let prevTxt2 = "";

      if (listTitle !== "") prevTxt2 = htmlBlockCompiler("h3",convertToHTMLEntities(checkUserInputs(listTitle))) + "<hr/>" + breakline;

      let changeLangStr = '&#26085;&#26412;&#35486;&#12395;&#20999;&#12426;&#26367;&#12360;&#12427;';
      if (pageLanguage === 'jp') changeLangStr = 'Change to English';
      
      if (queryValues["lang"] === 'jp') delete queryValues["lang"]; // queryValues["lang"] = 'en';
      else queryValues["lang"] = 'jp';
      
      prevTxt2 += htmlLinkCompiler("video.html?" + Object.entries(queryValues).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join("&"), changeLangStr, false) + '&nbsp;&#124;' + breakline;

      let boolTmp = showVidPrev;

      queryValues["lang"] = pageLanguage;
      if (queryValues["lang"] === 'en') delete queryValues["lang"];

      if (queryValues["preview"]) queryValues["preview"] = '' + !boolTmp;
      else queryValues["preview"] = 'true';
      //Object.entries(quer.query).map(([key, value]) => `${key}=${value}`)

      let prevTxt1 = "Show video previews";
      if (!boolTmp && pageLanguage === "jp") prevTxt1 = "&#21205;&#30011;&#12503;&#12524;&#12499;&#12517;&#12540;ON";
      if (boolTmp  && pageLanguage === "en") prevTxt1 = "Hide video previews";
      if (boolTmp  && pageLanguage === "jp") prevTxt1 = "&#21205;&#30011;&#12503;&#12524;&#12499;&#12517;&#12540;OFF";
      prevTxt2 += htmlLinkCompiler("video.html?" + Object.entries(queryValues).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join("&"), prevTxt1, false);

      let vidId = quer.query.id;
      if (!vidId) vidId = '';
      if (!Array.isArray(vidId) && vidId.includes(',')) vidId = vidId.split(',');
      if (!Array.isArray(vidId)) vidId = [vidId.trim()];

      let txtHtml = prevTxt2 + breakline + '<hr/>' + breakline;

      if (vidId[0] === '') {
         txtHtml = htmlBlockCompiler("code","No IDs given!");
         if (pageLanguage === 'jp') txtHtml = htmlBlockCompiler("code","ID&#12364;&#25351;&#23450;&#12373;&#12428;&#12390;&#12356;&#12414;&#12379;&#12435;&#65281;");
      }

      else {

         let maxAmount = limitForVideoPage;
         if (vidId.length < maxAmount) maxAmount = vidId.length;

         for (let i = 0; i < maxAmount; i++) {
            let searchId = vidId[i].trim();

            let matchingVid = parsedVideos.findIndex(vid => vid.id === searchId  ||
                                                           // This is for video IDs that are saved as arrays. Usually the case with BiliBili videos
                                                           (Array.isArray(vid.id) && vid.id.includes(searchId)));

            if (matchingVid === -1) {
               let notif = "No video found with the ID &#34;" + checkUserInputs(searchId) + "&#34;!";
               if (pageLanguage === 'jp') notif = 'ID&#12302;' + checkUserInputs(searchId) + '&#12303;&#12398;&#21205;&#30011;&#12364;&#35211;&#12388;&#12363;&#12426;&#12414;&#12379;&#12435;&#65281;'
               txtHtml += htmlBlockCompiler("code",notif);
            }

            else txtHtml += compileEntry(matchingVid);

            txtHtml += breakline + '<hr/>' + breakline;
         }
                                      
      }
      
      let headerForPage = "Showing video(s) with IDs: " + checkUserInputs(vidId.join(', ')) ;
      if (pageLanguage === 'jp') headerForPage = "ID&#12302;" + checkUserInputs(vidId.join(', ')) + "&#12303;&#12398;&#21205;&#30011;&#12434;&#34920;&#31034;&#20013;"

      res.write(htmlHeadCompiler(headerForPage) + txtHtml + '</body></html>');

      res.end();

      doThis = false;
   }

   // Results page
   if (/*botCheckTmp && */ (htmPage + '/results.html') === quer.pathname) {
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
         
         headTmo = htmlHeadCompiler(checkUserInputs(headTmo) + ` - &#12506;&#12540;&#12472;: ${pageNumber}/${pageTotal}`);
                                          
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

         headTmo = htmlHeadCompiler(checkUserInputs(headTmo) + ` - Page: ${pageNumber}/${pageTotal}`);
        }
      }

      if (headTmo === '') headTmo = htmlHeadCompiler();

      res.write(headTmo + makeSearchBar(urlValueCheker(quer.query.search),quer.query.preview) + linksTmp  + compileList() + linksTmp + '</body></html>');

      res.end();

      doThis = false;
   }
   
   if (/*botCheckTmp && */ quer.pathname.includes(htmPage + '/json/')) {
      res.writeHead(200, {'Content-Type': 'application/json'});
      let basenameTmp = quer.pathname.substring(quer.pathname.indexOf('/json/') + 6);
      
      let showedContent = "Invalid query. Cannot search with: " + basenameTmp;

      if (basenameTmp.includes('.json') && basenameTmp.includes('-')) {
         let dashIndex = basenameTmp.indexOf('-');
         let jsonIndex = basenameTmp.indexOf('.json',dashIndex);

         basenameTmp = basenameTmp.substring(0,jsonIndex);
         
         // let extractorTmp = basenameTmp.substring(0,dashIndex);
         // let idTmp = basenameTmp.substring(dashIndex + 1);

         let jsonTmp = getJson(basenameTmp.substring(dashIndex + 1).trim(), basenameTmp.substring(0,dashIndex).trim());
         
         if (!!jsonTmp) showedContent = JSON.stringify(jsonTmp);
      }

      res.end(showedContent);

      // getJson(videoId, videoExtractorKey)


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

   // forceGC();
});

srvr.listen(portNumber);