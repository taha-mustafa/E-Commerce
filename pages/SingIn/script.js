let submitLogin = document.getElementById("submitLogin");
let user = document.getElementById("email");
let password = document.getElementById("password");
let currentUsers = JSON.parse(localStorage.getItem("users"));
console.log(currentUsers);
submitLogin.addEventListener("click", (e) => {
  e.preventDefault();
  for (let i = 0; i < currentUsers.length; i++) {
    if (
      (user.value == currentUsers[i].userName ||
        user.value == currentUsers[i].email) &&
      password.value == currentUsers[i].password
    ) {
      setCurrentUser();
      return;
    }
  }
  alert("wrong Email or Password");
});
let setCurrentUser = () => {
  let currentUser = user.value;
  sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
  //alert("Succesful loging in ");
  window.location.href = "../../index.html";
};
