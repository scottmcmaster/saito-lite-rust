module.exports = (region, sobj) => {

  let results_text = "Region Tied";
  let bonus_events = "";
  let winner_css = "winner-tied";

console.log(JSON.stringify(sobj));

  let us_bg  = `${sobj.us.bg} battleground`;
  let us_nbg = `${sobj.us.total - sobj.us.bg} non-battleground`;
  let ussr_bg  = `${sobj.ussr.bg} battleground`;
  let ussr_nbg = `${sobj.ussr.total - sobj.ussr.bg} non-battleground`;
  if (sobj.us.bg != 1) { us_bg += "s"; }
  if (sobj.ussr.bg != 1) { ussr_bg += "s"; }
  if ((sobj.us.total-sobj.us.bg) != 1) { us_nbg += "s"; }
  if ((sobj.ussr.total-sobj.ussr.bg) != 1) { ussr_nbg += "s"; }

  if (sobj.us.vp > sobj.ussr.vp) { results_text = `US wins +${sobj.us.vp-sobj.ussr.vp} VP`; winner_css = "winner-us"; }
  if (sobj.us.vp < sobj.ussr.vp) { results_text = `USSR wins +${sobj.ussr.vp-sobj.us.vp} VP`; winner_css = "winner_ussr"; }
  if (sobj.bonus.length > 0) {
    bonus_events = `
      <div class="scoring-bonus-title">Bonus Points</div>  
      <div class="scoring-event-grid"></div>
    `;
  }

  let html = `

    <div class="scoring-overlay ${region}-scoring ${winner_css}">

        <div class="card card-hud"><img class="cardimg" src="/twilight/img/en/TNRnTS-01.svg"><img class="cardimg" src="/twilight/img/EarlyWar.svg"><img class="cardimg" src="/twilight/img/BothPlayerCard.svg"><img class="cardimg" src="/twilight/img/MayNotBeHeld.svg"></div>
     
        <div class="scoring-box">
          <div class="scoring-result-title">${results_text}</div>   
	  <div class="scoring-text">US controls ${us_bg} and ${us_nbg} for ${sobj.us.status}</div>
	  <div class="scoring-text">USSR controls ${ussr_bg} ${ussr_nbg} for ${sobj.ussr.status}</div>
          ${bonus_events}
	</div>

    </div>

  `;

  return html;

}

