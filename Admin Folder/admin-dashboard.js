document.getElementById("view-users").addEventListener("click", function () {
    alert("View users logic goes here!");
    window.location.href="#";
});

document.getElementById("view-orders").addEventListener("click", function () {
    alert("View orders logic goes here!");
    window.location.href="#";
});

document.getElementById("add-admin").addEventListener("click", function () {
    alert("Admin creation logic goes here!");
    window.location.href="#";
});

document.getElementById("manage-access").addEventListener("click", function () {
    alert("User access management logic goes here!");
    window.location.href="#";
});

document.getElementById("manage-transactions").addEventListener("click", function () {
    alert("Transaction management logic goes here!");
    window.location.href="#";
});

document.getElementById('accountButton').addEventListener('click', function() {
    alert('Account management will open here');
});

document.getElementById('logoutButton').addEventListener('click', function() {
    if(confirm('Are you sure you want to logout?')) {
        alert('Logging out...');
        window.location.href = "admin-signin.html";
    }
});