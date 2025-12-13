document.addEventListener("DOMContentLoaded", () => {

  /* ================
     Services Lists 
  ================= */
  const SERVICES = [
    {
      id: "washfold",
      name: "Wash & Fold",
      price: 20,
      cloths: ["T-Shirt", "Shirt", "Pant", "Jeans", "Jacket", "Saree", "Blanket Single"]
    },
    {
      id: "dryclean",
      name: "Dry Cleaning",
      price: 40,
      cloths: ["Shirt", "Pant", "Jacket", "Saree"]
    },
    {
      id: "ironing",
      name: "Ironing",
      price: 10,
      cloths: ["Shirt", "T-Shirt", "Pant"]
    },
    {
      id: "stain",
      name: "Stain Removal",
      price: 500,
      cloths: ["Any"]
    },
    {
      id: "leather",
      name: "Leather & Suede Cleaning",
      price: 999,
      cloths: ["Bags", "Jacket"]
    },
    {
      id: "wedding",
      name: "Wedding Dress Cleaning",
      price: 2800,
      cloths: ["Lehenga", "Sharara", "Suit", "Gown", "Sherwani", "Saree"]
    },
    {
      id: "homeclean",
      name: "Home Cleaning",
      price: 499,
      cloths: ["1 Hour", "2 Hours", "Full Home"]
    }
  ];


  const EMAIL_SERVICE_ID = "service_j38myn4";
  const TEMPLATE_OWNER = "template_ddivedh";
  const TEMPLATE_USER = "template_l8dlr3k";


  /* =============================
      3. DOM ELEMENT REFERENCES
  ================================*/
  const popup = document.getElementById("lmSchedulePopup");
  const backdrop = document.getElementById("lmBackdrop");
  const closeBtn = document.getElementById("lmCloseBtn");

  const serviceGrid = document.getElementById("lmServiceGrid");

  const stepIndicators = document.querySelectorAll(".step-ind");
  const stepPages = document.querySelectorAll(".lm-step");

  const cartTableBody = document.querySelector("#lmCartTable tbody");
  const subtotalElement = document.getElementById("lmSubtotal");
  const taxElement = document.getElementById("lmTax");
  const totalElement = document.getElementById("lmTotal");

  const goToStep2Button = document.getElementById("toStep2");
  const goToStep3Button = document.getElementById("toStep3");
  const backToStep1Button = document.getElementById("backToStep1");
  const backToStep2Button = document.getElementById("backToStep2");

  const bookingForm = document.getElementById("lmBookingForm");
  const confirmationMessage = document.getElementById("lmConfText");

  const doneButton = document.getElementById("lmDoneClose");
  const viewBookingsButton = document.getElementById("lmViewBookings");


  /* ===================
   all selected services
  =======================*/
  let CART = [];
  const BOOKINGS_KEY = "lm_bookings"; // LocalStorage key


  /* ===================
      POPUP OPEN / CLOSE
  ======================= */

  function openPopup() {
    popup.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    showStep(1);
    renderServices();
    renderCart();
  }

  function closePopup() {
    popup.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "auto";
  }

  document.querySelectorAll(".pickup-btn, .open-booking").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      openPopup();
    });
  });

  closeBtn.addEventListener("click", closePopup);
  backdrop.addEventListener("click", closePopup);

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closePopup();
    }
  });


 /*show correct number state */
function showStep(stepNumber) {
  stepIndicators.forEach(indicator => {
    const s = Number(indicator.dataset.step);
    indicator.classList.toggle("active", s === stepNumber);
  });

  stepPages.forEach(page => {
    const s = Number(page.dataset.step);
    page.hidden = s !== stepNumber;
  });
}



  /* Render SERVICE CARDS IN STEP 1*/


  function renderServices() {
    serviceGrid.innerHTML = "";

    SERVICES.forEach(service => {
      const card = document.createElement("div");
      card.className = "lm-service-card";

      card.innerHTML = `
        <h4>${service.name}</h4>
        <p>Price: ₹${service.price}</p>

        <div class="lm-service-controls">
            <select class="cloth-select"></select>
            <input type="number" min="1" value="1" class="qty-input">
            <button class="add-btn">Add</button>
        </div>
      `;

      const clothSelect = card.querySelector(".cloth-select");
      service.cloths.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.textContent = c;
        clothSelect.appendChild(opt);
      });

      if (service.cloths.length === 1) {
        clothSelect.style.display = "none";
      }

      card.querySelector(".add-btn").addEventListener("click", () => {
        const selectedCloth = clothSelect.value || service.cloths[0];
        const quantity = Number(card.querySelector(".qty-input").value) || 1;

        addToCart({
          id: service.id,
          name: service.name,
          cloth: selectedCloth,
          qty: quantity,
          price: service.price
        });
      });

      serviceGrid.appendChild(card);
    });
  }


  /* =================
     CART FUNCTIONS
  ==================*/

  function addToCart(item) {
    const found = CART.find(
      cartItem => cartItem.id === item.id && cartItem.cloth === item.cloth
    );

    if (found) {
      found.qty += item.qty;
      found.lineTotal = found.qty * found.price;
    } else {
      item.lineTotal = item.qty * item.price;
      CART.push(item);
    }

    renderCart();
  }


  function renderCart() {
    cartTableBody.innerHTML = "";

    if (CART.length === 0) {
      cartTableBody.innerHTML = `<tr><td colspan="5">No services added.</td></tr>`;
    } else {
      CART.forEach((item, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${item.name}</td>
          <td>${item.cloth}</td>

          <td>
            <button class="dec-btn" data-index="${index}">−</button>
            <span>${item.qty}</span>
            <button class="inc-btn" data-index="${index}">+</button>
          </td>

          <td>₹${item.lineTotal}</td>

          <td>
            <button class="remove-btn" data-index="${index}">Remove</button>
          </td>
        `;

        cartTableBody.appendChild(row);
      });
    }

    updateTotals();
    attachCartButtons();
  }


  function attachCartButtons() {
    cartTableBody.querySelectorAll(".inc-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const index = btn.dataset.index;
        CART[index].qty++;
        CART[index].lineTotal = CART[index].qty * CART[index].price;
        renderCart();
      });
    });

    cartTableBody.querySelectorAll(".dec-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const index = btn.dataset.index;
        if (CART[index].qty > 1) {
          CART[index].qty--;
          CART[index].lineTotal = CART[index].qty * CART[index].price;
        }
        renderCart();
      });
    });

    cartTableBody.querySelectorAll(".remove-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const index = btn.dataset.index;
        CART.splice(index, 1);
        renderCart();
      });
    });
  }


  function updateTotals() {
    const subtotal = CART.reduce((sum, item) => sum + item.lineTotal, 0);

    subtotalElement.textContent = `₹${subtotal}`;
    taxElement.textContent = "₹0";
    totalElement.textContent = `₹${subtotal}`;
  }


  /* ========== 
    STEP BUTTONS
  ==============*/

  goToStep2Button.addEventListener("click", () => {
    if (CART.length === 0) {
      alert("Add at least one service.");
      return;
    }
    showStep(2);
  });

  backToStep1Button.addEventListener("click", () => showStep(1));

  goToStep3Button.addEventListener("click", () => showStep(3));

  backToStep2Button.addEventListener("click", () => showStep(2));


  /* ================== 
      BOOKING FORM SUBMIT
  ======================  */

  bookingForm.addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("lm_name").value.trim();
    const email = document.getElementById("lm_email").value.trim();
    const phone = document.getElementById("lm_phone").value.trim();
    const address = document.getElementById("lm_address").value.trim();
    const date = document.getElementById("lm_date").value;
    const time = document.getElementById("lm_time").value;
    const note = document.getElementById("lm_note").value.trim();

    if (!name || !email || !phone || !address) {
      alert("Please fill all required fields.");
      return;
    }

    const subtotal = CART.reduce((sum, item) => sum + item.lineTotal, 0);

    const booking = {
      id: "bk_" + Date.now(),
      createdAt: new Date().toISOString(),
      customer: { name, email, phone, address, date, time, note },
      items: CART,
      subtotal,
      tax: 0,
      total: subtotal
    };

    /* Save booking in LocalStorage */
    const saved = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || "[]");
    saved.push(booking);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(saved));


    /* Send Email (EmailJS) */
    if (typeof emailjs !== "undefined") {
      const itemsText = booking.items
        .map(it => `${it.name} - ${it.cloth} × ${it.qty} = ₹${it.lineTotal}`)
        .join("\n");

      emailjs.send(EMAIL_SERVICE_ID, TEMPLATE_OWNER, {
        booking_id: booking.id,
        fullName: name,
        email: email,
        phone: phone,
        services: itemsText,
        total: booking.total
      });

      emailjs.send(EMAIL_SERVICE_ID, TEMPLATE_USER, {
        booking_id: booking.id,
        fullName: name,
        email: email,
        services: itemsText,
        total: booking.total
      });
    }


    CART = [];
    renderCart();

    confirmationMessage.textContent =
      `Thank you ${name}! Your booking (${booking.id}) has been recorded.`;

    showStep(4);
  });


  /* Buttons on Final Step */
  doneButton.addEventListener("click", closePopup);

  viewBookingsButton.addEventListener("click", () => {
    const all = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || "[]");
    console.table(all);
    alert("Check your console for the list of all saved bookings.");
  });


  /* Initialize on Load */
  renderServices();
  renderCart();

});
