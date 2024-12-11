function UpdateScore(score, playerid) {
  fetch("http://localhost/GameMain/API/UpdateScore.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      action: "ScoreUpdate",
      curScore: score,
      id: playerid,
    }),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not OK");
      return response.text();
    })
    .then((data) => {
      if (data) {
        console.log(data);
      } else {
        console.error("Unexpected response format:", data);
        alert("Unexpected response from server.");
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

async function GetHighestScore(playerid){
  fetch(
    `http://localhost/GameMain/API/GetHighestScore.php?action=GetHighestScore&id=${playerid}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  )
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not OK");
      return response.json();
    })
    .then((data) => {
      if (data) {
        let score = data.MaxScore;
        console.log(`Success GetHighest Score: ${score}`);
        
        return score;
      } else {
        console.error("Unexpected response format:", data);
        alert("Unexpected response from server.");
        return -1;
      }
    });
}

export { UpdateScore, GetHighestScore };
