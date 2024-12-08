function UpdateScore(score, playerid) {
  fetch("http://localhost/GoogleLogin/API/UpdateScore.php", {
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

/*function GetPlayerId() {
  fetch(
    "http://localhost/GoogleLogin/API/GetPlayerID.php?action=GetPlayerID&email=",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        action: "ScoreUpdate",
        curScore: score,
        id: playerid,
      }),
    }
  )
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not OK");
      return response.json();
    })
    .then((data) => {
      if (data.redirect) {
        //alert(data.message);
        window.location.href = data.redirect;
      } else {
        console.error("Unexpected response format:", data);
        alert("Unexpected response from server.");
      }
    });
}*/

export { UpdateScore };
