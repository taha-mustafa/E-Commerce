// DOM Elements
const wishlistContainer = document.getElementById("wishlistContainer");
const recommendationsContainer = document.getElementById("recommendationsContainer");
const wishlistCount = document.getElementById("wishlistCount");
const itemCount = document.getElementById("itemCount");
const seeAllLink = document.getElementById("seeAllLink");
const headerWishlist = document.getElementById("headerWishlist");
const headerWishlistCount = document.getElementById("headerWishlistCount");

let userData = null;
let currentUser = JSON.parse(sessionStorage.getItem("currentUser")) || null;
let allProducts = [];
let recommendations = [];

// Load userData based on currentUser using a callback
function loadUserData(callback) {
  if (!currentUser) {
    const jsonxml = new XMLHttpRequest();
    jsonxml.open("GET", "../../project.JSON", true);
    jsonxml.send();
    jsonxml.addEventListener("loadend", () => {
      if (jsonxml.status === 200) {
        const response = JSON.parse(jsonxml.response);
        userData = response.users[0] || { wishlist: [] };
        if (!userData.wishlist) userData.wishlist = [];
      } else {
        userData = { wishlist: [] };
      }
      callback();
    });
  } else {
    const currentUsers = JSON.parse(localStorage.getItem("users")) || [];
    userData = currentUsers.find(
      (u) => currentUser === u.userName || currentUser === u.email
    ) || { wishlist: [] };
    if (!userData.wishlist) userData.wishlist = [];
    callback();
  }
}

// Initialize the page when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  loadUserData(() => {
    updateWishlistCount();
    fetchProducts();

    if (seeAllLink) {
      seeAllLink.addEventListener("click", (e) => {
        e.preventDefault();
        displayAllProducts();
      });
    }

    if (headerWishlist) {
      headerWishlist.addEventListener("click", () => {
        document
          .querySelector(".wishlist-header")
          ?.scrollIntoView({ behavior: "smooth" });
      });
    }
  });
});

function loadWishlist() {
  updateWishlistCount();
}

function saveWishlist() {
  if (!currentUser) return;
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const userIndex = users.findIndex(
    (u) => currentUser === u.userName || currentUser === u.email
  );
  if (userIndex !== -1) {
    users[userIndex] = userData;
  } else {
    users.push(userData);
  }
  localStorage.setItem("users", JSON.stringify(users));
  updateWishlistCount();
}

function updateWishlistCount() {
  const count = userData?.wishlist?.length || 0;
  if (wishlistCount) wishlistCount.textContent = count;
  if (itemCount) itemCount.textContent = count;
  if (headerWishlistCount) headerWishlistCount.textContent = count;

  if (count > 0 && headerWishlistCount) {
    headerWishlistCount.classList.add("pulse");
    setTimeout(() => headerWishlistCount.classList.remove("pulse"), 500);
  }
}

function fetchProducts() {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "https://dummyjson.com/products/");
  xhr.onload = function () {
    if (xhr.status === 200) {
      const response = JSON.parse(xhr.responseText);
      allProducts = response.products.map((product) => {
        if (product.thumbnail && !product.thumbnail.startsWith("http")) {
          product.thumbnail = `https://dummyjson.com${product.thumbnail}`;
        }
        if (product.image && !product.image.startsWith("http")) {
          product.image = `https://dummyjson.com${product.image}`;
        }
        return product;
      });
      generateRecommendations();
      displayWishlist();
    } else {
      console.error("Error fetching products:", xhr.statusText);
      showErrorAlert("Failed to load products. Please try again later.");
      if (recommendationsContainer) {
        recommendationsContainer.innerHTML =
          '<div class="empty-wishlist">Failed to load recommendations.</div>';
      }
    }
  };
  xhr.onerror = function () {
    console.error("Request failed");
    showErrorAlert("Network error. Please check your connection.");
    if (recommendationsContainer) {
      recommendationsContainer.innerHTML =
        '<div class="empty-wishlist">Network error.</div>';
    }
  };
  xhr.send();
}

// Fetch a single product by ID using callbacks
function fetchProductById(productId, callback, errorCallback) {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", `https://dummyjson.com/products/${productId}`);
  xhr.onload = function () {
    if (xhr.status === 200) {
      let product = JSON.parse(xhr.responseText);
      if (product.thumbnail && !product.thumbnail.startsWith("http")) {
        product.thumbnail = `https://dummyjson.com${product.thumbnail}`;
      }
      callback(product);
    } else {
      errorCallback(new Error("Product not found"));
    }
  };
  xhr.onerror = function () {
    errorCallback(new Error("Network error"));
  };
  xhr.send();
}

function displayWishlist() {
  if (!wishlistContainer) return;
  wishlistContainer.innerHTML = "";
  if (!userData?.wishlist?.length) {
    wishlistContainer.innerHTML =
      '<div class="empty-wishlist">Your wishlist is empty</div>';
    return;
  }

  userData.wishlist.forEach((id) => {
    const product = allProducts.find((p) => p.id === id);
    if (product) {
      renderProductCard(product, wishlistContainer, true);
    } else {
      fetchProductById(
        id,
        (fetchedProduct) => {
          allProducts.push(fetchedProduct);
          renderProductCard(fetchedProduct, wishlistContainer, true);
        },
        (error) => {
          console.error("Failed to fetch product with ID", id, error);
          userData.wishlist = userData.wishlist.filter((pid) => pid !== id);
          saveWishlist();
        }
      );
    }
  });
}

function renderProductCard(product, container, isWishlist = false) {
  if (!container) return;
  const discount = Math.random() > 0.5;
  const originalPrice = (product.price * (1 + Math.random() * 0.5)).toFixed(2);

  const productElement = document.createElement("div");
  productElement.className = "wishlist-item";
  productElement.innerHTML = `
    <div class="item-heart" onclick="${
      isWishlist
        ? `removeFromWishlist(${product.id}, '${product.title.replace(/'/g, "\\'")}')`
        : `addToWishlist(${product.id}, '${product.title.replace(/'/g, "\\'")}')`
    }">
      <i class="fas fa-heart"></i>
    </div>
    <img src="${product.thumbnail || product.image}" 
      alt="${product.title}" 
      onerror="this.onerror=null;this.src='https://via.placeholder.com/150?text=No+Image';">
    <h3>${product.title}</h3>
    <div class="price">
      ${discount ? `<span class="original-price">$${originalPrice}</span>` : ""}
      <span class="discounted-price">$${product.price}</span>
    </div>
    <button class="add-to-cart">Add to Cart</button>
  `;
  container.appendChild(productElement);

  const addToCartBtn = productElement.querySelector(".add-to-cart");
  addToCartBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const productId = product.id;
    if (!currentUser) {
      showInfoAlert("You aren't logged in");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const userFound = users.find(
      (user) => user.userName === currentUser || user.email === currentUser
    );

    if (userFound) {
      userFound.cart = userFound.cart || [];
      if (!userFound.cart.includes(productId)) {
        userFound.cart.push(productId);
        localStorage.setItem("users", JSON.stringify(users));
        window.updateNavCartCount();
        showSuccessAlert("The product has been successfully added to the cart!");
      } else {
        showInfoAlert("This product is already in the cart!");
      }
    } else {
      showErrorAlert("You must log in first");
    }
  });
}

function generateRecommendations() {
  const availableProducts = allProducts.filter(
    (product) => !userData?.wishlist?.includes(product.id)
  );
  recommendations = [];
  const maxRecommendations = Math.min(4, availableProducts.length);

  for (let i = 0; i < maxRecommendations; i++) {
    const randomIndex = Math.floor(Math.random() * availableProducts.length);
    recommendations.push(availableProducts[randomIndex]);
    availableProducts.splice(randomIndex, 1);
  }
  displayRecommendations();
}

function displayRecommendations() {
  if (!recommendationsContainer) return;
  if (recommendations.length === 0) {
    recommendationsContainer.innerHTML =
      '<div class="empty-wishlist">No recommendations available at this time.</div>';
    return;
  }

  recommendationsContainer.innerHTML = "";
  recommendations.forEach((product) => {
    renderProductCard(product, recommendationsContainer, false);
  });
}

function displayAllProducts() {
  if (!recommendationsContainer) return;
  recommendationsContainer.innerHTML =
    '<div class="loading">Loading all products...</div>';

  setTimeout(() => {
    recommendationsContainer.innerHTML = "";
    allProducts.forEach((product) => {
      if (!userData?.wishlist?.includes(product.id)) {
        renderProductCard(product, recommendationsContainer, false);
      }
    });
    if (recommendationsContainer.children.length === 0) {
      recommendationsContainer.innerHTML =
        '<div class="empty-wishlist">No products available.</div>';
    }
  }, 500);
}

function addToWishlist(productId, productTitle) {
  if (!userData) userData = { wishlist: [] };
  if (userData.wishlist.includes(productId)) {
    showInfoAlert("This product is already in your wishlist!");
    return;
  }
  userData.wishlist.push(productId);
  saveWishlist();
  displayWishlist();
  generateRecommendations();
  showSuccessAlert(`${productTitle} added to wishlist!`);
  animateHeartIcon();
  window.updateNavWatchlistCount();
}

function removeFromWishlist(productId, productTitle) {
  Swal.fire({
    title: "Are you sure?",
    text: `Remove ${productTitle} from your wishlist?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#e63946",
    cancelButtonColor: "#333",
    confirmButtonText: "Yes, remove it!",
  }).then((result) => {
    if (result.isConfirmed) {
      userData.wishlist = userData.wishlist.filter((id) => id !== productId);
      saveWishlist();
      displayWishlist();
      generateRecommendations();
      window.updateNavWatchlistCount();
      showSuccessAlert(`${productTitle} removed from wishlist!`);
    }
  });
}

function animateHeartIcon() {
  if (!headerWishlist) return;
  const heart = headerWishlist.querySelector("i");
  if (!heart) return;
  heart.classList.add("animate");
  setTimeout(() => heart.classList.remove("animate"), 1000);
}

function showSuccessAlert(message) {
  Swal.fire({
    icon: "success",
    title: "Success!",
    text: message,
    confirmButtonColor: "#000",
    timer: 2000,
  });
}

function showErrorAlert(message) {
  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: message,
    confirmButtonColor: "#e63946",
  });
}

function showInfoAlert(message) {
  Swal.fire({
    icon: "info",
    title: "Info",
    text: message,
    confirmButtonColor: "#0d6efd",
    timer: 2000,
  });
}