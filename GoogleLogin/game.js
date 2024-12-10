import * as GameFunction from "./API/GameFunction.js";

let score = 0;
let playerid = parseInt(
  document.getElementById("PlayerID").textContent.replace("ID: ", "")
);

/*
document.getElementById("log").onclick = function () {
  //console.log(`OUT! id = ${playerid}`);
  score += 100;

  GameFunction.UpdateScore(score, playerid);
};*/
