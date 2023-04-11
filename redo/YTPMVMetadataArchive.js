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
const minMonth = 202303;//200401;

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

/*
   This determines, whether or not the database will process a query or show all the 
      videos in the database. If no search query is given, the database shows all
      videos by default.
*/
var showAllVideos = true;

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
var sitesList = [ {'site': 'Youtube',    'isIgnored':false},
                  {'site': 'Niconico',   'isIgnored':false},
                  {'site': 'BiliBili',   'isIgnored':false},
                  {'site': 'Twitter',    'isIgnored':false},
                  {'site': 'Soundcloud', 'isIgnored':false},
                  {'site': 'VK',         'isIgnored':false},
                  {'site': 'Kakao',      'isIgnored':false}];
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
function optimizeSearching(searchArray) {
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

       if (includeStr) tmp2.push(tmp1[k]);
    }
    
    return tmp2.sort((a, b) => b.length - a.length);
}

function htmlBlockCompiler(typeHtm,txt,additionalInfo = null) {
   if (additionalInfo === null) return '<' + typeHtm + '>' + txt + '</' + typeHtm + '>' ;
   
   return '<' + typeHtm + ' ' + additionalInfo + '>' + txt + '</' + typeHtm + '>' ;
}

function htmlLinkCompiler(address,txt = null) {
   let tmpTxt = txt;
   if (tmpTxt === null) tmpTxt = address;
   
   return '<a href="' + address + '" target="_blank">' + tmpTxt + '</a>';
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
   if (site === "Twitter" || site === "Niconico") {
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
      if (id.length === 24 && id.substring(0,2) === 'UC') return "https://www.youtube.com/channel/" + id_;
      if (id.charAt(0) === '@') return "https://www.youtube.com/" + id_;
      return "https://www.youtube.com/user/" + id_;
   }

   if (site === "Niconico") {
      return "https://www.nicovideo.jp/user/" + id_;
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
   if (site === "BiliBili") return htmlLinkCompiler('https://www.bilibili.com/video/' + id[0]) + ' / ' + htmlLinkCompiler('https://www.bilibili.com/video/' + id[1],id[1]);
}

console.log(compileEntry(parsedVideos[0]));
console.log(compileEntry(parsedVideos.find(ent => ent.extractor_key === "Twitter")));
console.log(compileEntry(parsedVideos.find(ent => ent.tags.length > 0)));
console.log(compileEntry(parsedVideos.find(ent => ent.webpage_url !== undefined && ent.extractor_key !== "VK")));


/*
   Creates a <div> segment of a singular video entry.
*/
function compileEntry(video) {

   let userAddress = "";
   if (video.uploader_url !== undefined && video.uploader_url !== null) userAddress = htmlLinkCompiler(video.uploader_url,video.uploader + ' [' + htmlBlockCompiler("code",video.uploader_id) + ']');
   else {
      if (video.extractor_key === "Youtube" && video.uId !== undefined) userAddress = userLinkCompiler(video.uploader,video.uId,video.extractor_key) + "Blol";
      else userAddress = userLinkCompiler(video.uploader,video.uploader_id,video.extractor_key) + "Blal";
   }

   let titleTmp = videoLinkCompiler(video.id, video.extractor_key) + ' (' + formatDuration(video.duration) + ')';
   if (video.extractor_key !== "Twitter") {
      titleTmp = htmlBlockCompiler("b",video.title) + ' (' + formatDuration(video.duration) + ')<br/>' + breakline;
      if (video.webpage_url !== undefined) titleTmp += htmlBlockCompiler("code",htmlLinkCompiler(video.webpage_url));
      else titleTmp += htmlBlockCompiler("code",videoLinkCompiler(video.id,video.extractor_key));
   }

   userAddress = breakline + "Uploader: " + userAddress + '<br/>' + breakline;
   
   let releaseDate = "Release date: " + video.upload_date+ '<br/><br/>' + breakline;

   let tagsTmp = videoTags(video.tags);

   return titleTmp + userAddress + releaseDate + tagsTmp;
}