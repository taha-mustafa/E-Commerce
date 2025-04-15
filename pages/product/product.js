const paramsString = window.location.search;
const searchParams = new URLSearchParams(paramsString);
let id = searchParams.get("id");
let product;
let quantity = document.getElementById("quantity"); // quantity input
let addToCart = document.querySelector(".add-to-cart");
let wishlistButton = document.querySelector(".wishlist");
let sideImages = document.querySelector(".side-images");

let specificationsTab = document.getElementById("specifications-tab");
let reviewsTab = document.getElementById("reviews-tab");
let specificationsContent = document.getElementById("specifications-content");
let reviewsContent = document.getElementById("reviews-content");

quantity.onchange = function () {
  price.innerText = `$${product.price * quantity.value}`;
};

function increase() {
  // increase quantity button
  let currentQuantity = Number(quantity.value);
  quantity.value = currentQuantity + 1;
  price.innerText = `$${product.price * quantity.value}`;
}

function decrease() {
  // decrease quantity button
  if (quantity.value >= 1) {
    let currentQuantity = Number(quantity.value);
    quantity.value = currentQuantity - 1;
    price.innerText = `$${product.price * quantity.value}`;
  }
}

function fillRating(rating) {
  // stars filling
  const maxWidth = 120;
  const fillWidth = (rating / 5) * maxWidth;
  document.querySelector("#clip rect").setAttribute("width", fillWidth);
  document.getElementById("rating").innerText = rating;
}

function getProductData() {
  let xhr = new XMLHttpRequest(); // getting product data from API
  xhr.open("GET", `https://dummyjson.com/products/${id}`, true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      let res = xhr.response;
      // getting the product and turning it into a normal object
      product = JSON.parse(res);
      // filling the stars with product rating
      fillRating(product.rating);
      let title = document.getElementById("title");
      title.innerText = product.title;
      let pageTitle = document.getElementById("page-title");
      pageTitle.innerText = product.title;
      let description = document.getElementById("description");
      description.innerText = product.description;
      let price = document.getElementById("price");
      price.innerText = `$${product.price * quantity.value}`;
      let mainImage = document.getElementById("main-image");
      mainImage.src = product.images[0];
      let isFirstImage = true;
      for (let img of product.images) {
        let image = document.createElement("img");
        image.src = img;
        image.height = 100;
        // Add 'active' class to the first image thumbnail
        if (isFirstImage) {
          image.setAttribute("class", "side-images-image active");
          isFirstImage = false;
        } else {
          image.setAttribute("class", "side-images-image");
        }
        sideImages.appendChild(image);
        image.addEventListener("click", function () {
          mainImage.src = image.src;
          document
            .querySelectorAll(".side-images-image")
            .forEach((img) => img.classList.remove("active"));

          // Add 'active' class to the clicked thumbnail
          image.classList.add("active");
        });
      }
      addSpecifications();
      addReviews();
    }
  };
  xhr.send();
}
getProductData();

// Tab switching functionality
specificationsTab.onclick = function () {
  specificationsTab.classList.add("active");
  reviewsTab.classList.remove("active");
  specificationsContent.classList.add("active");
  reviewsContent.classList.remove("active");
};

reviewsTab.onclick = function () {
  reviewsTab.classList.add("active");
  specificationsTab.classList.remove("active");
  reviewsContent.classList.add("active");
  specificationsContent.classList.remove("active");
};

/// Populate Specifications and Reviews
// Specifications tab
function addSpecifications() {
  const specifications = document.querySelector(".specifications");
  specifications.innerHTML = `
    <p><strong>Brand:</strong> ${product.brand}</p>
    <p><strong>SKU:</strong> ${product.sku}</p>
    <p><strong>Weight:</strong> ${product.weight} kg</p>
    <p><strong>Dimensions:</strong> ${product.dimensions.width} x ${product.dimensions.height} x ${product.dimensions.depth} cm</p>
    <p><strong>Warranty:</strong> ${product.warrantyInformation}</p>
    <p><strong>Shipping:</strong> ${product.shippingInformation}</p>
    <p><strong>Availability:</strong> ${product.availabilityStatus}</p>
    `;
}

// Reviews tab
function addReviews() {
  const reviews = document.querySelector(".reviews");
  reviews.innerHTML = "";
  product.reviews.forEach((review) => {
    const reviewElement = document.createElement("div");
    reviewElement.classList.add("review");
    reviewElement.innerHTML = `
        <p><strong>${review.reviewerName}</strong> (${review.rating}/5)</p>
        <p>${review.comment}</p>
        <p><small>${new Date(review.date).toLocaleDateString()}</small></p>
        `;
    reviews.appendChild(reviewElement);
  });
}

// Add to Cart functionality
addToCart.onclick = function () {
  // const cart = JSON.parse(localStorage.getItem('cart')) || [];
  // const existingProductIndex = cart.findIndex(item => item.id === product.id);

  // if (existingProductIndex !== -1) {
  //     cart[existingProductIndex].quantity += Number(quantity.value);
  // } else {
  //     cart.push({ id: product.id, title: product.title, price: product.price, quantity: Number(quantity.value) });
  // }

  // localStorage.setItem('cart', JSON.stringify(cart));
  // alert(`${product.title} has been added to your cart.`);
  /*-----------*/
  let currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

  if (!currentUser) {
    showInfoAlert("Please log in");

    return;
  }

  let currentUsers = JSON.parse(localStorage.getItem("users"));
  for (let i = 0; i < currentUsers.length; i++) {
    let userName = currentUsers[i].userName;
    let email = currentUsers[i].email;

    if (currentUser == userName || currentUser == email) {
      for (let j = 0; j < quantity.value; j++) {
        currentUsers[i].cart.push(product.id);
      }
      quantity.value = 1;
      updateCartCount(currentUsers[i].cart.length);

      //alert("found");
    }
  }
  localStorage.setItem("users", JSON.stringify(currentUsers));
  window.updateNavCartCount();
  /*-----------*/
};
function updateCartCount(c) {
  const headerCartCount = document.getElementById("headerCartCount");
  const count = c;
  headerCartCount.textContent = count;
  console.log(headerCartCount);
}
function updatewishlistCount(c) {
  const headerCartCount = document.getElementById("headerWishlistCount");
  const count = c;
  headerCartCount.textContent = count;
  console.log(headerCartCount);
}
// // const userData = JSON.parse(localStorage.getItem('userData')) || JSON.parse(localStorage.getItem('wishlist')) || { users: { wishlist: [] } };
// const userData = JSON.parse(localStorage.getItem('cart'));
// const count = userData.users.wishlist.length;

// Add to Wishlist functionality
wishlistButton.onclick = function () {
  let currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

  if (!currentUser) {
    showInfoAlert("Please log in");

    return;
  }

  let currentUsers = JSON.parse(localStorage.getItem("users"));
  for (let i = 0; i < currentUsers.length; i++) {
    let userName = currentUsers[i].userName;
    let email = currentUsers[i].email;

    if (currentUser == userName || currentUser == email) {
      if (currentUsers[i].wishlist.includes(product.id)) {
        showInfoAlert("This item already exsist in your wishlist");
        break;
      } else {
        currentUsers[i].wishlist.push(product.id);
        updatewishlistCount(currentUsers[i].wishlist.length);
        showSuccessAlert(
          "The product has been successfully added to the Favorit"
        );
      }

      //alert("found");
    }
  }
  localStorage.setItem("users", JSON.stringify(currentUsers));
  window.updateNavWatchlistCount();
};

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

// Show error alert with SweetAlert
function showErrorAlert(message) {
  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: message,
    confirmButtonColor: "#e63946",
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
