//requiring path and fs modules
const fs = require('fs');
const url = require('url');
const http = require('http');

var tmp = '<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><link rel="stylesheet" href="https://finnrepo.a2hosted.com/assets/dark_theme_style.css"></head><body>';
       
var minn = 1;
var maxx = 100;

for (var i = minn; i<= maxx; i++) {
   //var tmp2 = '<a href="https://finnrepo.a2hosted.com/YTPMV_Database/results.html?page=' + i +  '" target="_blank">Archive Page ' + i +  '</a><br/><br/>';
   //var tmp2 = '<a href="https://archive.ph/?run=1&url=https://finnrepo.a2hosted.com/YTPMV_Database/results.html?page=' + i +  '" target="_blank">Archive Page ' + i +  '</a><br/><br/>';
   // var tmp2 = '<a href="https://archive.ph/?run=1&url=https://finnrepo.a2hosted.com/YTPMV_Database_Json/vids' + i + '.json" target="_blank">Archive Page ' + i +  '</a><br/><br/>';
   // var tmp2 = '<a href="https://archive.ph/?run=1&url=https://finnrepo.a2hosted.com/YTPMV_Database/results.html?hey_didyou_know=selentatsuki_is_cool%26page=' + i +  '%26uploader_id=Rlcemaster3" target="_blank">Archive Page ' + i +  '</a><br/><br/>';
   // var tmp2 = '<a href="https://archive.ph/?run=1&url=https://finnrepo.a2hosted.com/YTPMV_Database/results.html?hey_didyou_know=selentatsuki_is_cool%26page=' + i +  '" target="_blank">Archive Page ' + i +  '</a><br/><br/>';
   // var tmp2 = '<a href="https://archive.ph/?run=1&url=https://finnrepo.a2hosted.com/YTPMV_Database/results.html?hey_didyou_know=selentatsuki_is_cool%26search=202209%26page=' + i +  '" target="_blank">Archive Page ' + i +  '</a><br/><br/>';
   var tmp2 = '<a href="https://archive.ph/?run=1&url=https://w.atwiki.jp/onseimad/pages/' + i +  '.html" target="_blank">Archive Page ' + i +  '</a><br/><br/>';

   tmp = tmp + tmp2;
}

tmp = tmp + "</body></html>";

fs.writeFileSync('archivalPage-atwiki2.html', tmp);