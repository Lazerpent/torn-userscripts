// ==UserScript==
// @name         Torn: Loot timer on NPC profile
// @namespace    lugburz.show_timer_on_npc_profile
// @version      0.1
// @description  Add a countdown timer to desired loot level on the NPC profile page.
// @author       Lugburz
// @match        https://www.torn.com/profiles.php*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

// Desired loot lebel to track (4 by default)
const LOOT_LEVEL = 4;

const IDs = [4, 10, 15]; // Duke, Scrooge, Leslie
const ROMAN = ['I', 'II', 'III', 'IV', 'V'];

const yata_api = async () => {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest ( {
      method: "GET",
      url: 'https://yata.alwaysdata.net/loot/timings/',
      headers: {
        "Content-Type": "application/json"
      },
      onload: (response) => {
          try {
            const resjson = JSON.parse(response.responseText)
            resolve(resjson)
          } catch(err) {
            reject(err)
          }
      },
      onerror: (err) => {
        reject(err)
      }
    })
  })
}

async function getTimings(id) {
    const timings = await yata_api();
    if (timings.error)
        return 'YATA API error';
    // no data on the id
    if (!timings[id])
        return -1;
    // time till desired loot level
    return timings[id]["timings"][LOOT_LEVEL]["due"];
}

(function() {
    'use strict';

    // Your code here...
    const profileId = RegExp(/XID=(\d+)/).exec($(location).attr('href'))[1];
    if (IDs.includes(Number(profileId))) {
        getTimings(profileId).then((time) => {
            if (time < 0) {
                return;
            }

            var x = setInterval(function() {
                // Time calculations for days, hours, minutes and seconds
                const hours = Math.floor((time % (60 * 60 * 24)) / (60 * 60));
                const minutes = Math.floor((time % (60 * 60)) / 60);
                const seconds = Math.floor((time % (60)));

                // Display the result
                const span = $('#profileroot').find('div.profile-status').find('div.profile-container').find('div.description').find('span.sub-desc');
                let html = $(span).html();
                const n = html.indexOf('(');
                html = html.substring(0, n != -1 ? n-1 : html.length);
                $(span).html(html + " (Till loot level " + ROMAN[LOOT_LEVEL-1] + ": " + hours + "h " + minutes + "m " + seconds + "s)");

                time--;
            }, 1000);
        });
    }
})();

