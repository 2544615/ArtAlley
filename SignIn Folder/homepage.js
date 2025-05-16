// homepage.js

document.addEventListener("DOMContentLoaded", function () {
  const roleForm = document.getElementById("roleForm");
  const roleSelect = document.getElementById("roleSelect");

  roleForm?.addEventListener("submit", function (event) {
    event.preventDefault();
    const selected = roleSelect?.value;
    if (selected) {
      window.location.href = selected;
    }
  });

  const searchIcon = document.querySelector('.fa-search')?.closest('button');
  const searchContainer = document.getElementById("searchContainer");
  const homeSearchInput = document.getElementById("homeSearchInput");

  searchIcon?.addEventListener("click", function () {
    searchContainer?.classList.toggle("hidden");
    if (!searchContainer?.classList.contains("hidden")) {
      homeSearchInput?.focus();
    }
  });

  const searchForm = document.getElementById("searchForm");
  searchForm?.addEventListener("submit", function (e) {
    e.preventDefault();
    const query = homeSearchInput?.value.trim();
    if (query) {
      localStorage.setItem("searchQuery", query);
      window.location.href = "../Buyer Folder/product-listing.html";
    }
  });
});
