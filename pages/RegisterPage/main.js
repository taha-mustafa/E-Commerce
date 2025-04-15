document.getElementById("registerForm").onsubmit = function () {
  let name = document.getElementById("name").value;
  let email = document.getElementById("email").value;
  let password = document.getElementById("password").value;
  let nameRegex = /^[a-zA-Z\s]{3,}$/;
  let emailRegex =
    /^[a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  let passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

  let users = JSON.parse(localStorage.getItem("users")) || [];

  let user = {
    userName: name,
    email: email,
    password: password,
    wishlist: [],
    cart: [],
  };

  users.push(user);

  if (name === "" || email === "" || password === "") {
    showErrorAlert("Please fill in all fields.");
    return false;
  }
  if (!name || !email || !password) {
    showErrorAlert("Please fill in all fields.");
    return;
  }

  if (!nameRegex.test(name)) {
    showErrorAlert("enter a valid name at least 3 characters , leters only.");
    return false;
  }

  if (!emailRegex.test(email)) {
    showErrorAlert("enter a valid email address");
    return false;
  }

  if (!passwordRegex.test(password)) {
    showErrorAlert(
      "enter Password ar least 6 characters and contain at one letter and one number"
    );
    return false;
  }

  localStorage.setItem("users", JSON.stringify(users));
  alert("Thanks for the registration");
  window.location.href = "../../index.html";
  sessionStorage.setItem("currentUser", JSON.stringify(user.userName));
  return false;
};
function showErrorAlert(message) {
  Swal.fire({
    icon: "error",
    title: "wrong fill",
    text: message,
    confirmButtonColor: "#e63946",
  });
}
