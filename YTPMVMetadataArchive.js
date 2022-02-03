//requiring path and fs modules
const fs = require('fs');
const url = require('url');
const http = require('http');

// https://www.xarg.org/2016/06/forcing-garbage-collection-in-node-js-and-javascript/
function forceGC() {
   if (global.gc) {
      global.gc();
   } else {
      console.warn('No GC hook! Start your program as `node --expose-gc file.js`.');
   }
}

const br =  '\r\n';

console.log('Started forming the server')  ;

// Original
console.log('Loading metadata...')  ;

const lastUpdated = '20220131 [YYYYMMDD]';
const videosPerPage = 25;
const dropboxLink = 'https://www.dropbox.com/sh/veadx97ot0pmhvs/AACiy1Pqa7dMj33v-yqG_1GYa?dl=0';
var showcasedVideos;
// This is for cases when a user searches with an empty string, which shows all results
var showcasingAllVideos = [];
var nullUploaderPlaceholder = 'skaPiPiduuDelierp';

var parsedVideos = [];
// Remember edit elsewhere if you edit this!!
var sitesList = ['Youtube', 'Niconico', 'BiliBili', 'Twitter', 'Soundcloud', 'VK', 'Others']; // extractor_key
var y;
var minY = 0;
var maxY = 27;
for (y = minY; y <= maxY; y++) {
   //var terappi = 'vidJson/vids' + y + '.json';
   var terappi = 'vidJson/vids' + y + '.json';
   console.log('Loading ' + terappi)  ;
   var teray = fs.readFileSync(terappi, 'utf8');
   console.log('Check 1')  ;
   forceGC();
   console.log('Check 2')  ;
   parsedVideos.push(JSON.parse(teray));
   console.log('Check 3')  ;
   forceGC();
   console.log('Loaded!')  ;
}
forceGC();

console.log('All metadata loaded! Sorting things out...')  ;

var searchVars = [];
var overaro = 0;
for (y = minY; y <= maxY; y++) {
   var perryPla;

   for (perryPla = 0; perryPla < parsedVideos[y - minY].videos.length; perryPla++) {
       var pusherian = {id: overaro, vids: (y - minY), subvid: perryPla};
       overaro++;
       //console.log(pusherian);
       searchVars.push (pusherian );
   }
}

console.log('Chack gamma ' + searchVars[100].vids)  ;

searchVars = searchVars.sort(function(a,b) {
       var tmpA = getVideo(a.id);
       var tmpB = getVideo(b.id);


       var nameA = (tmpA.title + ' ' + tmpA.id).toUpperCase();
       var nameB = (tmpB.title + ' ' + tmpB.id).toUpperCase();
       
       var dateA = tmpA.upload_date ;
       var dateB = tmpB.upload_date ;

       //forceGC();

       if (dateA === undefined) dateA = "000000";
       if (dateB === undefined) dateB = "000000";


       var compA = dateA + ' -- ' + nameA;
       var compB = dateB + ' -- ' + nameB;
       //console.log(compA);

       if (compA < compB) {
          return 1; //nameB comes first
       }
       if (compA > compB) {
          return -1; // nameA comes first
       }
       return 0;  // names must be equal

    });

console.log("Yeees!");

var otrpi;
for (otrpi = 0; otrpi < searchVars.length; otrpi++) {
    showcasingAllVideos[otrpi] = otrpi;
}

//var parsedVideos = JSON.parse(fs.readFileSync('YTPMV-2021-06-01.json', 'utf8'));
//const parsedVideos = require('./YTPMV Metadata Archive JSON/YTPMV-2021-06-12.json');


console.log('Loaded! Carbage collecting...');

forceGC();

console.log('Done?');

// Uploaders whose videos are either deleted or scarcely available. This adds a link to the assumed reuploads at Archive.org
const exceptionUsers = ['Rlcemaster3',
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

function getVideo(orderNumber) {
   var terpm = searchVars[orderNumber];
   //console.log(terpm);
   return parsedVideos[terpm.vids].videos[terpm.subvid];
}

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

function addSiteCheckmarks(checkMarks) {   // ['Youtube', 'Niconico', 'BiliBili', 'Twitter', 'Soundcloud', 'VK', 'Others'];
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
    return returnStr;
}

function showList(searchWord, searchUploaderId,page,checkMarks) {
    var searchingForUploaderToo = !(searchUploaderId.localeCompare(nullUploaderPlaceholder) == 0);
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
    
    var searchWordTmp = 'search=' + searchWord + '&';
    // If the search word is an empty string, no search word is added to the page links
    if ((searchWord.trim() + ' ') == ' ') {
        searchWordTmp = '';
    }

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
             linkThing += '<a href="results.html?' + searchWordTmp + 'page=1';
             if (searchingForUploaderToo) {
                 linkThing += '&uploader_id=' + searchUploaderId;
             }
             linkThing += addSiteCheckmarks(checkMarks);
             linkThing += '">&#171;&nbsp;1</a> &#9674; ' + br;
         }

         if (currentPage == 1) {
             linkThing += '<b>&#139;1&#155;</b> &#9674; ' + br;
             if (totalPages == 2) {
                linkThing += '<a href="results.html?' + searchWordTmp + 'page=2';
                if (searchingForUploaderToo) {
                 linkThing += '&uploader_id=' + searchUploaderId;
                }
                linkThing += addSiteCheckmarks(checkMarks);
                linkThing += '">2&nbsp;&#187;</a>' + br;
                keepGoing = false;
             }
             if (keepGoing && totalPages > 2) {
                linkThing += '<a href="results.html?' + searchWordTmp + 'page=2';
                if (searchingForUploaderToo) {
                   linkThing += '&uploader_id=' + searchUploaderId;
                }
                linkThing += addSiteCheckmarks(checkMarks);
                linkThing += '">2&nbsp;&#155;</a> &#9674; ' + br;
                linkThing += '<a href="results.html?' + searchWordTmp + 'page=' + totalPages;
                if (searchingForUploaderToo) {
                   linkThing += '&uploader_id=' + searchUploaderId;
                }
                linkThing += addSiteCheckmarks(checkMarks);
                linkThing +='">' + totalPages + '&nbsp;&#187;</a>' + br;
                keepGoing = false;
             }
         }

         if (keepGoing && currentPage == 2 && totalPages == 2) {
             linkThing += '<b>&#139;2&#155;</b>';
             keepGoing = false;
         }

         if (keepGoing && currentPage == totalPages) {
             linkThing += '<a href="results.html?' + searchWordTmp + 'page=' + (totalPages - 1);
             if (searchingForUploaderToo) {
                 linkThing += '&uploader_id=' + searchUploaderId;
             }
             linkThing += addSiteCheckmarks(checkMarks);
             linkThing += '">&#139;&nbsp;' + (totalPages - 1) + '</a> &#9674; ' + br;
             linkThing += '<b>&#139;' + totalPages + '&#155;</b>';
             keepGoing = false;
         }
         
         if (keepGoing) {
             var previousPage = currentPage - 1;
             var nextPage = currentPage - 1 + 2;
             if (currentPage > 2) {
                linkThing += '<a href="results.html?' + searchWordTmp + 'page=' + previousPage;
                if (searchingForUploaderToo) {
                    linkThing += '&uploader_id=' + searchUploaderId;
                }
                linkThing += addSiteCheckmarks(checkMarks);
                linkThing +='">&#139;&nbsp;' + previousPage + '</a> &#9674; ' + br;
             }
             linkThing += '<b>&#139;' + currentPage + '&#155;</b> &#9674; ' + br;
             if (nextPage != totalPages) {
                linkThing += '<a href="results.html?' + searchWordTmp + 'page=' + nextPage;
                if (searchingForUploaderToo) {
                    linkThing += '&uploader_id=' + searchUploaderId;
                }
                linkThing += addSiteCheckmarks(checkMarks);
                linkThing += '">' + nextPage + '&nbsp;&#155;</a> &#9674; ' + br;
             }
             linkThing += '<a href="results.html?' + searchWordTmp + 'page=' + totalPages;
             if (searchingForUploaderToo) {
                    linkThing += '&uploader_id=' + searchUploaderId;
                }

             linkThing += addSiteCheckmarks(checkMarks);
             linkThing += '">' + totalPages + '&nbsp;&#187;</a>' + br;
         }
    }
    
    videoList += linkThing;

    videoList += '<br/>Search word: "' + unableCodingInSearch(searchWord) + '"';
    // TEST
    if (searchingForUploaderToo) {
    videoList += '<br/>Searched Uploader ID: "' + unableCodingInSearch(searchUploaderId) + '"';
    //videoList += '</div>';
}

    for (i = startValue; i < endValue; i++) {
       videoList += '<hr/><div>' + br;
       var listedVideo = getVideo(showcasedVideos[i]);
       videoList += '<b>' + listedVideo.title + '</b> (' + formatDuration(listedVideo.duration) +')<br/>' + br;

       // Video link
       var vidTmp = '<code><a href=\"' + listedVideo.webpage_url + '\" target=\"_blank\">' + listedVideo.webpage_url + '</a></code>';
       
       if (listedVideo.extractor_key.search("Youtube") >= 0) {
           var vidTmp2 = 'https://www.youtube.com/watch?v=' + listedVideo.id;
           
           vidTmp = '<code><a href=\"' + vidTmp2 + '\" target=\"_blank\">' + vidTmp2 + '</a></code>';
       }
       
       if (listedVideo.extractor_key.search("Niconico") >= 0) {
           var vidTmp2 = 'https://www.nicovideo.jp/watch/' + listedVideo.id;
           
           vidTmp = '<code><a href=\"' + vidTmp2 + '\" target=\"_blank\">' + vidTmp2 + '</a></code>';
       }
       
       if (listedVideo.extractor_key.search("BiliBili") >= 0) {
           var vidTmp2 = listedVideo.webpage_url;
           var terraip = vidTmp2.indexOf('&');
           if (terraip != -1) vidTmp2 = vidTmp2.substring(0,terraip);
           terraip = vidTmp2.indexOf('?p=1');
           if (terraip != -1 && vidTmp2.substring(terraip).length == 4) vidTmp2 = vidTmp2.substring(0,terraip);
           
           
           vidTmp = '<code><a href=\"' + vidTmp2 + '\" target=\"_blank\">' + vidTmp2 + '</a></code>';
       }
       
       videoList += vidTmp;
       
       if (listedVideo.extractor_key.search("BiliBili") >= 0 && listedVideo.webpage_url.search(listedVideo.id) == -1) {
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
       
       var uploader_Str = '<a href=\"' + listedVideo.uploader_url + '\" target=\"_blank\">' + listedVideo.uploader + ' [<code>' + listedVideo.uploader_id + '</code>]</a>';

       if (listedVideo.uploader == null && listedVideo.uploader_id == null) {
          uploader_Str = '<code>undefined</code>';
       } else if (listedVideo.uploader_id == null) {
          uploader_Str = listedVideo.uploader;
       }

       videoList += 'Uploader: ' + uploader_Str + '<br/>' + br;
       videoList += 'Release date: ' + listedVideo.upload_date + '<br/><br/>' + br;
       
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
       videoList += br + '<br/><br/><a href="results.html?uploader_id=' + listedVideo.uploader_id + addSiteCheckmarks(checkMarks) + '">Search more videos from <code>' + listedVideo.uploader + '</code></a><br/>' + br;
       videoList += '<a href="results.html?search=' + searchWord + '&uploader_id=' + listedVideo.uploader_id + addSiteCheckmarks(checkMarks) + '">Search more videos from <code>' + listedVideo.uploader + '</code> with the current search word</a>';
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
    if (videoInfo.uploader_id == null) {
        return false;
    }

    return isTheUserSame_String(videoInfo.uploader_id.trim(), uploaderName);
}

function isTheUserSame_String(videoUploader, uploaderName) {
    return (videoUploader.localeCompare(uploaderName) == 0);
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
                
                linkingPark = linkingPark + '&nbsp;<code><a href="results.html?search=' + temperar + '">[Search with this ID]</a></code>';
            }
            
            tarkLink = "youtu.be/";
            if (linkara.indexOf(tarkLink) > -1) {
                var temperar = linkara.substring((linkara.indexOf(tarkLink) + tarkLink.length));
                if (temperar.length > 11) {
                   temperar = temperar.substring(0, 11);
                }
                
                linkingPark = linkingPark + '&nbsp;<code><a href="results.html?search=' + temperar + '">[Search with this ID]</a></code>';
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
                
                linkingPark = linkingPark + '&nbsp;<code><a href="results.html?search=' + temperar + '">[Search with this ID]</a></code>';
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
                
                linkingPark = linkingPark + '&nbsp;<code><a href="results.html?search=' + temperar + '">[Search with this ID]</a></code>';
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
                
                linkingPark = linkingPark + '&nbsp;<code><a href="results.html?search=' + temperar + '">[Search with this ID]</a></code>';
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
                
                linkingPark = linkingPark + '&nbsp;<code><a href="results.html?search=' + temperar + '">[Search with this ID]</a></code>';
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
                
                linkingPark = linkingPark + '&nbsp;<code><a href="results.html?search=' + temperar + '">[Search with this ID]</a></code>';
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
    
    if (ogDescription == null) {
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

function createList(searchWord,checkMarks) {
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
    var tmpDread = searchWord.trim() + ' ';
    if (tmpDread == ' ' && noCheckmarks) {
        runThis = false;
        showcasedVideos = showcasingAllVideos;
        console.log('Showing all videos!');
    }
    
    if (runThis) {
    
     showcasedVideos = [];

     for (i = 0; i < searchVars.length; i++) {
       var compareVid =  parsedVideos[searchVars[i].vids].videos[searchVars[i].subvid];

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

       if (compareStr.toLowerCase().trim().indexOf(searchWord.toLowerCase().trim()) > -1) {
          showcasedVideos.push(i);
       }
     }
    }
    //lastSearchword = searchWord;
    //updateShowcase = false;
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
       var compareVid =  parsedVideos[searchVars[i].vids].videos[searchVars[i].subvid];

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

       var tmp1 = compareVid.uploader_id + ' '; // Seems like some saved uploader_id values are undefined or something similar, VITAL that there is an empty string to not make the site glitch out
       var tmp2 = uploaderId.trim();
       if (tmp1.trim().localeCompare(tmp2) != 0) continue;
       
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
 
  if ('/YTPMV_Database'.localeCompare(querie) == 0) {
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
  htmlStrIndex += '</form><br/>' + br + '</p>' + br + '</body>' + br + '</html>';
  
  return htmlStrIndex;
}

var htmlStrBegin = '<!DOCTYPE html>' + br;
htmlStrBegin += '<html>' + br;

htmlStrBegin += '<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8">' + br;
htmlStrBegin += '<link rel="stylesheet" href="../assets/dark_theme_style.css">' + br;
htmlStrBegin += '<title>Node.js demo - YTPMV Metadata Archive</title>' + br;
htmlStrBegin += '</head>' + br;

htmlStrBegin += '<body>' + br;
//htmlStrBegin += '<div><h2>Node.js demo - YTPMV Metadata Archive</h2>Last updated: ' + lastUpdated + '&nbsp;&#124; <a href="https://www.dropbox.com/s/tr9lgsviaf812l8/" target="_blank">Download JSON File</a></div>' + br;
htmlStrBegin += '<div><h2>Node.js demo - YTPMV Metadata Archive</h2>Last updated: ' + lastUpdated + '&nbsp;&#124; <a href="' + dropboxLink + '" target="_blank">Download JSON File</a></div>' + br;
// Hosted by FinnOtaku &#151; 

http.createServer(function (req, res) {
  var q = url.parse(req.url, true);
    
  console.log(q.pathname);
  console.log(q.query);
  console.log(q.search);
  console.log(q.query.search);
  console.log(q.query.search === undefined);
  console.log(q.query.page);
  console.log(q.query.page === undefined);
  console.log(q.query.uploader_id);
  console.log(q.query.uploader_id === undefined);

  //  ['Youtube', 'Niconico', 'BiliBili', 'Twitter', 'Soundcloud', 'VK', 'Others'];
  var chekingmarkss = [q.query.Youtube, q.query.Niconico, q.query.BiliBili, q.query.Twitter, q.query.Soundcloud, q.query.VK, q.query.Others];
  //console.log(chekingmarkss);

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
  }
  console.log('Page number is ' + pageNumber);
  


  var fromUploaderId = q.query.uploader_id;
  var uploaderIdListed = !(q.query.uploader_id === undefined);
  if (!uploaderIdListed) fromUploaderId = nullUploaderPlaceholder;

  const htmPage = '/YTPMV_Database';

  if ((htmPage + '/results.html').localeCompare(q.pathname) == 0) {
     res.writeHead(200, {'Content-Type': 'text/html'});

     var htmlStrSearch = '<hr/><p>' + br + 'Search for videos:' + br;
     htmlStrSearch += '<form action="results.html" method="GET">';
     htmlStrSearch +=  br + '<input type="text" name="search"'
     if (!(searchingFor === undefined)) htmlStrSearch += ' value="' + searchingFor.trim() + '"';
     htmlStrSearch += ' />&nbsp;' + br;
     htmlStrSearch += '<input type="submit" value="Search" />&nbsp;&#124;' + br;

     // Create a bunch of checkboxes
     htmlStrSearch += ' Exclude: ' + br;
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
     res.write('<div>' + showList(searchingFor, fromUploaderId, pageNumber, chekingmarkss) + '</div>');
     res.write('</body></html>');
     
     // ['Youtube', 'Niconico', 'BiliBili', 'Twitter', 'VK'];

     forceGC();

     res.end();
  }
  
  if (htmPage.localeCompare(q.pathname) == 0 || (htmPage + '/').localeCompare(q.pathname) == 0 || (htmPage + '/index.html').localeCompare(q.pathname) == 0) {
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
}).listen(3535);