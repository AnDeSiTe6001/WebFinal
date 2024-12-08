const GoogleLoginBtn = document.getElementById("google_login");
/*GoogleLoginBtn.addEventListener("click", function (event) {
  console.log("click");
  event.preventDefault();
  fetch("http://localhost/GoogleLogin/API/GoogleLogin.php", {
    method: "GET",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })
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
});*/

const SignUpTable = document.getElementById("register");
const SignUpBtn = document.getElementById("SignUpBtn");
SignUpBtn.addEventListener("click", function () {
  SignUpTable.style.display = "flex";
  SignUpTable.style.opacity = 1;
});

const LoginInBtn = document.getElementById("LoginInBtn");
LoginInBtn.addEventListener("click", function () {
  SignUpTable.style.opacity = 0;
  SignUpTable.style.display = "none";
});

const SignUpConfirm = document.getElementById("SignUpConfirm");

const RegisterName = document.getElementById("r_name");
const RegisterEmail = document.getElementById("r_email");
const RegisterPassword = document.getElementById("r_password");

SignUpConfirm.addEventListener("click", function (event) {
  event.preventDefault();
  fetch(`http://localhost/GoogleLogin/GeneralLogin.php`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      action: "CreateAccount",
      name: RegisterName.value,
      email: RegisterEmail.value,
      password: RegisterPassword.value,
    }),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not OK");
      return response.json();
    })
    .then((data) => {
      if (data && data.message) {
        alert(data.message);
        if (data.redirect) {
          window.location.href = data.redirect;
        }
      } else {
        console.error("Unexpected response format:", data);
        alert("Unexpected response from server.");
      }
    });
});

const SignInConfirm = document.getElementById("SignInConfirm");

const LoginEmail = document.getElementById("l_email");
const LoginPassword = document.getElementById("l_password");

SignInConfirm.addEventListener("click", function (event) {
  event.preventDefault();
  fetch(
    `http://localhost/GoogleLogin/GeneralLogin.php?action=Login&email=${LoginEmail.value}&password=${LoginPassword.value}`,
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
      if (data && data.message) {
        alert(data.message);
        if (data.redirect) {
          window.location.href = data.redirect;
        }
      } else {
        console.error("Unexpected response format:", data);
        alert("Unexpected response from server.");
      }
    });
});
