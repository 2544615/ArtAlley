// Export all functions and variables needed for testing
export const initializeCheckout = () => {
  const ship = document.getElementById('form2');
  
  onAuthStateChanged(auth, async(user) => {
    if (!user) {
      alert("Please log in first.");
      window.location.href = "../SignIn Folder/login-buyer.html";
      return;
    }
    
    let total = 0;

    ship.addEventListener("submit", async (e) => {
      e.preventDefault();
      await handleCheckoutSubmit(user, total);
    });

    await loadCartItems(user);
  });
};

export const handleCheckoutSubmit = async (user, total) => {
  const firstname = document.getElementById('firstname').value;
  const lastname = document.getElementById('lastname').value;
  const country = document.getElementById('country').value;
  const city = document.getElementById('city').value; 
  const address = document.getElementById('address').value; 
  const email = document.getElementById('email').value;
  const contact = parseInt(document.getElementById('contact').value);
  const note = document.getElementById('note').value;

  try {
    await addDoc(collection(db, "shipping"), {
      firstname,
      lastname,
      country,
      city,
      address,
      email,
      contact,
      note,
      buyeruid: user.uid,
      timestamp: serverTimestamp()
    });
    
    localStorage.setItem("checkoutAmount", total.toFixed(2));
    localStorage.setItem("checkoutEmail", email);
    window.location.href = "paystack.html";
  } catch (error) {
    console.error("Error uploading product:", error);
    alert("Failed to add product.");
  }
};

export const loadCartItems = async (user) => {
  const cartItemsRef = collection(db, "users", user.uid, "cart", "active", "items");
  const snapshot = await getDocs(cartItemsRef);
  const cartItemsSection = document.getElementById("cart-items");
  let total = 0;

  if (snapshot.empty) {
    cartItemsSection.innerHTML = "<p>Your cart is empty.</p>";
    return total;
  }

  cartItemsSection.innerHTML = "";

  snapshot.forEach(doc => {
    const item = doc.data();
    const subtotal = item.price * item.quantity;
    total += subtotal;

    const itemSummary = document.createElement("section");
    itemSummary.classList.add("summary-item");
    itemSummary.innerHTML = `
      <p>${item.quantity}x ${item.name}</p>
      <p>R${subtotal.toFixed(2)}</p>
    `;
    cartItemsSection.appendChild(itemSummary);
  });

  const totalSection = document.createElement("section");
  totalSection.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    padding-top: 0.5rem;
    border-top: 2px solid #000;
  `;
  totalSection.innerHTML = `
    <h4 style="margin: 0;">Total</h4>
    <p style="margin: 0; font-weight: bold;">R${total.toFixed(2)}</p>
  `;
  cartItemsSection.appendChild(totalSection);

  return total;
};

export const loadCountriesAndCities = () => {
  const countrySelect = document.getElementById("country");
  const citySelect = document.getElementById("city");

  fetch("https://countriesnow.space/api/v0.1/countries/positions")
    .then(response => response.json())
    .then(data => {
      const countries = data.data.map(c => c.name).sort();
      countrySelect.innerHTML = '<option value="">Select your country</option>';
      countries.forEach(country => {
        const option = document.createElement("option");
        option.value = country;
        option.textContent = country;
        countrySelect.appendChild(option);
      });
    })
    // In loadCountriesAndCities
.catch((error) => {
  console.error('Failed to load countries:', error);
  countrySelect.innerHTML = '<option value="">Error loading countries</option>';
});


  countrySelect.addEventListener("change", () => {
    const selectedCountry = countrySelect.value;
    citySelect.disabled = true;
    citySelect.innerHTML = '<option>Loading cities...</option>';

    fetch("https://countriesnow.space/api/v0.1/countries/cities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ country: selectedCountry })
    })
    .then(response => response.json())
    .then(data => {
      const cities = data.data;
      citySelect.innerHTML = '<option value="">Select your city</option>';
      cities.forEach(city => {
        const option = document.createElement("option");
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
      });
      citySelect.disabled = false;
    })
    .catch(() => {
      citySelect.innerHTML = '<option value="">Could not load cities</option>';
      citySelect.disabled = true;
    });
  });
};

// Initialize on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  initializeCheckout();
  loadCountriesAndCities();
});