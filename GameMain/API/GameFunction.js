async function UpdateScore(score, playerid) {
  const response = await fetch("http://localhost/GameMain/API/UpdateScore.php", {
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
  if (!response.ok) throw new Error("Network response was not OK");
  const data = await response.text();
  if (data) {
    console.log(data);
  } else {
    console.error("Unexpected response format:", data);
    alert("Unexpected response from server.");
  }

    /*.then((response) => {
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
    });*/
}
async function GetHighestScore(playerid) {
  try {
    const response = await fetch(
      `http://localhost/GameMain/API/GetHighestScore.php?action=GetHighestScore&id=${playerid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (!response.ok) throw new Error("Network response was not OK");

    const data = await response.json();

    if (data && data.MaxScore !== undefined) {
      const score = data.MaxScore;
      console.log(`Success GetHighest Score: ${score}`);
      return score;
    } else {
      console.error("Unexpected response format:", data);
      alert("Unexpected response from server.");
      return -1;
    }
  } catch (error) {
    console.error("Error fetching highest score:", error);
    return -1;
  }
}

export { UpdateScore, GetHighestScore };
