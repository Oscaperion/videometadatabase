const fs = require('fs');
const url = require('url');
const http = require('http');
const XMLRequest = require("xmlhttprequest").XMLHttpRequest;

/*
   These are used to process the JSON files that contain the entries for the database.
     The values are supposed to read as a year and a month (YYYYMM) and the files should
     be named like "vids*YYYYMM*.json" (e.g. "vids202301.json") for them to be processed
     correctly. If there are no files for certain months, the code will just ignore those
     months.
*/
const maxMonth = 202312;
const minMonth = 200601;

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
const botCheckName = "hey_didyou_know";
const botCheckValue = "penrose_likes_blohaj";

/*
   Used to show, when the database was last updated.
*/
var lastUpdated;
{
   let currentDate = new Date();
   let cDay = currentDate.getDate();
   if (cDay < 10) cDay = '0' + cDay;
   let cMonth = currentDate.getMonth() + 1;
   if (cMonth < 10) cMonth = '0' + cMonth;
   let cYear = currentDate.getFullYear() + '';
   lastUpdated = cYear + cMonth + cDay + ' [YYYYMMDD]';
}

/*
   Link to an external Dropbox repository that has a backup of the JSON files used for
     the database.
*/
const dropboxLink = 'https://www.dropbox.com/sh/veadx97ot0pmhvs/AACiy1Pqa7dMj33v-yqG_1GYa?dl=0';

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

const tagsList = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/tags.json', 'utf8'));
//const tagsList = JSON.parse(fs.readFileSync('vidJson2/tags.json', 'utf8'));

const youtubeUserList = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/youtubeUserList2.json', 'utf8'));
//const youtubeUserList = JSON.parse(fs.readFileSync('vidJson2/youtubeUserList2.json', 'utf8'));

const reuploadListLoc = 'F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/reuploads.json';
//const reuploadListLoc = 'vidJson2/reuploads.json';
var reuploadShowing = JSON.parse(fs.readFileSync(reuploadListLoc, 'utf8'));

const twitterUserLoc = 'F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/twitterUserList.json';
//const twitterUserLoc = 'vidJson2/twitterUserList.json';
var twitterUserList = JSON.parse(fs.readFileSync(twitterUserLoc, 'utf8'));

/*
   If JSON files for reuploadShowing and twitterUserList are changed, they will be 
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

var pageNumber = 1;
var pageTotal = 1;
var foundVids = [];

/*
   This will be used to determine, whether or not the provided search words will be
     processed exactly as presented. Search words are processed separately by default.
     - true  = The provided search word will be processed as-is.
     - false = In case there are multiple words, each of them will be used separately.
*/
var exactWordSearch = false;

/*
   This will be used to determine, whether or not the entries will be accompanied by
     embedded video players. Check the createVideoPreview function to see which sites'
     videos currently have this feature. They are not shown by default.
     - true  = The video players are added along with the metadata.
     - false = The video players are not shown along with the metadata.
*/
var showVidPrev = false;

/*
   This will be used to store the search words of a query.
*/
var searchWords = [];

var searchedUser = "";
var searchingUser = false;

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
var mostRecentDate;
var leastRecentDate;
var dateQueried1;
var dateQueried2;
var customRangeApplied = false;

/*
   These are used as part of a method to determine, whether or not to exclude particular
     sites from search results. Compares this list to the .extractor_key values of the
     entries, aside from the last option. The "Others" option covers every other site,
     that hasn't been listed.
*/
var sitesList = [ {'site': 'Youtube',    'isIgnored':true},
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
   let numm = 0;
   for (let y = maxMonth; y >= minMonth; y--) {
      let terappi = 'F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts2/vids' + y + '.json';
      //let terappi = 'vidJson2/vids' + y + '.json';
      console.log('Loading ' + terappi)  ;
      try {
         parsedVideos.push(...JSON.parse(fs.readFileSync(terappi, 'utf8')));
         forceGC();
         console.log('Loaded!')  ;
         numm++;
         console.log('numm value: ' + numm)  ;
      } catch(e) {
         console.log("Oh wait, that doesn't exist");
      }
   }
}
console.log('All metadata loaded!');
console.log("Total number of entries: " + parsedVideos.length);

mostRecentDate = parsedVideos[0].upload_date;
leastRecentDate = parsedVideos[parsedVideos.length - 1].upload_date;
dateQueried1 = mostRecentDate;
dateQueried1 = leastRecentDate;

/*
   Used to turn seconds into more sensible form.
*/
function formatDuration(justSeconds) {
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

/*
   In case of separate search words, this optimizes them in two ways:
   1. Gets rid of search words that might already be part of other search words. For
      example, a query with "ant lantern" will be shortened to just "lantern".
   2. Sorts them from longest to shortest. The longer the search word, the less likely
      there will be matches and the database should be able to process them quicker.
*/
function optimizeSearching(searchWord,exactSearch) {
    if (searchWord === undefined || searchWord === null || searchWord.trim().length === 0) {
       searchWords = [];
       return undefined;
    }

    if (exactSearch) {
       let ret = [searchWord.trim()];
       searchWords = ret;
       return ret;
    }

    let searchArray = searchWord.split(" ").filter(ent => ent.length > 0);
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

function isSameUser(searchUserStr,video) {
   if (video.uId === undefined) return video.uploader_id === searchUserStr.trim();
   return youtubeUserList[video.uId].includes(searchUserStr.trim());
}

function ignoredSitesPresent() {
   return sitesList.some(ent => ent.isIgnored === true);
}


function compileList() {
   let retStr = '<hr/>' + breakline;
   
   for (let i = 0; i < foundVids.length; i++) {
      retStr += compileEntry(parsedVideos[foundVids[i]]) + breakline + '<hr/>' + breakline;
   }

   return retStr;
}

findVideos("",1);
console.log(foundVids);
console.log(pageNumber + " / " + pageTotal);
//console.log(compileEntry(parsedVideos[foundVids[3]]));
console.log(compileList());
//console.log(hasSearchWords(["mr","beast"],parsedVideos[foundVids[0]]));

//var pageNumber = 1;
//var pageTotal = 1;

// videosPerPage
//
function findVideos(searchWord,reqPage = 1,exactSearch = false,searchUploaderId = null) {
   let showAllVideos = false;
   foundVids = [];
   let searchTmp = optimizeSearching(searchWord,exactSearch);
   console.log(searchTmp);
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
         foundVids.push(u);
      }
   }
   
   else {
      //let foundVidAmount = 0;
      let searchUploaderToo = !(searchUploaderId === null);
      
      let vidTmp1 = parsedVideos.map((ent,ind) => {
         let tmp2 = sitesList.findIndex(siteEnt => siteEnt.site === ent.extractor_key);
         if (tmp2 === -1) tmp2 = sitesList.length - 1;
         if (sitesList[tmp2].isIgnored) return undefined;
         if (searchUploaderToo && !isSameUser(searchUploaderId,ent)) return undefined;
         if (!hasSearchWords(searchTmp,ent)) return undefined;
         return ind;
      }).filter(ent => ent !== undefined);

      let foundVidAmount = vidTmp1.length;
      pageTotal = Math.ceil(foundVidAmount / videosPerPage);

      if (reqPage > pageTotal || reqPage < 1) pageNumber = 1;
      else pageNumber = reqPage;

      foundVids = vidTmp1.filter((ent,ind) => (ind >= ((pageNumber - 1) * videosPerPage) && ind < (pageNumber * videosPerPage)));
   }

   /*
   else {
      let foundVidAmount = 0;
      let searchUploaderToo = !(searchUploaderId === null);
      let vidTmp1 = parsedVideos.findIndex(ent => {
         let tmp2 = sitesList.findIndex(siteEnt => siteEnt.site === ent.extractor_key);
         if (tmp2 === -1) tmp2 = sitesList.length - 1;
         if (sitesList[tmp2].isIgnored) return false;
         if (searchUploaderToo && !isSameUser(searchUploaderId,ent)) return false;
         return hasSearchWords(searchTmp,ent);
      });

      if (vidTmp1 !== -1) {
         let tmp1 = reqPage - 1;
         if (tmp1 < 0) {
            tmp1 = 0;
            //pageNumber = 1;
         }
         let searchThres = tmp1 * videosPerPage;
         let overPage = true;
         if (searchThres === 0) overPage = false;

         while (vidTmp1 > -1) {
            if (overPage && foundVidAmount >= searchThres) {
               overPage = false;
               foundVids = [];
               // pageNumber = reqPage;
            }

            if (foundVids.length < 15) {
               foundVids.push(vidTmp1);
            }

            foundVidAmount++;

            // sitesList = [ {'site': 'Youtube',    'isIgnored
            vidTmp1 = parsedVideos.findIndex((ent,ind) => {
               if (!(ind > vidTmp1)) return false;
               let tmp2 = sitesList.findIndex(siteEnt => siteEnt.site === ent.extractor_key);
               if (tmp2 === -1) tmp2 = sitesList.length - 1;
               if (sitesList[tmp2].isIgnored) return false;
               if (searchUploaderToo && !isSameUser(searchUploaderId,ent)) return false;
               return hasSearchWords(searchTmp,ent);
            });
         }

         if (overPage) pageNumber = 1;
         else pageNumber =  reqPage;

         pageTotal = Math.ceil(foundVidAmount / videosPerPage);
         console.log(foundVidAmount);
      }
   } */
}

function hasSearchWords(searchWord,video) {
   if (searchWord === undefined || searchWord === null || searchWord.length === 0) return true;

   let tmpVid = Object.values(video).filter((ent,ind) => {
      let compTmp = Object.keys(video)[ind];
      if (compTmp === "tags" || compTmp === "uId" || compTmp === "duration" || compTmp === "extractor_key" || compTmp === "webpage_url" || compTmp === "uploader_url") return false;
      return true;
   }).join(" ").toLowerCase();

   //tmpVid.push(...videoTags(video.tags));

   //if (video.uId !== undefined) tmpVid.push(...youtubeUserList[video.uId]);

   //return searchWord.every(srcWrd => tmpVid.join(" ").toLowerCase().includes(srcWrd));
   return searchWord.every(srcWrd => tmpVid.includes(srcWrd) || videoTags(video.tags).join(" ").toLowerCase().includes(srcWrd) || (video.uId !== undefined && youtubeUserList[video.uId].join(" ").toLowerCase().includes(srcWrd)));
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
   if (site === "Youtube") {
      let idTmp = userId;
      let multipleId = false;
      if (Number.isInteger(userId)) {
         idTmp = youtubeUserList[userId];
         multipleId = true;
      }

      if (!multipleId) return htmlLinkCompiler(userAddressCompiler(idTmp,site),(userName + ' [' + htmlBlockCompiler("code",idTmp) + ']'));
      
      let retStr = htmlLinkCompiler(userAddressCompiler(idTmp[0],site),(userName + ' [' + htmlBlockCompiler("code",idTmp[0]) + ']'));
      for (let j = 1; j < idTmp.length; j++) {
         retStr += ' ' + htmlLinkCompiler(userAddressCompiler(idTmp[j],site),('[' + htmlBlockCompiler("code",idTmp[j]) + ']'));
      }
      
      return retStr;
   }
   if (site === "Twitter" || site === "Niconico" || site === "BiliBili") {
      return htmlLinkCompiler(userAddressCompiler(userId,site),(userName + ' [' + htmlBlockCompiler("code",userId) + ']'));
   }
}

function userAddressCompiler(id_,site) {
   if (site === "Twitter") {
      let tmp1 = twitterUserList.findIndex(ent => ent.handle.includes(id_));
      if (tmp1 === -1) return 'https://twitter.com/' + id_;
      return 'https://twitter.com/i/user/' + twitterUserList[tmp1].id;
   }
   
   if (site === "Youtube") {
      if (id_.length === 24 && id_.substring(0,2) === 'UC') return "https://www.youtube.com/channel/" + id_;
      if (id_.charAt(0) === '@') return "https://www.youtube.com/" + id_;
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
   let checkHttp2 = [' ','\n'];
   
   let descr = descri;
   
   let retArr = [];

   let tmpHt = descr.indexOf(checkHttp1);

   let tmppp = 0;

   while (tmpHt > -1) {
      tmppp = -1;
      //console.log(tmpHt);
      for (let i = 0; i < checkHttp2.length; i++) {
         if (tmppp === -1 || tmppp > descr.indexOf(checkHttp2[i],tmpHt)) tmppp = descr.indexOf(checkHttp2[i],tmpHt);
      }
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
   }

   return retArr.join("");
}

function editLink(linkTmp) {
   let tmpp1 = linkTmp;

   let youTubeChecking   = ["youtu.be/","youtube.com/watch?v=","youtube.com/shorts/"];
   let nicovideoChecking = ["nicovideo.jp/watch/","nico.ms/"];

   let youtubeIdLength = 11;

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
   
   if (addSearchLinkYoutube) {
      let tmpLinkerino = -1;
      for (let y = 0; y < youTubeChecking.length; y++) {
         if (tmpLinkerino === -1) {
            if (tmpp1.indexOf(youTubeChecking[y]) > -1) {
               tmpLinkerino = y;
               break;
            }                                                                                  // htmlBlockCompiler(typeHtm,txt,additionalInfo = null)
         }                                                                                     // (address,txt = null,targetBlank = true)
      }
      let tmpLinkerino3 = tmpp1.indexOf(youTubeChecking[tmpLinkerino]) + youTubeChecking[tmpLinkerino].length;
      let tmpLinkerino2 = tmpp1.substring(tmpLinkerino3);
      if (tmpLinkerino2.length > youtubeIdLength) {
         tmpLinkerino2 = tmpLinkerino2.substring(0,youtubeIdLength);
      }
      
      //console.log (tmpp1.charAt(tmpLinkerino3 + youtubeIdLength));

      if (tmpp1.charAt(tmpLinkerino3 + youtubeIdLength) !== '&') return htmlLinkCompiler(tmpp1.substring(0,tmpLinkerino3 + youtubeIdLength)) + " " + htmlLinkCompiler('results.html?search=' + tmpLinkerino2, htmlBlockCompiler("code","[Search ID]"),false) + " " + tmpp1.substring(tmpp1.indexOf(youTubeChecking[tmpLinkerino]) + youTubeChecking[tmpLinkerino].length + youtubeIdLength);
      
      return htmlLinkCompiler(linkTmp) + " " + htmlLinkCompiler('results.html?search=' + tmpLinkerino2, htmlBlockCompiler("code","[Search ID]"),false);

      //htmlLinkCompiler('results.html?search=' +
   }
   return htmlLinkCompiler(linkTmp);
}

function editDescription(ogDesc) {
   if (ogDesc === undefined || ogDesc === null || ogDesc.trim().length === 0) return htmlBlockCompiler("code","[No description]");

   let descTmp = ogDesc.trim();

   if (descTmp.includes('http')) {
      descTmp = addLinks(ogDesc);
   }

   let lineBreakN = '\n';
   let lineBreakLoc = descTmp.indexOf(lineBreakN);
   if (lineBreakLoc === -1) return descTmp.trim();
   
   let retDesc = "";
   let tmpPos = 0;
   while (lineBreakLoc !== -1) {
      let tmpStr1 = descTmp.substring(tmpPos,lineBreakLoc);
      retDesc += tmpStr1 + '<br/>';
      tmpPos = lineBreakLoc + lineBreakN.length;
      lineBreakLoc = descTmp.indexOf(lineBreakN,lineBreakLoc + 1);
   }
   retDesc += descTmp.substring(tmpPos);
   return retDesc.trim();
}

/*
console.log(compileEntry(parsedVideos[0]));
console.log(compileEntry(parsedVideos.find(ent => ent.extractor_key === "Youtube")));
console.log(compileEntry(parsedVideos.find(ent => ent.tags.length > 0)));
console.log(compileEntry(parsedVideos.find(ent => ent.webpage_url !== undefined && ent.extractor_key !== "VK"))); */


/*
   Creates a <div> segment of a singular video entry.
*/
function compileEntry(video) {
   let userAddress = "";
   if (video.uploader_url !== undefined && video.uploader_url !== null) userAddress = htmlLinkCompiler(video.uploader_url,video.uploader + ' [' + htmlBlockCompiler("code",video.uploader_id) + ']');
   else {
      if (video.extractor_key === "Youtube" && video.uId !== undefined) userAddress = userLinkCompiler(video.uploader,video.uId,video.extractor_key);
      else userAddress = userLinkCompiler(video.uploader,video.uploader_id,video.extractor_key);
   }

   let titleTmp = videoLinkCompiler(video.id, video.extractor_key) + ' (' + formatDuration(video.duration) + ')';
   if (video.extractor_key !== "Twitter") {
      titleTmp = htmlBlockCompiler("b",video.title) + ' (' + formatDuration(video.duration) + ')<br/>' + breakline;
      if (video.webpage_url !== undefined) titleTmp += htmlBlockCompiler("code",htmlLinkCompiler(video.webpage_url));
      else titleTmp += htmlBlockCompiler("code",videoLinkCompiler(video.id,video.extractor_key));
   }

   userAddress = "<br/><br/>" + breakline + "Uploader: " + userAddress + '<br/>' + breakline;

   let releaseDate = "Release date: " + video.upload_date + '<br/><br/>' + breakline;

   let descTmp = editDescription(video.description) + '<br/><br/>' + breakline;

   let tagsTmp = htmlBlockCompiler("code",urlizeTags(videoTags(video.tags)));
   
   let prevTmp = createVideoPreview(video.id,video.extractor_key);

   return htmlBlockCompiler("div",titleTmp + userAddress + releaseDate + prevTmp + descTmp + tagsTmp);
}

function urlizeTags(tagsArray) {
   let strRet = "Tags:";

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
    let requ = new XMLHttpRequest_node();
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
   let titleStr =  'YTPMV Metadata Archive';
   if (htmlTitle !== null) titleStr = 'YTPMV Metadata Archive - ' + htmlTitle;

   return htmlStrHead1 + htmlBlockCompiler("title",titleStr) + breakline + '</head>';
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
   if (pageNumber !== pageTotal) retArray.push(htmlLinkCompiler('results.html?' + switchLister(pageTotal), pageTotal + '&nbsp;&#187;',false));
   return htmlBlockCompiler("div",retArray.join(gapMark));
}

// sitesList = [ {'site': 'Youtube',    'isIgnored
function switchLister(pageN = 1,searchW = null) {
   let retStr = [];

   let searchTmmp = searchWords;
   if (searchW !== null) searchTmmp = [searchW.trim()];

   if (searchTmmp.length > 0) retStr.push('search=' + searchTmmp.join(" "));

   if (searchingUser) retStr.push('uploader_id=' + searchedUser);

   for (let j = 0; j < sitesList.length; j++) {
      if (sitesList[j].isIgnored) retStr.push(`${sitesList[j].site}=${sitesList[j].isIgnored}`);
   }

   retStr.push("page=" + pageN);
   
   if (showVidPrev) retStr.push('preview=' + showVidPrev);

   retStr.push(`${botCheckName}=${botCheckValue}`);
   
   return retStr.join("&");
}

function makeSearchBar(searchStr = "") {
   let retStr = `Search for videos:
<form action="results.html" method="GET">
<input type="text" name="search" value="${searchStr.trim()}" />&nbsp;
<input type="submit" value="Search" />&nbsp;&#124;
<input type="hidden" name="${botCheckName}" value="${botCheckValue}" />

Exclude from search:` + breakline;

   for (let y = 0; y < sitesList; y++) {
      retStr += `<input type="checkbox" id="${sitesList[y].site}" name="${sitesList[y].site}" value="true"`;
      if (sitesList[y].isIgnored) retStr += ' checked="yes"';
      retStr += `><label for="${sitesList[y].site}">&nbsp;${sitesList[y].site}</label>` + breakline;
   }

   retStr += '</form>';

   return htmlBlockCompiler("div",retStr);
}

/*
   Initializing HTML code for index.html
*/
function htmlStrIndex(querie) {
   let htmlStrIndex = `<div><h2>YTPMV Metadata Archive</h2>Last updated: ${lastUpdated} &nbsp;&#124; <a href="${dropboxLink}" target="_blank">Download JSON File</a>
<br/>
<br/>
See also: <a href="https://polsy.org.uk/stuff/ytrestrict.cgi" target="_blank">YouTube region restriction checker</a> (polsy.org.uk)&nbsp;&#124;
<a href="https://www.codeofaninja.com/tools/find-twitter-id/" target="_blank">Find Twitter ID</a> (codeofaninja.com)</div>
<hr/>
<p>
Search for videos:` + breakline;

   if ('/YTPMV_Database' === querie) {
      htmlStrIndex += '<form action="YTPMV_Database/results.html" method="GET">';
   } else {
      htmlStrIndex += '<form action="results.html" method="GET">';
   }

   htmlStrIndex +=  breakline + '<input type="text" name="search" />&nbsp;' + breakline;
   htmlStrIndex += '<input type="submit" value="Search" />' + breakline;
   htmlStrIndex += '<input type="hidden" name="' + botCheckName + '" value="' + botCheckValue + '" />' + breakline;
   htmlStrIndex += '</form><br/>' + breakline + '</p>';

   return htmlStrIndex;
}

// sitesList = [ {'site': 'Youtube',    'isIgnored':true},
var srvr = http.createServer(function (req, res) {

   let quer = url.parse(req.url, true);

   let htmPage = '/YTPMV_Database';
   let searchTmp = quer.query.search;
   if (searchTmp === undefined) searchTmp = "";
   let pageTmp = quer.query.page;
   console.log(pageTmp);
   if (pageTmp === undefined || isNaN(pageTmp.trim())) pageTmp = 1;
   else pageTmp = parseInt(pageTmp.trim());

   let exactTmp = false;
   if (quer.query.exactSearch !== undefined && quer.query.exactSearch === 'true') exactTmp;
   //exactWordSearch = exactTmp;

 {
   for (let s = 0; s < sitesList.length; s++) {
      if (quer.query[sitesList[s].site] !== undefined && quer.query[sitesList[s].site].trim() === 'true') sitesList[s].isIgnored = true;
      else sitesList[s].isIgnored = false;
   }

   let uploaderTmp = quer.query.uploader_id;
   if (uploaderTmp === undefined) {
      searchingUser = false;
   } else {
      searchingUser = true;
      searchedUser = uploaderTmp.trim();
   }


   let previewTmp = quer.query.preview;
   if (previewTmp === undefined || previewTmp.trim() !== 'true') showVidPrev = false;
   else showVidPrev = true;
 }

   let doThis = true;
   
   // Results page
   if ((htmPage + '/results.html') === quer.pathname) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      
      if (!searchingUser) findVideos(searchTmp,pageTmp,exactTmp);
      else findVideos(searchTmp,pageTmp,exactTmp,searchedUser);

      //let showingList = compileList();

      let linksTmp = createPageLinks();
      
      let headTmo = '';

      if (searchWords.length === 0 && !searchingUser && !ignoredSitesPresent()) headTmo = htmlHeadCompiler(`Showing all videos - Page: ${pageNumber}/${pageTotal}`);
      else {
         headTmo = "Searching";

         if (searchWords.length === 0) headTmo += ' all videos';
         if (searchWords.length > 0) headTmo += ` "${searchTmp.trim()}"`;

         if (searchingUser) headTmo += ` by ${searchedUser}`;
         
         if (ignoredSitesPresent()) {
            // sitesList = [ {'site': 'Youtube',    'isIgnored'
            let tmoo = sitesList.filter(ent => !ent.isIgnored).map(ent => ent.site);
            if (tmoo.length > 0) headTmo += " from " + tmoo.join(', ');
            else headTmo += " from no site (Why would you exclude every site, you dumbass?)";
         }
         
         headTmo = htmlHeadCompiler(headTmo + ` - Page: ${pageNumber}/${pageTotal}`);
      }
      if (headTmo === '') headTmo = htmlHeadCompiler();

      res.write(headTmo + htmlBlockCompiler("body",linksTmp + compileList() + linksTmp) + '</html>');

      res.end();
      
      doThis = false;
   }

   // Index page
   if (htmPage === quer.pathname || (htmPage + '/') === quer.pathname || (htmPage + '/index.html') === quer.pathname) {
      res.writeHead(200, {'Content-Type': 'text/html'});

      res.write(htmlHeadCompiler() + htmlBlockCompiler("body",htmlStrIndex(quer.pathname)) + '</html>');

      res.end();
      
      doThis = false;
   }

   // For everything else
   if (doThis) {
      console.log('Tried to get to: ' +  quer.pathname);
      res.writeHead(404, {'Content-Type': 'text/html'});
      res.end("404 Not Found. Tried to get to: " +  quer.pathname);
   }
});

srvr.listen(3535);
