//requiring path and fs modules
var path = require('path');
var fs = require('fs');
const url = require('url');
const http = require('http');
const XMLHttpRequest_node = require("xmlhttprequest").XMLHttpRequest;

const br =  '\r\n';

const folderSrc = 'F:/tmpvid';
var gatheredJson = [];

let files = fs.readdirSync(folderSrc);
   //fs.readdir(folderSrc, (err, files) => {
     // if (err) throw err;

      files.forEach(file => {
         let tmpSrc = folderSrc + '/' + file;


         gatheredJson.push(JSON.parse(fs.readFileSync(tmpSrc, 'utf8')));
         console.log(tmpSrc);

      });
   //});

   console.log(gatheredJson);
   fs.writeFileSync('F:/tmpvvid.json', JSON.stringify(gatheredJson));
