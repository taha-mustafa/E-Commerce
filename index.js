//function to render products in any section used it=============================================
function renderProducts(data, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = data.map(createProductCard).join("");
  addEventListeners(containerId);
}

// structre for card ======================================================================
function createProductCard(product) {
  return `
    <div class="card" data-id="${product.id}">
      <div class="card-img">
        <span class="favorite"><i class="fa-solid fa-heart"></i></span>
        <span class="offer">${product.discountPercentage.toFixed(2)}%</span>
        <img src="${product.thumbnail}" alt="${product.title}">
      </div>
      <button class="add-to-cart" style="display: none;">Add To Cart</button>
      <div class="card-body">
        <p class="card-title">${product.title}</p>
        <div class="card-price">
          <p class="price">$${product.price.toFixed(2)}</p>
          <span class="card-price-offer">$${(
            product.price *
            (1 + product.discountPercentage / 100)
          ).toFixed(2)}</span>
        </div>
        <div class="rate">
          ${generateStars(product.rating)} <!-- Use product.rating directly -->
          <span class="num-rate">(${
            product.rating
          })</span> <!-- Show the number of reviews -->
        </div>
      </div>
    </div>`;
}

// fuction to calculate star based on rate===================================================
function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  return `${'<i class="fa-solid fa-star"></i>'.repeat(fullStars)}
          ${hasHalfStar ? '<i class="fa-solid fa-star-half-alt"></i>' : ""}
          ${'<i class="fa-regular fa-star"></i>'.repeat(emptyStars)}`;
}

//event listeneres alll ==========================================================================
function addEventListeners(containerId) {
  document.querySelectorAll(`#${containerId} .card`).forEach((card) => {
    const productId = card.dataset.id;
    const addToCartBtn = card.querySelector(".add-to-cart");
    const favorite = card.querySelector(".favorite");

    card.addEventListener("click", (e) => {
      if (e.target.closest(".card-img, .card-body")) {
        window.location.href = `./pages/product/product.html?id=${productId}`;
      }
    });

    card.addEventListener(
      "mouseover",
      () => (addToCartBtn.style.display = "block")
    );
    card.addEventListener(
      "mouseleave",
      () => (addToCartBtn.style.display = "none")
    );

    //"Add To Cart" event on click the button storge id in local storega as array of numbers===========================
    // Add to Cart functionality
    addToCartBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const productId = Number(card.dataset.id);

      // Get current user from sessionStorage
      const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

      if (!currentUser) {
        showInfoAlert("You Aren't loged In");
        return;
      }

      // Get and parse users from localStorage
      let users = JSON.parse(localStorage.getItem("users")) || [];

      // Find and update the user's cart
      const userFound = users.find(
        (user) => user.userName === currentUser || user.email === currentUser
      );

      if (userFound) {
        // Initialize cart array if it doesn't exist
        userFound.cart = userFound.cart || [];

        if (!userFound.cart.includes(productId)) {
          userFound.cart.push(productId);
          localStorage.setItem("users", JSON.stringify(users));
          window.updateNavCartCount();
          showSuccessAlert(
            "The product has been successfully added to the cart!"
          );
        } else {
          showInfoAlert("This product is already in the cart!");
        }
      } else {
        showErrorAlert("You must log in first");
      }
    });

    // حدث إضافة المنتج إلى المفضلة
    favorite.addEventListener("click", (e) => {
      e.stopPropagation(); //stop card navigate to info page in click
      const productId = Number(card.dataset.id);

      const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

      if (!currentUser) {
        showInfoAlert("You are not logged in");
        return;
      }

      let users = JSON.parse(localStorage.getItem("users")) || [];
      const userFound = users.find(
        (user) => user.userName === currentUser || user.email === currentUser
      );

      if (userFound) {
        userFound.wishlist = userFound.wishlist || [];
        if (!userFound.wishlist.includes(productId)) {
          userFound.wishlist.push(productId);
          localStorage.setItem("users", JSON.stringify(users));
          showSuccessAlert(
            "The product has been successfully added to the Favorit!"
          );
          favorite.style.color = "red";
          window.updateNavWatchlistCount();
        } else {
          //remove form favorit list
          userFound.wishlist = userFound.wishlist.filter(
            (id) => id !== productId
          );
          localStorage.setItem("users", JSON.stringify(users));
          window.showSuccessAlert(
            "The product has been removed from favorites successfully!"
          );
          favorite.style.color = "";
          window.updateNavWatchlistCount();
        }
      } else {
        showErrorAlert("You must log in first");
      }
    });
  });
}

// get categorise list to used in function show list in ul and buttons =========================================
function fetchCategories(callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "https://dummyjson.com/products/category-list", true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        try {
          var categories = JSON.parse(xhr.responseText);
          callback(categories);
        } catch (error) {
          console.error("Error parsing categories JSON:", error);
        }
      } else {
        console.error("Error fetching categories:", xhr.status, xhr.statusText);
      }
    }
  };
  xhr.send();
}

// get profucts
function fetchProductsFromAPI(callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "https://dummyjson.com/products?limit=100", true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        let data = JSON.parse(xhr.responseText);
        if (data && Array.isArray(data.products)) {
          callback(data.products);
        } else {
          console.error("Unexpected API response structure:", data);
        }
      } else {
        console.error("Error fetching products:", xhr.statusText);
      }
    }
  };
  xhr.send();
}

// make rondom numbers to used in chooose some products based this number ===============================
function getRandomIndexes(count, max) {
  let randomIndexes = new Set();
  while (randomIndexes.size < count) {
    randomIndexes.add(Math.floor(Math.random() * max));
  }
  return Array.from(randomIndexes);
}

// choose products based random numbers===============================
function getRandomProducts(products, count) {
  if (!Array.isArray(products) || products.length === 0) {
    console.error("Invalid product list.");
    return [];
  }
  const randomIndexes = getRandomIndexes(count, products.length);
  return randomIndexes.map((index) => products[index]);
}

// call two function for two section to display products based numers  ===========================
fetchProductsFromAPI((products) => {
  const randomTenProducts = getRandomProducts(products, 10);
  specialProductList(randomTenProducts);

  const randomTwentyProducts = getRandomProducts(products, 20);

  carouselProduct(randomTwentyProducts);
});

// make carousel offer images have two buttons to navigate the images ================================
let img = [
  "./images/2412GB0033_EG_SL_Levis_DesktopHerotator_1500x400_RTB_AR._CB537014394_.jpg",
  "./images/61g7uQmB4VL._SX3000_.jpg",
  "./images/61h3NfMkDhL._SX3000_.jpg",
  "./images/61g7uQmB4VL._SX3000_.jpg",
];
let currentIndex = 0;
let myCarousel = document.getElementById("myCarousel");

function showImage(index) {
  currentIndex = (index + img.length) % img.length;
  myCarousel.style.backgroundImage = `url('${img[currentIndex]}')`;
  updateDots();
}

function next() {
  showImage(currentIndex + 1);
}

function previous() {
  showImage(currentIndex - 1);
}

setInterval(function () {
  next();
}, 9000);

//dots in carousel image ===============================================

function createDots() {
  let dotsContainer = document.getElementById("dots-container");
  dotsContainer.innerHTML = "";
  img.forEach((image, index) => {
    let dot = document.createElement("span");
    dot.classList.add("dot");
    dot.setAttribute("onclick", `currentSlide(${index})`);
    dotsContainer.appendChild(dot);
  });
}
// display dots based number of images ==========================================
function updateDots() {
  let dots = document.getElementsByClassName("dot");
  for (let i = 0; i < dots.length; i++) {
    dots[i].classList.remove("active");
  }
  dots[currentIndex].classList.add("active");
}

function currentSlide(index) {
  showImage(index);
}

createDots();
showImage(0);

//call function to display products in carousel products========================
function carouselProduct(products) {
  renderProducts(products, "carousel");
}

///carousel control==============================================================
const carousel = document.getElementById("carousel");
const prev = document.getElementById("prev");
const nextBtn = document.getElementById("next");
let scrollAmount = 0;
const scrollStep = 270;

nextBtn.addEventListener("click", () => {
  if (scrollAmount < carousel.scrollWidth - carousel.clientWidth) {
    scrollAmount += scrollStep;
    carousel.style.transform = `translateX(-${scrollAmount}px)`;
  }
});

prev.addEventListener("click", () => {
  if (scrollAmount > 0) {
    scrollAmount -= scrollStep;
    carousel.style.transform = `translateX(-${scrollAmount}px)`;
  }
});

//countdown in carousel product section ==============================================
let now = new Date();
let startCountDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
let countDownDate = new Date(
  startCountDate.getTime() + 1 * 24 * 60 * 60 * 1000
).getTime();

var x = setInterval(function () {
  var now = new Date().getTime();
  var distance = countDownDate - now;

  var days = Math.floor(distance / (1000 * 60 * 60 * 24));
  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);

  document.getElementById("days").innerHTML =
    "0" + days + `<span class="separator">:</span>`;
  document.getElementById("hours").innerHTML =
    hours + `<span class="separator">:</span>`;
  document.getElementById("minutes").innerHTML =
    minutes + `<span class="separator">:</span>`;
  document.getElementById("seconds").innerHTML = seconds;

  if (distance < 0) {
    clearInterval(x);
    document.getElementById("time-day").innerHTML = "EXPIRED";
  }
}, 1000);

//display categories on buttons  from prevous function ajax to get all categories=====================
function renderCategoryButtons(categories, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  categories.forEach((category) => {
    let button = document.createElement("button");
    button.classList.add("category-btn");
    button.textContent = category;
    ////call function category
    button.onclick = () => fetchProducts(category);
    container.appendChild(button);
  });
}

// fire function to display buttons =================================================
fetchCategories((categories) => {
  renderCategoryButtons(categories, "products-category");
});

// give items based category on click to any buttons form category form prev function ========================
function fetchProducts(category = "mobile-accessories") {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", `https://dummyjson.com/products/category/${category}`, true);

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      let response = JSON.parse(xhr.responseText);
      let products = response.products;

      const container = document.getElementById("product-by-category");
      if (!container) return;

      container.innerHTML = "";

      let visibleProducts = 10;
      let increment = 5;
      let totalProducts = products.length;

      products.slice(0, visibleProducts).forEach((product) => {
        container.innerHTML += createProductCard(product);
      });

      addEventListeners("product-by-category");

      const loadMoreBtn = document.getElementById("load-more");
      if (totalProducts > visibleProducts) {
        loadMoreBtn.style.display = "block";
      } else {
        loadMoreBtn.style.display = "none";
      }

      loadMoreBtn.onclick = function () {
        let newVisibleCount = visibleProducts + increment;

        products.slice(visibleProducts, newVisibleCount).forEach((product) => {
          container.innerHTML += createProductCard(product);
        });

        visibleProducts = newVisibleCount;

        if (visibleProducts >= totalProducts) {
          loadMoreBtn.style.display = "none";
        }
        addEventListeners("product-by-category");
      };
    }
  };
  xhr.send();
}

fetchProducts();

// function to display random product ================================
function specialProductList(products) {
  renderProducts(products, "special-product-list");
}

//alerts =========================
// Show success alert with SweetAlert
function showSuccessAlert(message) {
  Swal.fire({
    icon: "success",
    title: "Success!",
    text: message,
    confirmButtonColor: "#000",
    timer: 2000,
  });
}

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

// Show error alert with SweetAlert
function showErrorAlert(message) {
  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: message,
    confirmButtonColor: "#e63946",
  });
}
