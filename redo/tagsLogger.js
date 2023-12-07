let fs = require('fs');

let tagsAll = {};

const tagThreshold = 100;

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

       }
      }

      //tagsAll.push(...tmpNicoEdit);

  } catch(e) {
      console.error(`${e.name}: ${e.message}`);
      //console.log("Oh wait, that doesn't exist");
  }
}

let maxY = 49;
let minY = 1;

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

var tmpTaags = Object.keys(tagsAll);

var tagsComp2 = [];

for (let k = 0; k < tmpTaags.length; k++) {
   if (tagsAll[tmpTaags[k]] >= tagThreshold) tagsComp2.push(tmpTaags[k]);
}
console.log(tagsComp2);

fs.writeFileSync('F:/Dropbox/NodeJS/YTPMV Metadata Archive JSON/tags.json', JSON.stringify(tagsComp2));