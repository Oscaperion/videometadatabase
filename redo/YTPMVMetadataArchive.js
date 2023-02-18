const fs = require('fs');
const url = require('url');
const http = require('http');
const XMLHttpRequest_node = require("xmlhttprequest").XMLHttpRequest;

/*
   Used to show, when the database was last updated.
*/
var currentDate = new Date();
var cDay = currentDate.getDate();
if (cDay < 10) cDay = '0' + cDay;
var cMonth = currentDate.getMonth() + 1;
if (cMonth < 10) cMonth = '0' + cMonth;
var cYear = currentDate.getFullYear() + '';

const lastUpdated = cYear + cMonth + cDay + ' [YYYYMMDD]';

/*
   These are used to process the JSON files that contain the entries for the database.
     The values are supposed to read as a year and a month (YYYYMM) and the files should
     be named like "vids*YYYYMM*.json" (e.g. "vids202301.json") for them to be processed
     correctly. If there are no files for certain months, the code will just ignore those
     months.
*/
var maxY = 202312;
var minY = 200501;

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
   These determine if the provided search word is used. Utilized to mitigate the issue,
     where queries involving shorter search words kept jamming the database.

   oneLetterSearchBugThreshold: If the search word's length is equal to or less than this
     value, the query will be ignored and the database showcases all videos in the
     database. If there are more than 1 search words and each of their length is equal to
     or less than this value, the query will be similarly ignored. However, if at least
     one of these search words is longer than this value, the query will be handled and
     results will be shown appropriately.
   NOTE: The code currently executes all queries that have the "Exact word search" option
     enabled regardless of the length of the search words, which could lead to the 
     jamming of the database. Will be fixed at a later date.
     
   oneLetterBugPrevented: This is dynamically used to check whether or not the queries
     will be processed.
     - true: A query will be processed as intended.
     - false: A query will be ignored and all of the database's entries will be showcased.
*/
const oneLetterSearchBugThreshold = 3;
var oneLetterBugPrevented = false;

/*
   Linebreak for strings
*/
const br =  '\r\n';

console.log('Started forming the server')  ;

console.log('Loading metadata...')  ;

/*
   Determines how many entries are being shown per page.
*/
const videosPerPage = 20;

/*
   Link to an external Dropbox repository that has a backup of the JSON files used for
     the database.
*/
const dropboxLink = 'https://www.dropbox.com/sh/veadx97ot0pmhvs/AACiy1Pqa7dMj33v-yqG_1GYa?dl=0';

/*
   These are used to keep track of what videos are being listed. These do not store any
     video metadata, just their overall order numbers/IDs (from the most to least recent).
     These values are then used to reference entries through the "searchVars" array.

   showcasedVideos: Once a query has been processed, this is where the IDs of matching
     videos will be stored for further processing.

   showcasingAllVideos: This will be filled with IDs of all entries in the database during
     the startup of the code and isn't meant to be edited afterwards. If a query deems
     that all entries should be showcased, this array will be passed on the
     "showcasedVideos" array for further processing.
*/
var showcasedVideos;
var showcasingAllVideos = [];

/*
   In case an uploader ID hasn't been specified in an entry, this string is used as a
     placeholder. Needs to be changed if a channel with a matching ID is ever added into 
     the database. :D
*/
const nullUploaderPlaceholder = 'skaPiPiduuDelierp';

/*
   These are used as part of crude bot prevention measures. Any queries provided
     without these values (&*botCheckName*=*botCheckValue*) will be redirected to a
     placeholder page, which will provide instructions on how to carry on with the query
     for actual visitors. So far this has been surprisingly effective, but if bots ever
     learn to take this into consideration a more robust measure need to be implemented.
*/
const botCheckName = "hey_didyou_know";
const botCheckValue = "selen_tatsuki_is_kool";

/*
   These are used as part of queries that specify certain dates. Also used to ensure that
     the user won't just input whatever they please.
*/
var mostRecentDate;
var leastRecentDate;
var dateQueried1;
var dateQueried2;
var customRangeApplied = false;

/*
   This will be used to determine, whether or not the provided search words will be
     processed exactly as presented.
     - true: The provided search word will be processed as-is.
     - false: In case there are multiple words, each of them will be used separately.
*/
var exactWordSearch = false;

/*
   This will be used to determine, whether or not the entries will be accompanied by
     embedded video players. So far it is only available for entries of videos from
     YouTube, Niconico and Twitter. They are not shown by default.
     - true: The video players are added along with the metadata.
     - false: The video players are not shown along with the metadata.
*/
var showVidPrev = false;

/*
   This is where the metadata entries are stored. The array will be processed during the
     startup and is not meant to be edited afterwards. "parsedVideos" is meant to consist 
     of multiple arrays. The order/ID of these entries are stored in the "searchVars"
     array, which should be used to access the array since there is a chance that the 
     entries are not in the intended order within "parsedVideos".
*/
var parsedVideos = [];

/*
   This is used as part of a method to determine, whether or not to exclude particular 
     sites from search results. Compares this list to the "extractor_key" values of the 
     entries, aside from the last option. The "Others" option include every other site,
     that hasn't been listed.
   NOTE: If values are edited here, you need to manually change other functions to match
     the edits made to this array.
*/
var sitesList = ['Youtube', 'Niconico', 'BiliBili', 'Twitter', 'Soundcloud', 'VK', 'Others'];

var numm = 0;
var y;
//for (y = minY; y <= maxY; y++) {
for (y = maxY; y >= minY; y--) {
    
   var terappi = 'F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts2/vids' + y + '.json';
   //var terappi = 'vidJson2/vids' + y + '.json';
   console.log('Loading ' + terappi)  ;
   try {
     var teray = fs.readFileSync(terappi, 'utf8');
     console.log('Check 1')  ;
     forceGC();
     console.log('Check 2')  ;
     parsedVideos.push(JSON.parse(teray));
     console.log('Check 3')  ;
     forceGC();
     console.log('Loaded!')  ;
     numm++;
     
     console.log('numm value: ' + numm)  ;
   } catch(e) {
     console.log("Oh wait, that doesn't exist");
   }
}
forceGC();

console.log('All metadata loaded! Sorting things out...')  ;

var searchVars = [];
var overaro = 0;
for (y = 0; y < numm; y++) {
   var perryPla;

   // for (perryPla = 0; perryPla < parsedVideos[y].videos.length; perryPla++) {
   for (perryPla = 0; perryPla < parsedVideos[y].length; perryPla++) {
       var pusherian = {id: overaro, vids: y, subvid: perryPla};
       overaro++;
       //console.log(pusherian);
       searchVars.push (pusherian );
       
   }
}

console.log("Total number of entries: " + overaro);

//var otrpi;
for (overaro = 0; overaro < searchVars.length; overaro++) {
    showcasingAllVideos[overaro] = overaro;
}
overaro = null;

//var parsedVideos = JSON.parse(fs.readFileSync('YTPMV-2021-06-01.json', 'utf8'));
//const parsedVideos = require('./YTPMV Metadata Archive JSON/YTPMV-2021-06-12.json');

mostRecentDate = parsedVideos[0][0].upload_date;
var dateTmp = parsedVideos.length - 1;
dateTmp = parsedVideos[dateTmp];
leastRecentDate = dateTmp[dateTmp.length - 1].upload_date;
dateTmp = null;
dateQueried1 = mostRecentDate;
dateQueried1 = leastRecentDate;

console.log('M ' + mostRecentDate + ' & L ' + leastRecentDate);
console.log('Loaded! Carbage collecting...');

forceGC();

console.log('Done?');


const exceptionUsers = [''];
// Uploaders whose videos are either deleted or scarcely available. This adds a link to the assumed reuploads at Archive.org

/*
const exceptionUsers2 = ['Rlcemaster3',
    'ARetaproductions',
    'DKCplayer',
    'KinkyOats',
    'GingpoopBR',
    'SpectraDash',
    'Arcoviso32',
    'GurchikAlt',
    'marcelozcanarioa',
    'MrXarlable',
    'ProPantsuWrestler',
    'omniputance',
    'HaikeiAkane',
    'SuperBocky',
    'StarWarsXM',
    'Torjuz1337',
    'NicoUploader092288C',
    'bobywea',
    'MrSteroids1',
    'LolZombiez',
    'justnix73',
    'giizismukwa2',             // Admiral Hippie
    'faugapeengana',            // Tris AF
    'gcon1350',                 // Tris
    'RP1234BITCH',              // Neavy
    'SiemaTuRusek',             // +TEK's alt
    'TerraMr99',                // Terrablade('s old account?)
    'TimeLegacy',               // yasendai
    'loquenderabrenda',         // Br3ND4
    'INTELSPARTA',              // Tea
    '123benjl123',              // Rosie
    'MineTakkunCH',             // Yuicheon Express
    'genpachi2000',             // suika 514
    'UCRwd3zsU0hwQBSrZaz-qGWA',
    'UC5A3XSKxvvtiLMaDyKg3R2g',
    'UCDTS3NrYaqxZFlbqir9RrTQ',
    'UCcFoMCwZJmCq-KvsHEg-BOw',
    'UCWkdWGNQIYfqgdfhU-59Wng',
    'UCHood5mmyWqncJ7QMePyPOA',
    'UCn54l_p8qgTRkiu7NTG8j8A',
    'UCwQg3yNaArCiT7ofpgT5Ivg',
    'UC6ZDG-FH46f-zslm-EA3nrg', // Gurchik's reupload+alt account
    'UCYhO7XqtAl4-r2wsXgumGzA', // namcigam
    'UCuBT3ZZANZ93az4LBUP8aeQ', // Neavy's alt
    'UClzjW7WE8o-ZrJAJ4nIBWcw', // Reuploader
    'UC3rfEppAd8qeBfyMF253B6A', // Greg
    'UCkaAQFfaaOmaxx_LRAA8Hzg', // I YTPMV Everything
    'UConHV3bogSwNmfWx6GZmhBQ', // TastyFlash =>
    'UCN91ZeOvrfcAqkG0vffP73g', // <= Milly
    'UCCjfUXE45ige09sjt1AsQ7A', // SakiZ
    'UCeLlhnvwBA_2EJu_1jD3Yxg', // Lorne
    'UC5DvrQXnfIqcn2bzfjqM5Uw', // Lorne's alt
    'UCRGSpid5qtmaQ_Em8IzEKjg', // nankanohito
    'UC6FQ1CCsTVdr5DrE4JXOVUA', // Night 0125
    'UCiGSlqsZgLw_hQeajPRJL6w', // Pkeneras
    'UCdCGgpm7a1LbaZHiQbrg2Dw', // Zuzusi / voxel (Kem's alt)
    'UC_welmHirHnI7IqbmYX7fcw', // ryuya akabane
    'UCBtFPFHOy6kDFfzN_NchJYQ', // Camille
    'UCNtp6pUSuXrjPLIkrhIch6A', // akindo
    'UCK-Kd5I0rvdpprAyis9UeSg', // Jake
    'UCIHiaW0aBQfYc7gOLvHvTdA', // Senji
    'UCL_nFJ4ItFUd9sXKHERKjCA', // passantea
    'UCP3oP9jNvMeGT9qNVr0eX5Q', // umi nae
    'UCK-ps_sc5rY7Xt7j1hTtXjw', // Lee (male sign)
    'UCimBvWLwntbNAKxw_7gufBw', // Detrimental Derivation
    'UCAoxZg10to0Nh8sXlaOSp6g', // Fasolt
    'UCNVTR24Mzg7_3HrgmX9bUhQ', // Fasolt Alt
    'UC1qzdvmhmxFVBjbvfCowgtQ', // Alex2
    'UC4ft1MHe2gpFFWVstwfA5Hw', // Pac Man
    'UCeg9LfP6p-PAplogCSflP7A', // fake sample
    'UClobvUCGR2VUkBlN0ax570g'];// pongayu
    */

function dateWithinRange(videoDate) {
   if (videoDate.length != 8) return false;

   var tmpRecent = dateQueried1;
   var tmpOldest = dateQueried2;

   if (tmpRecent < tmpOldest) {
      tmpRecent = dateQueried2;
      tmpOldest = dateQueried1;
   }

   if (tmpRecent >= videoDate && tmpRecent <= videoDate) return true;
   
   return false;
}

function getVideo(orderNumber) {
    
   var terpm = searchVars[orderNumber];
   
   
   //console.log(orderNumber + ' -- ' + terpm);
   // return parsedVideos[terpm.vids].videos[terpm.subvid];
   return parsedVideos[terpm.vids][terpm.subvid];
} 
/*
function getVideo(orderNumber) {
    
    var tmooop = orderNumber;
    var placehh = parsedVideos[0].videos[0];
   if (tmooop >= overaro || tmooop < 0) {
       return placehh;
   }    
   
   var vidBit;
   
   for (vidBit = 0; vidBit < parsedVideos.length; vidBit++) { 
       var vidLength = parsedVideos[vidBit].videos.length;
       if (vidLength > tmooop) {
           return parsedVideos[vidBit].videos[tmooop];
       }
       tmooop = tmooop - vidLength;
   }
    
   //console.log(terpm);
   return placehh;
} */

//var searchWord = 'thwy';

//var videoitaFile = fs.readFileSync('YTPMV-2019-11-28.json', 'utf8');
//var parsedVideos = JSON.parse(videoitaFile);



/*
var parsedVideos = null;

fs.readFile('YTPMV-2020-06-03.json', 'utf8', (err, fileDat) => {
    if (err) {
    console.error(err);
    return;
  }
  
  try {
     parsedVideos =  JSON.parse(fileDat);
  } catch(err) {
    console.error(err);
  }
});*/

function addCheckmarks(checkMarks) {   // ['Youtube', 'Niconico', 'BiliBili', 'Twitter', 'Soundcloud', 'VK', 'Others'];
    var returnStr = '';
    if (!(checkMarks[0] === undefined) || checkMarks[0] === 'true') {
       returnStr += '&Youtube=true';
    }   
    if (!(checkMarks[1] === undefined) || checkMarks[1] === 'true') {
       returnStr += '&Niconico=true';
    }
    if (!(checkMarks[2] === undefined) || checkMarks[2] === 'true') {
       returnStr += '&BiliBili=true';
    }
    if (!(checkMarks[3] === undefined) || checkMarks[3] === 'true') {
       returnStr += '&Twitter=true';
    }
    if (!(checkMarks[4] === undefined) || checkMarks[4] === 'true') {
       returnStr += '&Soundcloud=true';
    }
    if (!(checkMarks[5] === undefined) || checkMarks[5] === 'true') {
       returnStr += '&VK=true';
    }
    if (!(checkMarks[6] === undefined) || checkMarks[6] === 'true') {
       returnStr += '&Others=true';
    }
    
    if (exactWordSearch) {
       returnStr += '&exactSearch=true';
    }
    
    if (showVidPrev) {
        returnStr += '&preview=true';
    }

    return returnStr;
}

function showList(searchWord, searchUploaderId,page,checkMarks) {
    var searchingForUploaderToo = !(searchUploaderId === nullUploaderPlaceholder);
    //var newSearch = !(searchWord.toLowerCase().trim().localeCompare(lastSearchword.toLowerCase().trim()) == 0) || (!(searchUploaderId.toLowerCase().trim().localeCompare(lastCheckedUploader.toLowerCase().trim()) == 0) && searchingForUploaderToo);
    //console.log("Why doesn't this work");
    console.log('Searching: ' + searchWord);
    //console.log(lastSearchword + '');
    //console.log(newSearch);
    



    if (searchingForUploaderToo) {
       createListForUploader(searchWord,searchUploaderId,checkMarks);
    }
    else {
       createList(searchWord,checkMarks);
    }

    var videoList = '';
    
    var searchWordTmp = 'search=' + searchWord.trim();
    // If the search word is an empty string, no search word is added to the page links
    /*
    if (searchWord.trim() === 'search=') {
        searchWordTmp = '';
    } */
    

    var totalPages = 1;
    while ((totalPages * videosPerPage) <= showcasedVideos.length) {
       totalPages++;
    }
    
    var currentPage = page;
    if (page > totalPages) currentPage = totalPages;
    if (page < 1) currentPage = 1;

    var startValue = videosPerPage * (currentPage - 1);
    var endValue = videosPerPage * currentPage;
    if (endValue > showcasedVideos.length) endValue = showcasedVideos.length;


    var linkThing = '';
    // Writing links on top of page
    if (totalPages > 1) {
         linkThing += '<hr/>';
         var keepGoing = true;

         if (currentPage != 1) {
             linkThing += '<a href="results.html?' + searchWordTmp;
             
             
             if (searchingForUploaderToo) {
                 linkThing += '&uploader_id=' + searchUploaderId;
             }
             linkThing += addCheckmarks(checkMarks);
             linkThing += '&page=1';
             linkThing += '&' + botCheckName + '=' + botCheckValue;
             linkThing += '">&#171;&nbsp;1</a> &#9674; ' + br;
         }

         if (currentPage == 1) {
             linkThing += '<b>&#139;1&#155;</b> &#9674; ' + br;
             if (totalPages == 2) {
                linkThing += '<a href="results.html?' + searchWordTmp;
                if (searchingForUploaderToo) {
                 linkThing += '&uploader_id=' + searchUploaderId;
                }
                linkThing += addCheckmarks(checkMarks);
                linkThing += '&page=2';
                linkThing += '&' + botCheckName + '=' + botCheckValue;
                linkThing += '">2&nbsp;&#187;</a>' + br;
                keepGoing = false;
             }
             if (keepGoing && totalPages > 2) {
                linkThing += '<a href="results.html?' + searchWordTmp;
                if (searchingForUploaderToo) {
                   linkThing += '&uploader_id=' + searchUploaderId;
                }
                linkThing += addCheckmarks(checkMarks);
                linkThing += '&page=2';
                linkThing += '&' + botCheckName + '=' + botCheckValue;
                linkThing += '">2&nbsp;&#155;</a> &#9674; ' + br;
                linkThing += '<a href="results.html?' + searchWordTmp;
                if (searchingForUploaderToo) {
                   linkThing += '&uploader_id=' + searchUploaderId;
                }
                linkThing += addCheckmarks(checkMarks);
                linkThing += '&page=' + totalPages;
                linkThing += '&' + botCheckName + '=' + botCheckValue;
                linkThing +='">' + totalPages + '&nbsp;&#187;</a>' + br;
                keepGoing = false;
             }
         }

         if (keepGoing && currentPage == 2 && totalPages == 2) {
             linkThing += '<b>&#139;2&#155;</b>';
             keepGoing = false;
         }

         if (keepGoing && currentPage == totalPages) {
             linkThing += '<a href="results.html?' + searchWordTmp;
             if (searchingForUploaderToo) {
                 linkThing += '&uploader_id=' + searchUploaderId;
             }
             linkThing += addCheckmarks(checkMarks);
             linkThing += '&page=' + (totalPages - 1);
             linkThing += '&' + botCheckName + '=' + botCheckValue;
             linkThing += '">&#139;&nbsp;' + (totalPages - 1) + '</a> &#9674; ' + br;
             linkThing += '<b>&#139;' + totalPages + '&#155;</b>';
             keepGoing = false;
         }
         
         if (keepGoing) {
             var previousPage = currentPage - 1;
             var nextPage = currentPage - 1 + 2;
             if (currentPage > 2) {
                linkThing += '<a href="results.html?' + searchWordTmp;
                if (searchingForUploaderToo) {
                    linkThing += '&uploader_id=' + searchUploaderId;
                }
                linkThing += addCheckmarks(checkMarks);
                linkThing += '&page=' + previousPage;
                linkThing += '&' + botCheckName + '=' + botCheckValue;
                linkThing +='">&#139;&nbsp;' + previousPage + '</a> &#9674; ' + br;
             }
             linkThing += '<b>&#139;' + currentPage + '&#155;</b> &#9674; ' + br;
             if (nextPage != totalPages) {
                linkThing += '<a href="results.html?' + searchWordTmp;
                if (searchingForUploaderToo) {
                    linkThing += '&uploader_id=' + searchUploaderId;
                }
                linkThing += addCheckmarks(checkMarks);
                linkThing += '&page=' + nextPage;
                linkThing += '&' + botCheckName + '=' + botCheckValue;
                linkThing += '">' + nextPage + '&nbsp;&#155;</a> &#9674; ' + br;
             }
             linkThing += '<a href="results.html?' + searchWordTmp;
             if (searchingForUploaderToo) {
                    linkThing += '&uploader_id=' + searchUploaderId;
                }

             linkThing += addCheckmarks(checkMarks);
             linkThing += '&page=' + totalPages;
             linkThing += '&' + botCheckName + '=' + botCheckValue;
             linkThing += '">' + totalPages + '&nbsp;&#187;</a>' + br;
         }
    }
    
    videoList += linkThing;
    if (!oneLetterBugPrevented && !(searchWordss[0] === undefined)) {
       videoList += '<br/>Search word: "' + unableCodingInSearch(searchWord).trim() + '"';
    } if (!oneLetterBugPrevented && (searchWordss[0] === undefined)) {
       videoList += '<br/>Showing all videos';
    } if (oneLetterBugPrevented) {
       videoList += '<br/>The search word "' + unableCodingInSearch(searchWord).trim() + '" had to be ignored to avoid site crashing, showing all videos';
       oneLetterBugPrevented = false;
    }
    // TEST
    if (searchingForUploaderToo) {
    videoList += '<br/>Searched Uploader ID: "' + unableCodingInSearch(searchUploaderId) + '"';
    //videoList += '</div>';
}

    for (i = startValue; i < endValue; i++) {
       videoList += '<hr/><div>' + br;
       // console.log ("the bus is here?" + showcasedVideos[i].id);
      
          var listedVideo = getVideo(showcasedVideos[i]);
        
        var titlePlaceh = '';
          
        
       
       if (listedVideo.extractor_key === "Twitter") {
           var vidTmp2 = 'https://twitter.com/' + listedVideo.uploader_id + '/status/' + listedVideo.id;
           
           titlePlaceh = '<code><a href=\"' + vidTmp2 + '\" target=\"_blank\">' + vidTmp2 + '</a></code> (' + formatDuration(listedVideo.duration) +')' + br;
       } else {
           
           titlePlaceh = '<b>' + listedVideo.title + '</b> (' + formatDuration(listedVideo.duration) +')<br/>' + br;
       } 
          
       videoList += titlePlaceh;

       // Video link
       var vidTmp = '';
       
       if (listedVideo.extractor_key === "Youtube") {
           var vidTmp2 = 'https://www.youtube.com/watch?v=' + listedVideo.id;
           
           vidTmp = '<code><a href=\"' + vidTmp2 + '\" target=\"_blank\">' + vidTmp2 + '</a></code>';
       }
       
       if (listedVideo.extractor_key === "Niconico") {
           var vidTmp2 = 'https://www.nicovideo.jp/watch/' + listedVideo.id;
           
           vidTmp = '<code><a href=\"' + vidTmp2 + '\" target=\"_blank\">' + vidTmp2 + '</a></code>';
       }
       
       if (listedVideo.extractor_key === "BiliBili") {
           var vidTmp2 = listedVideo.webpage_url;
           var terraip = vidTmp2.indexOf('&');
           if (terraip != -1) vidTmp2 = vidTmp2.substring(0,terraip);
           terraip = vidTmp2.indexOf('?p=1');
           if (terraip != -1 && vidTmp2.substring(terraip).length == 4) vidTmp2 = vidTmp2.substring(0,terraip);
           
           
           vidTmp = '<code><a href=\"' + vidTmp2 + '\" target=\"_blank\">' + vidTmp2 + '</a></code>';
       }
       
       if (vidTmp === '' && !(listedVideo.extractor_key === "Twitter")) {
          vidTmp = '<code><a href=\"' + listedVideo.webpage_url + '\" target=\"_blank\">' + listedVideo.webpage_url + '</a></code>';
       }
       
       videoList += vidTmp;
       
       if (listedVideo.extractor_key === "BiliBili" && listedVideo.webpage_url.search(listedVideo.id) == -1) {
         if (listedVideo.id.search("_part1") > 0) {
           var teypi = listedVideo.id.indexOf("_part1");
           var teyp2 = listedVideo.id.substring(0,teypi);
           var teyp21 = listedVideo.id.substring(teypi); 
           if (teyp21.length > 6) { 
              var teyp3 = listedVideo.id.substring(teypi + 5); 
              videoList += '&nbsp;<code>[<a href=\"https://www.bilibili.com/video/av' + teyp2 + '?p=' + teyp3 + '\" target=\"_blank\">av' + listedVideo.id + '</a>]</code>';
           } else {
              videoList += '&nbsp;<code>[<a href=\"https://www.bilibili.com/video/av' + teyp2 + '\" target=\"_blank\">av' + teyp2 + '</a>]</code>'; 
           }
         }
         else if (listedVideo.id.search("_part") > 0) {
           var teypi = listedVideo.id.indexOf("_part");
           var teyp2 = listedVideo.id.substring(0,teypi);
           var teyp3 = listedVideo.id.substring(teypi + 5);
           videoList += '&nbsp;<code>[<a href=\"https://www.bilibili.com/video/av' + teyp2 + '?p=' + teyp3 + '\" target=\"_blank\">av' + listedVideo.id + '</a>]</code>';
         }  
         else if (listedVideo.id.search("_p") > 0) {
           var teypi = listedVideo.id.indexOf("_p");
           var teyp2 = listedVideo.id.substring(0,teypi);
           var teyp3 = listedVideo.id.substring(teypi + 2);
           videoList += '&nbsp;<code>[<a href=\"https://www.bilibili.com/video/av' + teyp2 + '?p=' + teyp3 + '\" target=\"_blank\">av' + listedVideo.id + '</a>]</code>';
         } else {
           videoList += '&nbsp;<code>[<a href=\"https://www.bilibili.com/video/av' + listedVideo.id + '\" target=\"_blank\">av' + listedVideo.id + '</a>]</code>';
         }
       }

       // This will determine if a link to a supposed Archive.org reupload will be added
       if (checkForAcrhiveOrgLink(listedVideo))  {
       
            // Exception for DKCplayer     
            if (isTheUserSame(listedVideo,'DKCplayer')) {
                videoList += '&nbsp;&#124; <a href=\"https://archive.org/details/yt-DKCplayer_201509\">Archive.org reupload</a>';
            }
            // Exception for KinkyOats
            else if (isTheUserSame(listedVideo,'KinkyOats')) {
                videoList += '&nbsp;&#124; <a href=\"https://archive.org/details/183b1uU3XIELr6c\">Archive.org reupload</a>';
            
            }
            // Exception for HyperFlameXLI
            else if (isTheUserSame_String(listedVideo.uploader,'HyperFlameXLI')) {
                videoList += '&nbsp;&#124; <a href=\"https://archive.org/details/HyperFlameXLI_Archive\">Archive.org reupload</a>';
            }
            else {
                videoList += '&nbsp;&#124; <a href=\"https://archive.org/details/youtube-' + listedVideo.id + '\">Archive.org reupload</a>';
            }
       }
       
       videoList += '<br/><br/>' + br;
       
       var uploader_Str = '';

       if (listedVideo.extractor_key === 'BiliBili') {
          uploader_Str = '<a href=\"https://space.bilibili.com/' + listedVideo.uploader_id + '\" target=\"_blank\">' + listedVideo.uploader + ' [<code>' + listedVideo.uploader_id + '</code>]</a>';
       }
       
       if (listedVideo.extractor_key === 'Niconico') {
          uploader_Str = '<a href=\"https://www.nicovideo.jp/user/' + listedVideo.uploader_id + '\" target=\"_blank\">' + listedVideo.uploader + ' [<code>' + listedVideo.uploader_id + '</code>]</a>';
       }
       
       if (listedVideo.extractor_key === 'Twitter') {
          uploader_Str = '<a href=\"https://twitter.com/' + listedVideo.uploader_id + '\" target=\"_blank\">' + listedVideo.uploader + ' [<code>' + listedVideo.uploader_id + '</code>]</a>';
       }
       
       if (listedVideo.extractor_key === 'Youtube') {
          uploader_Str = youtubeUploaderFormer(listedVideo.uploader,listedVideo.uploader_id);
       }
       
       if (uploader_Str === '') {
          uploader_Str = '<a href=\"' + listedVideo.uploader_url + '\" target=\"_blank\">' + listedVideo.uploader + ' [<code>' + listedVideo.uploader_id + '</code>]</a>';
       }

       if (listedVideo.uploader === null && listedVideo.uploader_id === null) {
          uploader_Str = '<code>undefined</code>';
       } else if (listedVideo.uploader_id === null) {
          uploader_Str = listedVideo.uploader;
       }

       videoList += 'Uploader: ' + uploader_Str + '<br/>' + br;
       videoList += 'Release date: ' + listedVideo.upload_date + br;

       videoList += createVideoPreview(listedVideo.id,listedVideo.extractor_key) + br;
       
       if (!(listedVideo.description === undefined)) {
         videoList += editDescription(listedVideo.description, listedVideo.extractor_key) + br;
       } else {
           videoList += '<code>[No description]</code>' + br;
       }

       
       if (!(listedVideo.tags === undefined)) {
         var tagN;
         var thereAreNoTags = true;
         videoList += '<br/><br/><code><b>Tags:</b> ';
         try {
         for (tagN = 0; tagN < listedVideo.tags.length; tagN++) {
           thereAreNoTags = false;  
           videoList += '<a href=\"results.html?search=' + listedVideo.tags[tagN] + '\">' + listedVideo.tags[tagN] + '</a> ';
         }
         } catch(err) {
            thereAreNoTags = true; 
         }
         if (thereAreNoTags) {
             videoList += '&#60;NONE&#62;';
         }
         videoList += '</code>';
       }
       
       if (!searchingForUploaderToo) {
        // console.log(listedVideo);
        var tret = listedVideo.uploader_id;
        if (listedVideo.extractor_key === "Youtube") tret = listedVideo.uploader_id[0];
       videoList += br + '<br/><br/><a href="results.html?' + botCheckName + '=' + botCheckValue + '&uploader_id=' + tret + addCheckmarks(checkMarks) + '">Search more videos from <code>' + listedVideo.uploader + '</code></a><br/>' + br;
       videoList += '<a href="results.html?' + botCheckName + '=' + botCheckValue + '&search=' + searchWord + '&uploader_id=' + tret + addCheckmarks(checkMarks) + '">Search more videos from <code>' + listedVideo.uploader + '</code> with the current search word</a>';
       }
       
       videoList += '</div>';

    }
    
    videoList += linkThing;

    return videoList;
}

function unableCodingInSearch(searchWord) {
    var searchChar = '<';
    var replaceCode = '&#60;';

    if (searchWord.indexOf(searchChar) == -1) {
        return searchWord;
    }
    
    var temppo = searchWord;
    
    while (temppo.indexOf(searchChar) != -1) {
        var charPlace = temppo.indexOf(searchChar);
        var tmp1 = '';
        if (charPlace != 0) {
            tmp1 = temppo.substring(0,charPlace);
        }
        var tmp2 = temppo.substring(charPlace + 1);
        
        temppo = tmp1 + replaceCode + tmp2;
    }

    return temppo;
}

function checkForAcrhiveOrgLink(videoInfo) {
    /*
    console.log(videoInfo.title);
    console.log(videoInfo.id);
    console.log(videoInfo.uploader);
    console.log(videoInfo.uploader_id); */

    var exp;

    for (exp = 0; exp < exceptionUsers.length; exp++) {
        if (isTheUserSame(videoInfo,exceptionUsers[exp])) {
            return true;
        }
    }
    
    return false;
}

function isTheUserSame(videoInfo, uploaderName) {
    if (videoInfo.uploader_id === null || videoInfo.uploader_id === undefined) {
        return false;
    }
    
    for (var jkh = 0; jkh < videoInfo.uploader_id.length; jkh++) {
        if (isTheUserSame_String(videoInfo.uploader_id[jkh].trim(), uploaderName)) return true;
    }

    return false;
}

function isTheUserSame_String(videoUploader, uploaderName) {
    return (videoUploader === uploaderName);
}

function formatDuration(justSeconds) {
    var minute = 60;
    
    var mins = 0;
    var secs = justSeconds;
    
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
    
    var hours = 0;
    
    while (mins >= minute) {
        hours++;
        mins = mins - minute;
    }
    
    var retStr = hours + ':';
    
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

function addLinks(ogDescription, searchString) {
    var editedDescription = ogDescription;
    var linkPos = editedDescription.indexOf(searchString);

    if (linkPos > -1) {
        while (linkPos != -1) {
            var tempp1 = editedDescription.indexOf(' ', linkPos);
            var tempp2 = editedDescription.indexOf('\n', linkPos);
            //console.log(tempp1 + ' -- ' + tempp2);
            var endOfLink = tempp1;
            if ((tempp2 != -1 && tempp2 < tempp1) || (tempp2 > tempp1 && tempp1 == -1)) {
                endOfLink = tempp2;
            }
            var linkara = '';
            //console.log('End of link: ' + endOfLink);

            if (endOfLink == -1) { //(tempp1 == -1 && tempp2 == -1) {
                linkara = editedDescription.substring(linkPos);
            } else {
                linkara = editedDescription.substring(linkPos,endOfLink);
            }
            //console.log(linkara);

            var tempStr1 = editedDescription.substring(0,linkPos);
            var tempStr2 = editedDescription.substring(endOfLink);

            var linkingPark = '<a href="' + linkara + '" target="_blank">' + linkara + '</a>';


            // If the link has an ID to a video on YouTube, Niconico or Bilibili, this will add a link to search the archive with that ID
            tarkLink = "youtube.com/watch?v=";
            if (linkara.indexOf(tarkLink) > -1) {
                var temperar = linkara.substring((linkara.indexOf(tarkLink) + tarkLink.length));
                if (temperar.length > 11) {
                   temperar = temperar.substring(0, 11);
                }
                
                linkingPark = linkingPark + '&nbsp;<code><a href="results.html?' + botCheckName + '=' + botCheckValue + '&search=' + temperar + '">[Search with this ID]</a></code>';
            }
            
            tarkLink = "youtu.be/";
            if (linkara.indexOf(tarkLink) > -1) {
                var temperar = linkara.substring((linkara.indexOf(tarkLink) + tarkLink.length));
                if (temperar.length > 11) {
                   temperar = temperar.substring(0, 11);
                }
                
                linkingPark = linkingPark + '&nbsp;<code><a href="results.html?' + botCheckName + '=' + botCheckValue + '&search=' + temperar + '">[Search with this ID]</a></code>';
            }
            
            tarkLink = "nico.ms/";
            if (linkara.indexOf(tarkLink) > -1) {
                var temperar = linkara.substring((linkara.indexOf(tarkLink) + tarkLink.length));
                if (temperar.indexOf('?') > -1) {
                   temperar = temperar.substring(0, temperar.indexOf('?'));
                }
                if (temperar.indexOf(')') > -1) {
                   temperar = temperar.substring(0, temperar.indexOf(')'));
                }
                
                linkingPark = linkingPark + '&nbsp;<code><a href="results.html?' + botCheckName + '=' + botCheckValue + '&search=' + temperar + '">[Search with this ID]</a></code>';
            }
            
            tarkLink = "nicovideo.jp/watch/";
            if (linkara.indexOf(tarkLink) > -1) {
                var temperar = linkara.substring((linkara.indexOf(tarkLink) + tarkLink.length));
                if (temperar.indexOf('?') > -1) {
                   temperar = temperar.substring(0, temperar.indexOf('?'));
                }
                if (temperar.indexOf(')') > -1) {
                   temperar = temperar.substring(0, temperar.indexOf(')'));
                }
                
                linkingPark = linkingPark + '&nbsp;<code><a href="results.html?' + botCheckName + '=' + botCheckValue + '&search=' + temperar + '">[Search with this ID]</a></code>';
            }
            
            tarkLink = "acg.tv/";
            if (linkara.indexOf(tarkLink) > -1) {
                var temperar = linkara.substring((linkara.indexOf(tarkLink) + tarkLink.length));
                if (temperar.indexOf('?') > -1) {
                   temperar = temperar.substring(0, temperar.indexOf('?'));
                }
                if (temperar.indexOf('/') > -1) {
                   temperar = temperar.substring(0, temperar.indexOf('/'));
                }
                if (temperar.indexOf(')') > -1) {
                   temperar = temperar.substring(0, temperar.indexOf(')'));
                }
                
                linkingPark = linkingPark + '&nbsp;<code><a href="results.html?' + botCheckName + '=' + botCheckValue + '&search=' + temperar + '">[Search with this ID]</a></code>';
            }
            
            tarkLink = "bilibili.com/video/";
            if (linkara.indexOf(tarkLink) > -1) {
                var temperar = linkara.substring((linkara.indexOf(tarkLink) + tarkLink.length));
                if (temperar.indexOf('?') > -1) {
                   temperar = temperar.substring(0, temperar.indexOf('?'));
                }
                if (temperar.indexOf('/') > -1) {
                   temperar = temperar.substring(0, temperar.indexOf('/'));
                }
                if (temperar.indexOf(')') > -1) {
                   temperar = temperar.substring(0, temperar.indexOf(')'));
                }
                
                linkingPark = linkingPark + '&nbsp;<code><a href="results.html?' + botCheckName + '=' + botCheckValue + '&search=' + temperar + '">[Search with this ID]</a></code>';
            }
            
            tarkLink = "b23.tv/";
            if (linkara.indexOf(tarkLink) > -1) {
                var temperar = linkara.substring((linkara.indexOf(tarkLink) + tarkLink.length));
                if (temperar.indexOf('?') > -1) {
                   temperar = temperar.substring(0, temperar.indexOf('?'));
                }
                if (temperar.indexOf('/') > -1) {
                   temperar = temperar.substring(0, temperar.indexOf('/'));
                }
                if (temperar.indexOf(')') > -1) {
                   temperar = temperar.substring(0, temperar.indexOf(')'));
                }
                
                linkingPark = linkingPark + '&nbsp;<code><a href="results.html?' + botCheckName + '=' + botCheckValue + '&search=' + temperar + '">[Search with this ID]</a></code>';
            }


            editedDescription = tempStr1 + linkingPark;
            if (endOfLink != -1) {
                editedDescription += tempStr2;
            }
            var temmie = linkPos;

            linkPos = editedDescription.indexOf(searchString, (temmie + linkingPark.length));
        }
    }
    
    return editedDescription;
}

function editDescription(ogDescription, extractorKey) {
    var editedDescription = ogDescription;
    
    if (ogDescription === null) {
        return "<code>[No description]</code>";
    }
    
    if (extractorKey.indexOf("Niconico") == -1) {
        //editedDescription = addLinks(editedDescription,'https://');
        //editedDescription = addLinks(editedDescription,'http://');
        editedDescription = addLinks(editedDescription,'http');
    }

    //var thereAreBrs = false;
    var brPos = editedDescription.indexOf('\n');

    //console.log('brPos (1ST): ' + brPos);

    if (brPos == -1) {
        return editedDescription;
    }

    while (brPos != -1) {
        //console.log('brPos: ' + brPos);
        var temp1 = editedDescription.substring(0,brPos);
        var temp2 = editedDescription.substring(brPos);
        editedDescription = temp1 + '<br/>' + temp2;
        var temp3 = brPos + 6;
        brPos = editedDescription.indexOf('\n', temp3);
    }
    
    return editedDescription;
}

function createVideoPreview(vidId,vidSite) {
    if (!showVidPrev) return '<br/><br/>';
    if (vidSite === 'Youtube') return '<br/><br/>' + createVideoPreviewYoutube(vidId) + '<br/><br/>' + br;
    if (vidSite === 'Niconico') return '<br/><br/>' + createVideoPreviewNiconico(vidId) + '<br/><br/>' + br;
    if (vidSite === 'Twitter') return '<br/>' + createVideoPreviewTwitter(vidId) + br;
    if (vidSite === 'Soundcloud') return '<br/><br/>' + createAudioPreviewSoundcloud(vidId) + '<br/><br/>' + br;
    if (vidSite === 'Vimeo') return '<br/><br/>' + createVideoPreviewVimeo(vidId) + '<br/><br/>' + br;
    if (vidSite === 'Kakao') return '<br/><br/>' + createVideoPreviewKakao(vidId) + '<br/><br/>' + br;
    if (vidSite === 'Dailymotion') return '<br/><br/>' + createVideoPreviewDailymotion(vidId) + '<br/><br/>' + br;
    return '<br/><br/>';
}

function createVideoPreviewYoutube(vidId) {
    var embbee = '<iframe width="640" height="480" src="https://www.youtube.com/embed/' + vidId + '" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>';
    return embbee;
}

function createVideoPreviewNiconico(vidId) {
    var embbee = '<iframe width="640" height="480" src="https://embed.nicovideo.jp/watch/' + vidId + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>';
    return embbee;
}

function createAudioPreviewSoundcloud(vidId) {
    var embbee = '<iframe width="640" height="300" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' + vidId + '&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe>';
    return embbee;
}

function createVideoPreviewVimeo(vidId) {
    var embbee = '<iframe src="https://player.vimeo.com/video/' + vidId + '" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>';

    return embbee;
}

function createVideoPreviewKakao(vidId) {
    var embbee = '<iframe width="640" height="480" src="https://play-tv.kakao.com/embed/player/cliplink/' + vidId + '?service=player_share" allowfullscreen frameborder="0" scrolling="no" allow="autoplay; fullscreen; encrypted-media"></iframe>';
    
    return embbee;
}

function createVideoPreviewDailymotion(vidId) {
    var embbee = '<iframe frameborder="0" type="text/html" src="https://www.dailymotion.com/embed/video/' + vidId + '" width="640" height="480" allowfullscreen></iframe>';
    
    return embbee;
}

function createVideoPreviewTwitter(vidId) {
    var apiLink = 'https://publish.twitter.com/oembed?url=https%3A%2F%2Ftwitter.com%2Fi%2Fstatus%2F' + vidId;
    var embbee = '';
    var requ = new XMLHttpRequest_node();
    requ.onreadystatechange = function() {
      if (requ.readyState == 4 && requ.status == 200){
        embbee = JSON.parse(requ.responseText).html;
        console.log("JSON succesfully fetched from Twitter's site");
       }
    };
    requ.open("GET", apiLink, false);
    requ.send(null);
    requ.abort();
    
    embbee = embbee.trim();
    
    if (embbee === '') embbee = '<br/>';

    return embbee;
}

var searchWordss = [];

function createList(searchWord,checkMarks) {

    setSearchWords(searchWord);
    console.log(searchWordss[0]);
    var runThis = true;
    var noCheckmarks = true;
    var checkMarkBoolean = [];
    for (var pp = 0; pp < checkMarks.length; pp++) {
        if (checkMarks[pp] === undefined || !(checkMarks[pp] === 'true')) {
           checkMarkBoolean.push(false);
        } else {
           checkMarkBoolean.push(true);
           noCheckmarks = false;
        }
    }   /*
    console.log(checkMarks);
    console.log(checkMarkBoolean); 
    console.log(noCheckmarks);*/

    // This is here in case someone provides an empty string which prompts the database to show all videos. This avoids running the comparison check needlessly
    // var tmpDread = searchWord.trim() + ' ';
    //if (tmpDread === ' ' && noCheckmarks) {
      
    if (searchWordss[0] === undefined && noCheckmarks) {
        runThis = false;
         showcasedVideos = showcasingAllVideos;
       // showcasedVideos = null;
       //console.log( showcasedVideos);
        console.log('Showing all videos!');
    }
    
    if (runThis) {
    
     showcasedVideos = [];

     for (i = 0; i < searchVars.length; i++) {
       // var compareVid =  parsedVideos[searchVars[i].vids].videos[searchVars[i].subvid];
       var compareVid =  parsedVideos[searchVars[i].vids][searchVars[i].subvid];

       var ignoreRest = false; // sitesList = ['Youtube', 'Niconico', 'BiliBili', 'Twitter', 'VK', 'Others'];
       var isOther = true;
       for (var plorar = 0; plorar < checkMarkBoolean.length; plorar++) {

           if (sitesList[plorar] === compareVid.extractor_key) {
              isOther = false;
              if (checkMarkBoolean[plorar]) {
                ignoreRest = true;
                continue;
              }
           }

           if (sitesList[plorar] === 'Others' && checkMarkBoolean[plorar] && isOther) {
                ignoreRest = true;
                continue;
           }
       }
       
       if (ignoreRest === true) continue;

       // In case there's no search word and if at least one site is excluded, this should skip the comparison process and just add the video on the list
       if (searchWordss[0] === undefined) showcasedVideos.push(i);
       //console.log("Elira Pendora");
       //console.log(searchWordss[0]);

       else {

       var compareStr =  compareVid.title + ' ' + compareVid.id + ' ' + compareVid.uploader + ' ' + compareVid.uploader_id + ' ' + compareVid.upload_date;
       if (compareVid.extractor_key.indexOf("BiliBili") == 0) {
           compareStr += ' av' + compareVid.id + ' BV' + compareVid.id;
       }
       
       if (compareVid.extractor_key.search("BiliBili") >= 0 && compareVid.webpage_url.search(compareVid.id) == -1) {
           //var temort = compareVid.webpage_url.indexOf("BV");
           //compareStr += compareVid.webpage_url.substring(temort);
           compareStr += compareVid.webpage_url.substring(compareVid.webpage_url.indexOf("BV"));
       }
       if (!(compareVid.description === undefined)) {
          compareStr += ' ' + compareVid.description;
       }
       if (!(compareVid.tags === undefined)) {
          try {
          var tagN;
          for (tagN = 0; tagN < compareVid.tags.length; tagN++) {
              compareStr += ' ' + compareVid.tags[tagN];
          }
          } catch(err) {
              compareStr += ' ';
          }
       }

       if (hasSearchWord(compareStr)) {
       // if (compareStr.toLowerCase().trim().indexOf(searchWord.toLowerCase().trim()) > -1) {
          showcasedVideos.push(i);
       }
       }
     }
    }
    //lastSearchword = searchWord;
    //updateShowcase = false;
}

function setSearchWords(searchWord) {
    var tmp4 = [];
    var tmppp = searchWord.toLowerCase().trim();
    var tmppp2 = tmppp.split(" ");


    // One letter search bug prevention
    // oneLetterSearchBugThreshold
    var onlyOneLetters = true;
    for (var ytr = 0; ytr < tmppp2.length; ytr++) {
        if (tmppp2[ytr].length >= oneLetterSearchBugThreshold) {
            onlyOneLetters = false;
            break;
        }
    }
    
    console.log("Balerino");
    console.log(tmppp2);

    if (onlyOneLetters && !exactWordSearch && !(tmppp2[0] === '')) {
        tmppp2 = [""];
        oneLetterBugPrevented = true;
    }

    if (!exactWordSearch) {

      

      for (var k = 0; k < tmppp2.length; k++) {
          
          var tmp5 = tmppp2[k] + "pptenshir";
          if (!(tmp5 === "pptenshir")) tmp4.push(tmppp2[k]);
      }
    
    // In case there's no search word and if at least one site is excluded, this ensures that there will be an empty character to serve as search word
    //if (tmp4[0] === undefined) tmp4.push("");

    } else {
      tmp4.push(tmppp);
    }
    searchWordss = tmp4;
    

    console.log(searchWordss);
    //console.log(searchWordss[0]);
}

function youtubeUploaderFormer(uploaderName,uploaderArray) {
     var returnStr = youtubeChannelLinkFormer(uploaderArray[0]);
     returnStr += uploaderName + ' [<code>' + uploaderArray[0] + '</code>]</a>';
     
     for (var ku = 1; ku < uploaderArray.length; ku++) {
        returnStr += ' ' + youtubeChannelLinkFormer(uploaderArray[ku]) + '[<code>' + uploaderArray[ku] + '</code>]</a>';
     }
     
     return returnStr;
}

function youtubeChannelLinkFormer(youtubeId) {
     return '<a href=\"' + youtubeChannelURLFormer(youtubeId) + '\" target=\"_blank\">';
}

function youtubeChannelURLFormer(youtubeId) {
     var uploader_Str = "https://www.youtube.com/";
     
     if (youtubeId.length === 24 && youtubeId.substring(0,2) === 'UC') {
        return uploader_Str + "channel/" + youtubeId;
     } 
     
     if (youtubeId.charAt(0) === '@') {
        return uploader_Str + youtubeId;
     }
     
     return uploader_Str + "user/" + youtubeId;
}

function hasSearchWord(compareString) {               /*
    // In case there's no search word and if at least one site is excluded, this should skip the comparison process
    console.log(searchWordss[0]);
    if (searchWordss[0] === undefined) return true; */

    var tmp1 = compareString.toLowerCase().trim();
    /* var tmp2 = searchWord.toLowerCase().trim();

    var searchWords = tmp2.split(" ");
    var tmp3 = searchWords;
    var tmp4 = [];

    for (var k = 0; k < searchWords.length; k++) {
        var tmp5 = searchWords[k] + "pptenshi";
        if (!(tmp5 === "pptenshi")) tmp4.push(searchWords[k]);
    }
    
    searchWords = tmp4;

    //console.log(searchWords); 
    */
    var isTheWordHere = [];

    // var hasSearchWords = true;

    for (var i = 0; i < searchWordss.length; i++) {
        isTheWordHere.push(tmp1.indexOf(searchWordss[i].trim()) > -1);

    }

    for (var j = 0; j < isTheWordHere.length; j++) {
        if (isTheWordHere[j] == false) return false;
    }
    
    return true;
}

function createListForUploader(searchWord,uploaderId,checkMarks) {
    showcasedVideos = [];
    
    var noCheckmarks = true;
    var checkMarkBoolean = [];
    for (var pp = 0; pp < checkMarks.length; pp++) {
        if (checkMarks[pp] === undefined || !(checkMarks[pp] === 'true')) {
           checkMarkBoolean.push(false);
        } else {
           checkMarkBoolean.push(true);
           noCheckmarks = false;
        }
    }   /*
    console.log(checkMarks);
    console.log(checkMarkBoolean); 
    console.log(noCheckmarks);*/
    
    for (i = 0; i < searchVars.length; i++) {
       // var compareVid =  parsedVideos[searchVars[i].vids].videos[searchVars[i].subvid];
       var compareVid =  parsedVideos[searchVars[i].vids][searchVars[i].subvid];

       var ignoreRest = false; // sitesList = ['Youtube', 'Niconico', 'BiliBili', 'Twitter', 'VK', 'Others'];
       var isOther = true;
       for (var plorar = 0; plorar < checkMarkBoolean.length; plorar++) {

           if (sitesList[plorar] === compareVid.extractor_key) {
              isOther = false;
              if (checkMarkBoolean[plorar]) {
                ignoreRest = true;
                continue;
              }
           }

           if (sitesList[plorar] === 'Others' && checkMarkBoolean[plorar] && isOther) {
                ignoreRest = true;
                continue;
           }
       }
       var tmpCont = true;
       var tmp2 = uploaderId.trim();

       if (compareVid.extractor_key === "Youtube") {
        for (var hg = 0; hg < compareVid.uploader_id.length; hg++) {
          var tmp1 = compareVid.uploader_id[hg] + ' '; // Seems like some saved uploader_id values are undefined or something similar, VITAL that there is an empty string to not make the site glitch out

          if (tmp1.trim() === tmp2) {
            tmpCont = false;
            break;
          }
        }
       } else {
          var tmp1 = compareVid.uploader_id + ' ';
          if (tmp1.trim() === tmp2) tmpCont = false;
       }

       if (tmpCont) continue;
       
       if (searchWord.trim().length == 0) {
          showcasedVideos.push(i);
          continue;
       }
        
       var compareStr =  compareVid.title + ' ' + compareVid.id + ' ' + compareVid.uploader + ' ' + compareVid.uploader_id + ' ' + compareVid.upload_date;
       if (!(compareVid.description === undefined)) {
          compareStr += ' ' + compareVid.description;
       }
       if (!(compareVid.tags === undefined)) {
           try {
          var tagN;
          for (tagN = 0; tagN < compareVid.tags.length; tagN++) {
              compareStr += ' ' + compareVid.tags[tagN];
          } 
               
           } catch(err) {
              compareStr += ' '; 
           }
           
       }

       if (compareStr.toLowerCase().trim().indexOf(searchWord.toLowerCase().trim()) > -1) {
          showcasedVideos.push(i);
       }
    }
    //lastSearchword = searchWord;
    //lastCheckedUploader = uploaderId;
    //updateShowcase = false;
}

//console.log('List done');


function htmlStrIndex(querie) {
  // Alustetaan HTML-koodia index.html-sivua varten
  var htmlStrIndex = '<hr/><p>' + br + 'Search for videos:' + br;
 
  if ('/YTPMV_Database' === querie) {
     htmlStrIndex += '<form action="YTPMV_Database/results.html" method="GET">';
  } else {
     htmlStrIndex += '<form action="results.html" method="GET">'; 
  }
 
  /* This works too
  if ('/YTPMV_Database/'.localeCompare(querie) == 0 || '/YTPMV_Database/index.html'.localeCompare(querie) == 0) {
     htmlStrIndex += '<form action="results.html" method="GET">';
  } else {
     htmlStrIndex += '<form action="YTPMV_Database/results.html" method="GET">';
  } */
 
  htmlStrIndex +=  br + '<input type="text" name="search" />&nbsp;' + br;
  htmlStrIndex += '<input type="submit" value="Search" />' + br;
  htmlStrIndex += '<input type="hidden" name="' + botCheckName + '" value="' + botCheckValue + '" />' + br;
  htmlStrIndex += '</form><br/>' + br + '</p>' + br + '</body>' + br + '</html>';
  
  return htmlStrIndex;
}

function htmlStrForBot(querie) {
  // Alustetaan HTML-koodia index.html-sivua varten
  var htmlStrIndex = '<hr/><p>' + br + 'Search for videos:' + br;
 
  if ('/YTPMV_Database' === querie) {
     htmlStrIndex += '<form action="YTPMV_Database/results.html" method="GET">';
  } else {
     htmlStrIndex += '<form action="results.html" method="GET">'; 
  }
 
  /* This works too
  if ('/YTPMV_Database/'.localeCompare(querie) == 0 || '/YTPMV_Database/index.html'.localeCompare(querie) == 0) {
     htmlStrIndex += '<form action="results.html" method="GET">';
  } else {
     htmlStrIndex += '<form action="YTPMV_Database/results.html" method="GET">';
  } */
 
  htmlStrIndex +=  br + '<input type="text" name="search" />&nbsp;' + br;
  htmlStrIndex += '<input type="submit" value="Search" />' + br;
  htmlStrIndex += '<input type="hidden" name="' + botCheckName + '" value="' + botCheckValue + '" />' + br;
  htmlStrIndex += '</form><br/>' + br + '</p>' + br + '</body>' + br + '</html>';
  
  return htmlStrIndex;
}

var srvr = http.createServer(function (req, res) {
  var q = url.parse(req.url, true);
    
  console.log(q.pathname);
  console.log(q.query);
  console.log(q.search);
  /*
  console.log(q.query.search);
  console.log(q.query.search === undefined);
  console.log(q.query.page);
  console.log(q.query.page === undefined);
  console.log(q.query.uploader_id);
  console.log(q.query.uploader_id === undefined); */

  var htmlStrBegin = '<!DOCTYPE html>' + br;
  htmlStrBegin += '<html>' + br;

  htmlStrBegin += '<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8">' + br;
  htmlStrBegin += '<link rel="stylesheet" href="../assets/dark_theme_style.css">' + br;


  var tiitle = '<title>YTPMV Metadata Archive</title>';
  var pageNn = q.query.page;
  if (q.query.page === undefined) pageNn = "1";
  else  pageNn = pageNn.trim();

  if (q.pathname === '/YTPMV_Database/results.html') {
     if ((q.query.search === undefined || q.query.search.trim() === '') && (q.query.uploader_id === undefined || q.query.uploader_id.trim() === '')) { tiitle = '<title>YTPMV Metadata Archive - Showing all videos - Page ' + pageNn + '</title>'; }
     else if (!(q.query.search === undefined || q.query.search.trim() === '')) { tiitle = '<title>YTPMV Metadata Archive - Searching: ' + q.query.search.trim() + ' - Page ' + pageNn + '</title>'; }
     
     if (q.query.preview === undefined || q.query.preview.trim() === '' || q.query.preview.trim() === 'false') {
         showVidPrev = false;
     } else {
         showVidPrev = true;
     }
  }
      /*
  if (q.pathname === '/YTPMV_Database/details.html') {

  } */

  htmlStrBegin += tiitle;
  htmlStrBegin += br + '</head>' + br;

  htmlStrBegin += '<body>' + br;
  //htmlStrBegin += '<div><h2>Node.js demo - YTPMV Metadata Archive</h2>Last updated: ' + lastUpdated + '&nbsp;&#124; <a href="https://www.dropbox.com/s/tr9lgsviaf812l8/" target="_blank">Download JSON File</a></div>' + br;
  htmlStrBegin += '<div><h2>YTPMV Metadata Archive</h2>Last updated: ' + lastUpdated + '&nbsp;&#124; <a href="' + dropboxLink + '" target="_blank">Download JSON File</a><br/><br/>See also: <a href="https://polsy.org.uk/stuff/ytrestrict.cgi" target="_blank">YouTube region restriction checker</a> (polsy.org.uk)</div>' + br;


  //  ['Youtube', 'Niconico', 'BiliBili', 'Twitter', 'Soundcloud', 'VK', 'Others'];
  var chekingmarkss = [q.query.Youtube, q.query.Niconico, q.query.BiliBili, q.query.Twitter, q.query.Soundcloud, q.query.VK, q.query.Others];
  //console.log(chekingmarkss);

  exactWordSearch = false;
  if (!(q.query.exactSearch === undefined) && q.query.exactSearch === "true") {
     exactWordSearch = true;
  }

  var searchingFor = q.query.search;
  var searchWordPresent = !(q.query.search === undefined);
  if (!searchWordPresent) searchingFor = ' ';

  var pageNumber = q.query.page;
  var pageListed = !(q.query.page === undefined);
  if (!pageListed) pageNumber = 1;
  if (pageListed) {
       if (!isFinite(pageNumber)) {
          console.log('Page set to 1')
          pageNumber = 1;
       }
       pageNumber = Math.round(pageNumber);
  }
  console.log('Page number is ' + pageNumber);



  var fromUploaderId = q.query.uploader_id;
  var uploaderIdListed = !(q.query.uploader_id === undefined);
  if (!uploaderIdListed) fromUploaderId = nullUploaderPlaceholder;

  const htmPage = '/YTPMV_Database';

  if ((htmPage + '/results.html') === q.pathname) {
     res.writeHead(200, {'Content-Type': 'text/html'});
     var htmlStrSearch = '<hr/><p>' + br + 'Search for videos:' + br;
        htmlStrSearch += '<form action="results.html" method="GET">';
        htmlStrSearch +=  br + '<input type="text" name="search"'
        if (!(searchingFor === undefined)) htmlStrSearch += ' value="' + searchingFor.trim() + '"';
        htmlStrSearch += ' />&nbsp;' + br;
        htmlStrSearch += '<input type="submit" value="Search" />&nbsp;&#124;' + br;
        htmlStrSearch += '<input type="checkbox" id="exactSearch" name="exactSearch" value="true"';
        if (exactWordSearch == true) {
           htmlStrSearch += ' checked="yes"';
        }
        htmlStrSearch += ' /><label for="exactSearch">Exact word search</label>&nbsp;&#124;' + br;

        var linkkeriino = q.search;
        if (!(linkkeriino === null) && linkkeriino.indexOf('preview=') > 0) {
           var inderr  = linkkeriino.indexOf('preview=');
           var inderr2 = linkkeriino.indexOf('&', (inderr + 1));
           if (inderr2 > 0) linkkeriino = linkkeriino.substring(0,inderr) + 'preview=' + !showVidPrev + linkkeriino.substring(inderr2);
           else linkkeriino = linkkeriino.substring(0,inderr) + 'preview=' + !showVidPrev;
        } else {
           linkkeriino += '&preview=' + !showVidPrev;
        }
        htmlStrSearch += '<a href="results.html' + linkkeriino + '">';
        if (showVidPrev == true) htmlStrSearch += 'Hide the video previews';
        else htmlStrSearch += 'Show the video previews';

        htmlStrSearch += '</a><br/><br/>' + br;

        htmlStrSearch += '<input type="hidden" name="' + botCheckName + '" value="' + botCheckValue + '" />' + br;

        // Create a bunch of checkboxes
        htmlStrSearch += 'Exclude from search: ' + br;
        var orep;
        for (orep = 0; orep < sitesList.length; orep++) {
           var tempww = chekingmarkss[orep];
           if (tempww === undefined || !(tempww === 'true')) {
              tempww = false;
           }
           htmlStrSearch += '<input type="checkbox" id="' + sitesList[orep] + '" name="' + sitesList[orep] + '" value="true"';
           if (tempww === 'true') {
              htmlStrSearch += ' checked="yes"';
           }
           htmlStrSearch += '><label for="' + sitesList[orep] + '">&nbsp;' + sitesList[orep] + '</label>' + br;
        }


        htmlStrSearch += '</form>';

        res.write(htmlStrBegin);
        res.write('<div>' + htmlStrSearch + '</div>');
     /*
     var tmperd = q.search;
     var tmperd2 = tmperd.indexOf(botCheckName + '=' + botCheckValue); */
     var tmpppp = botCheckName + '=' + botCheckValue;
     // console.log(q.query.search);

     if (q.search === null || (!(q.search === undefined) && q.search.indexOf(tmpppp) == -1)) {
         var linkkir = q.search + '&' + tmpppp;
         if (q.search === null) {
             linkkir = '?' + tmpppp;
         }
        res.write('<hr/><div><i>Added on 2022/05/23:</i></div><br/><h3>This page is part of an attempt to lessen the load on the server caused by the search bots. Click <a href="results.html' + linkkir + '">here</a> or the Search button to resume your search.</h3>');
     }
     
     else {

        res.write('<div>' + showList(searchingFor, fromUploaderId, pageNumber, chekingmarkss) + '</div>');
     }
        res.write(/* br + '<!-- Links to videos on archive.org removed due to request by vxbinaca (2022/05/26) -->' + */ br + '</body></html>');
     
        // ['Youtube', 'Niconico', 'BiliBili', 'Twitter', 'VK'];

        forceGC();
     res.end();
  }
  
  if (htmPage === q.pathname || (htmPage + '/') === q.pathname || (htmPage + '/index.html') === q.pathname) {
     res.writeHead(200, {'Content-Type': 'text/html'});
     
     res.write(htmlStrBegin);
     res.write(htmlStrIndex(q.pathname));

     res.end();
  }
  
  else {
      console.log('Tried to get to: ' +  q.pathname);
      res.writeHead(404, {'Content-Type': 'text/html'});
      res.end("404 Not Found. Tried to get to: " +  q.pathname);
  }

  
  //console.log('Cleaning');
  //forceGC();

//}).listen(8080);
});

srvr.listen(3535);