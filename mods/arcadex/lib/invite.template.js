module.exports = (app, mod, invite) => {

  /* this component should be moved to a saito-module templaye */
    let html = `
          <div class="saito-module saito-game" data-id="abcd1234" data-cmd="join" data-name="${invite.name}" data-game="${invite.game}" style="background-image: url('/${invite.game}/img/arcade/arcade.jpg');">

            <div class="saito-module-titlebar">
                <span class="saito-module-titlebar-title">${invite.name}</span>
                <div class="saito-module-titlebar-details game-type">${(invite.type).toUpperCase()} GAME</div>
            </div>
            
            <div class="saito-module-details saito-game-identicons">
                
    `;


    for (let i=0; i<invite.players; i++) {
      if (i%2 == 0) {
        html += `
              <div class="tip">
                <img class="saito-module-identicon saito-identicon" id-tSFrTSkwE7HNFUzbN4wUsPEwog42Q5XwWEP24EgVxcu2" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MjAnIGhlaWdodD0nNDIwJyBzdHlsZT0nYmFja2dyb3VuZC1jb2xvcjpyZ2JhKDI0MCwyNDAsMjQwLDEpOyc+PGcgc3R5bGU9J2ZpbGw6cmdiYSgyMTcsOTIsMzgsMSk7IHN0cm9rZTpyZ2JhKDIxNyw5MiwzOCwxKTsgc3Ryb2tlLXdpZHRoOjIuMTsnPjxyZWN0ICB4PScxNjgnIHk9JzAnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScxNjgnIHk9JzE2OCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzE2OCcgeT0nMjUyJyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMTY4JyB5PSczMzYnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PSc4NCcgeT0nMCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzI1MicgeT0nMCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9Jzg0JyB5PScxNjgnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScyNTInIHk9JzE2OCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9Jzg0JyB5PScyNTInIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScyNTInIHk9JzI1Micgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzAnIHk9JzI1Micgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzMzNicgeT0nMjUyJyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48L2c+PC9zdmc+">
                <div class="tiptext">
                  <div class="saito-address saito-address-tSFrTSkwE7HNFUzbN4wUsPEwog42Q5XwWEP24EgVxcu2" data-id="tSFrTSkwE7HNFUzbN4wUsPEwog42Q5XwWEP24EgVxcu2">kris088Chess@saito</div>
                </div>
              </div>`;
      } else {
        html += `
              <div class="tip">
                <img class="saito-module-identicon saito-identicon" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MjAnIGhlaWdodD0nNDIwJyBzdHlsZT0nYmFja2dyb3VuZC1jb2xvcjpyZ2JhKDI0MCwyNDAsMjQwLDEpOyc+PGcgc3R5bGU9J2ZpbGw6cmdiYSgzOCwyMTcsMTIzLDEpOyBzdHJva2U6cmdiYSgzOCwyMTcsMTIzLDEpOyBzdHJva2Utd2lkdGg6Mi4xOyc+PHJlY3QgIHg9JzE2OCcgeT0nMCcgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzE2OCcgeT0nMjUyJyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMTY4JyB5PSczMzYnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PSc4NCcgeT0nODQnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScyNTInIHk9Jzg0JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nODQnIHk9JzMzNicgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzI1MicgeT0nMzM2JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMCcgeT0nODQnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PSczMzYnIHk9Jzg0JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMCcgeT0nMTY4JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMzM2JyB5PScxNjgnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScwJyB5PScyNTInIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PSczMzYnIHk9JzI1Micgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PC9nPjwvc3ZnPg==">
                <div class="tiptext">
                <div class="saito-address saito-address-tSFrTSkwE7HNFUzbN4wUsPEwog42Q5XwWEP24EgVxcu2" data-id="tSFrTSkwE7HNFUzbN4wUsPEwog42Q5XwWEP24EgVxcu2">kris088Chess@saito</div>
                </div>
              </div>`;

      }
    }

    html += `
              <div class="saito-module-identicon identicon-needed tip">
                <div class="tiptext">You need this player to start the game</div>
              </div>
            </div>
          </div>
  `;

  return html;

}


