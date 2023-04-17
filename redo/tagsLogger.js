var fs = require('fs');

var tagsAll = {};

{

  try {
      console.log("Niconico");
      let tmpNico = [];
      tmpNico.push(JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/nicoTags2.json', 'utf8')));
      tmpNico.push(JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/nicoTags.json', 'utf8')));
      console.log('Loaded!')  ;
      
      let tmpNicoEdit = [];

      for (let tnp = 0; tnp < tmpNico.length; tnp++) {
       for (let nicoVid = 0; nicoVid < tmpNico[tnp].length; nicoVid++) {
         let checkingTags = tmpNico[tnp][nicoVid].tags;

         if (checkingTags.length === 0) continue;

         let checkke = [["&#x27;","'"],["&amp;","&"],["_"," "]];

         for (let tt = 0; tt < checkingTags.length; tt++) {
            for (let pp = 0; pp < checkke.length; pp++) {
               let teeew = checkingTags[tt].indexOf(checkke[pp][0]);
               while (teeew > -1) {
                  let tmoo1 = checkingTags[tt].substring(0,checkingTags[tt].indexOf(checkke[pp][0]));
                  let tmoo2 = checkingTags[tt].substring(checkingTags[tt].indexOf(checkke[pp][0]) + checkke[pp][0].length);
                  checkingTags[tt] = tmoo1 + checkke[pp][1] + tmoo2;
                  teeew = checkingTags[tt].indexOf(checkke[pp][0]);
                  console.log(tnp + " -- Patched Niconico tags for " + tmpNico[tnp][nicoVid].id);
               }
            }
         }

         for (let tre = 0; tre < checkingTags.length; tre++) {
            let tmpTag =  checkingTags[tre].toLowerCase().trim();

            if (tagsAll[tmpTag]) {
               tagsAll[tmpTag]++;
            } else {
               tagsAll[tmpTag] = 1;
            }
         }

         //tagsAll.push(...checkingTags);
         //tmpNicoEdit.push(...checkingTags);
         //tmpNico[nicoVid].tags = checkingTags;
       }
      }

      //tagsAll.push(...tmpNicoEdit);

  } catch(e) {
      console.error(`${e.name}: ${e.message}`);
      //console.log("Oh wait, that doesn't exist");
  }
}

//const tagsList = JSON.parse(fs.readFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/tags.json', 'utf8'));
/*
var maxY = 202312;
var minY = 200401;
var tagsAll = [];
{
  let parsedVideos = [];

  for (let y = maxY; y >= minY; y--) {
                //F:\Dropbox\NodeJS\YTPMV Metadata Archive JSON\split_parts2
   let terappi = 'F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts2/vids' + y + '.json';
   //let terappi = 'vidJson2/vids' + y + '.json';
   console.log('Loading ' + terappi)  ;
   try {
      parsedVideos.push(...JSON.parse(fs.readFileSync(terappi, 'utf8')));
      console.log('Loaded!')  ;
   } catch(e) {
      //console.error(`${e.name}: ${e.message}`);
      console.log("Oh wait, that doesn't exist");
   }
  }

  for (let x = 0; x < parsedVideos.length; x++) {
    let tmp1 = parsedVideos[x].tags;

    if (tmp1 === undefined || tmp1 === null || tmp1.length === 0) continue;
    console.log("Handling: " + parsedVideos[x].upload_date + " --- " + parsedVideos[x].id) ;
   
    tagsAll.push(...tmp1);
  }
}      */

var maxY = 42;
var minY = 1;

{
  let parsedVideos = [];

  for (let y = maxY; y >= minY; y--) {
                 //F:\Dropbox\NodeJS\YTPMV Metadata Archive JSON\split_parts2
    let terappi = 'F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/split_parts/vids' + y + '.json';
    //let terappi = 'vidJson2/vids' + y + '.json';
    console.log('Loading ' + terappi)  ;
    try {
       let fileTmp = JSON.parse(fs.readFileSync(terappi, 'utf8'))["videos"];
       

       parsedVideos.push(...fileTmp.map(ent => ent.tags));
       console.log('Loaded!')  ;
    } catch(e) {
       console.error(`${e.name}: ${e.message}`);
       //console.log("Oh wait, that doesn't exist");
    }
  }


  //let gatheredIds = [];

  for (let x = 0; x < parsedVideos.length; x++) {
    let tmp1 = parsedVideos[x];

    if (tmp1 === undefined || tmp1 === null || tmp1.length === 0 /* || gatheredIds.includes(parsedVideos[x].id) */ ) continue;
    console.log(x + " / " + parsedVideos.length ); // + " -- Handling: " + parsedVideos[x].upload_date + " --- " + parsedVideos[x].id) ;
    //gatheredIds.push(parsedVideos[x].id);

    //tagsAll.push(...tmp1);
    
    for (let tre = 0; tre < tmp1.length; tre++) {
        let tmpTag =  tmp1[tre].toLowerCase().trim();

        if (tagsAll[tmpTag]) {
           tagsAll[tmpTag]++;
        } else {
           tagsAll[tmpTag] = 1;
        }
    }
  }
  

}


           /*
var tagsComp = {};

let numm = 0;
tagsAll.forEach(tag => {
  let tmpTag = tag.toLowerCase().trim();
  //let tmpTag = '';
  //if (typeof tag === "string") tmpTag = tag.toLowerCase().trim();
  //else tmpTag = tagsList[tag];
  numm++;

  if (tagsComp[tmpTag]) {
    tagsComp[tmpTag]++;
  } else {
    tagsComp[tmpTag] = 1;
    console.log("Added: " + tmpTag);
  }
  console.log(numm + " / " + tagsAll.length);
});     */

         /*
var tagsComp = [];

for (let j = 0; j < tagsAll.length; j++) {
      let tmp2 = tagsComp.find(ent => ent.tag === tagsAll[j].toLowerCase().trim());
      if (tmp2 === undefined) {
          tagsComp.push({"tag":tagsAll[j].toLowerCase().trim(),"amount":1});
          console.log("Added: " + tagsComp[tagsComp.length - 1].tag);
      } else {
          tmp2.amount = tmp2.amount + 1;
      }
      console.log(j + " / " + tagsAll.length + " -- Unique tags amount: " + tagsComp.length);
}      */

//console.log(tagsComp);

    /*
var tagsComp2 = [];

for (let k = 0; k < tagsComp.length; k++) {
   if (tagsComp[k].amount > 500) tagsComp2.push(tagsComp[k].tag);
}       */

var tmpTaags = Object.keys(tagsAll);

var tagsComp2 = [];

for (let k = 0; k < tmpTaags.length; k++) {
   if (tagsAll[tmpTaags[k]] > 100) tagsComp2.push(tmpTaags[k]);
}
console.log(tagsComp2);

fs.writeFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/tags.json', JSON.stringify(tagsComp2));