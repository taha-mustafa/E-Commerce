// Update links based on environment
document.addEventListener("DOMContentLoaded", function () {
  let currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.protocol === "file:" ||
    window.location.host === "127.0.0.1:5500";

  const basePath = isLocal ? "" : "https://ahmed5atia.github.io/E-Commerce";

  const navbarHTML = `
  <nav class="navbar">
      <div class="logo">Exclusive</div>
      <div class="hamburger">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <ul class="nav-links">
        <li><a href="${basePath}/index.html">Home</a></li>
        <li><a href="#contact">Contact</a></li>
        <li><a href="#about">About</a></li>
        ${
          currentUser
            ? `<li><a style="cursor: pointer;" onclick="handleLogOut()">Log Out</a></li>`
            : `<li><a href="${basePath}/pages/RegisterPage/Registration.html">Sign Up</a></li>`
        }
      </ul>
      <div class="icons">
        <a href="${basePath}/pages/wishlist/wishlist.html" id="wishlistLink" class="icon fav wishlist-icon"
          ><i class="fas fa-heart"></i
        ><span class="wishlist-count-badge" id="headerWishlistCount">0</span></a>
        <a href="${basePath}/pages/cart/cart.html" id="cartLink" class="icon cart cart-icon"
          ><i class="fas fa-shopping-cart"></i
        ><span class="cart-count-badge" id="headerCartCount">0</span></a>
        <a href="/" class="icon"><i class="fas fa-user"></i></a>
      </div>
    </nav>
  `;

  document.getElementById("navbar-container").innerHTML = navbarHTML;
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navLinks.classList.toggle("active");
  });

  navLinks.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      hamburger.classList.remove("active");
      navLinks.classList.remove("active");
    }
  });
  updateNavCartCount();
  updateNavWatchlistCount();
});

window.updateNavCartCount = function () {
  const headerCartCount = document.getElementById("headerCartCount");
  if (!headerCartCount) return;

  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  if (!currentUser) {
    headerCartCount.textContent = 0;
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(
    (u) => u.userName === currentUser || u.email === currentUser
  );

  if (user && user.cart) {
    headerCartCount.textContent = user.cart.length;
  } else {
    headerCartCount.textContent = 0;
  }
};

window.updateNavWatchlistCount = function () {
  const headerWishlistCount = document.getElementById("headerWishlistCount");
  if (!headerWishlistCount) return;

  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  if (!currentUser) {
    headerWishlistCount.textContent = 0;
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(
    (u) => u.userName === currentUser || u.email === currentUser
  );

  if (user && user.wishlist) {
    headerWishlistCount.textContent = user.wishlist.length;
  } else {
    headerWishlistCount.textContent = 0;
  }
};

function handleLogOut() {
  sessionStorage.clear();
  location.reload();
}
//alerts =========================

// Show info alert with SweetAlert
function showInfoAlert(message) {
  Swal.fire({
    icon: "info",
    title: "Info",
    text: message,
    confirmButtonColor: "#0d6efd",
    timer: 2000,
  });
}
