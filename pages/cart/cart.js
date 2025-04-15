let cartItems = document.getElementById("tableBody");
let returnToHome = document.getElementById("returnToHome");
let checkoutBtn = document.getElementById("checkoutBtn");

// Event listeners for navigation and checkout
returnToHome.addEventListener("click", () => {
  window.location.href = "../../index.html";
});

if (checkoutBtn) {
  checkoutBtn.addEventListener("click", checkout);
}

// Load cart items
loadCartItems();

function loadCartItems() {
  let currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  console.log("Current User:", currentUser);

  if (!currentUser) {
    console.log("No user logged in, fetching from JSON");
    fetchFromJson();
  } else {
    let currentUsers = JSON.parse(localStorage.getItem("users")) || [];
    console.log("Users from localStorage:", currentUsers);
    let items = [];

    for (let i = 0; i < currentUsers.length; i++) {
      if (
        currentUser === currentUsers[i].userName ||
        currentUser === currentUsers[i].email
      ) {
        items = currentUsers[i].cart || [];
        console.log("Found user cart:", items);
        break;
      }
    }

    if (items.length > 0) {
      processCartItems(items);
    } else {
      console.log("User cart is empty");
      displayEmptyCart();
      updateCartTotal(0);
    }
  }
}

function fetchFromJson() {
  let cartIds = new XMLHttpRequest();
  cartIds.open("GET", "/project.JSON", true);
  cartIds.send();

  cartIds.addEventListener("loadend", () => {
    if (cartIds.status === 200) {
      let id = JSON.parse(cartIds.response);
      let items = id.users[0].cart || [];
      console.log("JSON cart items:", items);
      processCartItems(items);
    } else {
      console.error("Failed to load JSON:", cartIds.status);
      displayEmptyCart();
      updateCartTotal(0);
    }
  });
}

function processCartItems(items) {
  if (!items || items.length === 0) {
    displayEmptyCart();
    updateCartTotal(0);
    return;
  }

  let total = 0;
  // Object to track item quantities
  let itemQuantities = {};

  // Count occurrences of each item
  items.forEach((item) => {
    itemQuantities[item] = (itemQuantities[item] || 0) + 1;
  });
  console.log("Item quantities:", itemQuantities);

  // Process each unique item
  Object.keys(itemQuantities).forEach((itemId) => {
    let quantity = itemQuantities[itemId];

    let xml = new XMLHttpRequest();
    xml.open("GET", `https://dummyjson.com/products/${itemId}`, true);
    xml.send();

    xml.addEventListener("loadend", () => {
      if (xml.status === 200) {
        let data = JSON.parse(xml.response);
        let price = data.price;
        let initialSubtotal = price * quantity;

        total += initialSubtotal;
        updateCartTotal(total);

        // Check if the item already exists in the table
        let existingRow = Array.from(cartItems.querySelectorAll("tr")).find(
          (row) =>
            row.querySelector(".delete-btn")?.getAttribute("data-id") === itemId
        );

        if (existingRow) {
          // Update existing row's quantity and subtotal
          let quantityInput = existingRow.querySelector(".quantity");
          let newQuantity = parseInt(quantityInput.value) + quantity;
          quantityInput.value = newQuantity;

          let subtotalCell = existingRow.querySelector(".subtotal");
          let subtotal = price * newQuantity;
          subtotalCell.textContent = `${subtotal.toFixed(2)}$`;
        } else {
          // Create new row for the item
          let row = document.createElement("tr");
          row.innerHTML = `
            <td>
              <div class="imageTitle">
                <div class="image">
                  <img src="${data.images[0]}" alt="" id="trans" />
                </div>
                <p>${data.title}</p>
              </div>
            </td>
            <td><p class="price">${price}$</p></td>
            <td><input type="number" class="quantity" data-price="${price}" min="1" value="${quantity}"/></td>
            <td class="subtotal">${initialSubtotal.toFixed(2)}$</td>
            <td><button class="delete-btn" data-id="${itemId}">X</button></td>`;

          cartItems.appendChild(row);
          // Attach listeners immediately after adding each row
          attachEventListenersToRow(row);
        }
      } else {
        console.error(`Failed to load product ${itemId}:`, xml.status);
      }
    });
  });
}

function displayEmptyCart() {
  cartItems.innerHTML = `
    <tr>
      <td colspan="5" style="text-align: center; padding: 20px;">
        No items in the cart
      </td>
    </tr>
  `;
}

function updateCartTotal(total) {
  document.getElementById("cart-total").textContent = total.toFixed(2);
}

function updateSubtotal(event) {
  let input = event.target;
  let price = parseFloat(input.getAttribute("data-price"));
  let quantity = parseInt(input.value) || 1;
  let subtotalCell = input.closest("tr").querySelector(".subtotal");

  let subtotal = price * quantity;
  subtotalCell.textContent = `${subtotal.toFixed(2)}$`;
  recalculateCartTotal();
}

function recalculateCartTotal() {
  let total = 0;
  document.querySelectorAll(".subtotal").forEach((subtotal) => {
    total += parseFloat(subtotal.textContent.replace("$", ""));
  });
  updateCartTotal(total);
}

function deleteItem(event) {
  if (event.target.classList.contains("delete-btn")) {
    let row = event.target.closest("tr");
    let itemId = event.target.getAttribute("data-id");
    let quantityInput = row.querySelector(".quantity");
    let quantity = parseInt(quantityInput.value);
    let price = parseFloat(
      row.querySelector(".price").textContent.replace("$", "")
    );
   // console.log("Deleting item ID:", itemId);

    if (quantity > 1) {
      
      quantityInput.value = quantity - 1;
      let subtotal = price * (quantity - 1);
      quantity--;
      console.log(quantity);

      row.querySelector(".subtotal").textContent = `${subtotal.toFixed(2)}$`;
      removeFromLocalStorage(itemId);
      recalculateCartTotal();
      return;
    } else {
      
      let subtotal = parseFloat(
        row.querySelector(".subtotal").textContent.replace("$", "")
      );
      row.remove();

      if (!document.querySelector("#tableBody tr")) {
        console.log("Cart is now empty");
        displayEmptyCart();
      }

      let total = parseFloat(document.getElementById("cart-total").textContent);
      total -= subtotal;
      updateCartTotal(total);
    }

    let currentUser = sessionStorage.getItem("currentUser");
    if (currentUser) {
      removeFromLocalStorage(itemId);
    } else {
      console.log("No user logged in, skipping localStorage update");
    }
  }
}

function removeFromLocalStorage(itemId) {
  let currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  let currentUsers = JSON.parse(localStorage.getItem("users")) || [];
  console.log("Before removal - Users:", currentUsers);

  for (let i = 0; i < currentUsers.length; i++) {
    if (
      currentUser === currentUsers[i].userName ||
      currentUser === currentUsers[i].email
    ) {
      if (currentUsers[i].cart && currentUsers[i].cart.length > 0) {
        let index = currentUsers[i].cart.indexOf(Number(itemId));
        if (index !== -1) {
          currentUsers[i].cart.splice(index, 1);
          localStorage.setItem("users", JSON.stringify(currentUsers));
          console.log(
            `After removal - Updated cart for ${currentUser}:`,
            currentUsers[i].cart
          );
        }
      } else {
        console.log("Cart is empty or undefined, no removal needed");
      }
      break;
    }
  }
}

function attachEventListenersToRow(row) {
  let quantityInput = row.querySelector(".quantity");
  if (quantityInput) {
    quantityInput.addEventListener("input", updateSubtotal);
  }
  let deleteBtn = row.querySelector(".delete-btn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", deleteItem);
  }
}

function checkout() {
  let total = parseFloat(document.getElementById("cart-total").textContent);
  if (total > 0) {
    alert("Proceeding to checkout with total: $" + total.toFixed(2));
  } else {
    alert("Your cart is empty!");
  }
}
