/**
 * @jest-environment jsdom
 */

import { test, describe, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe("Admin dashboard buttons event listeners", () => {
  beforeEach(() => {
    // Set up the DOM buttons
    document.body.innerHTML = `
      <button id="view-users">View Users</button>
      <button id="view-orders">View Orders</button>
      <button id="add-admin">Add Admin</button>
      <button id="manage-access">Manage Access</button>
      <button id="manage-transactions">Manage Transactions</button>
      <button id="accountButton">Account</button>
      <button id="logoutButton">Logout</button>
    `;

    // Re-define the event listeners here (or import your JS file that contains them)
    document.getElementById("view-users").addEventListener("click", function () {
      alert("View users logic goes here!");
      window.location.href = "#";
    });

    document.getElementById("view-orders").addEventListener("click", function () {
      alert("View orders logic goes here!");
      window.location.href = "#";
    });

    document.getElementById("add-admin").addEventListener("click", function () {
      alert("Admin creation logic goes here!");
      window.location.href = "#";
    });

    document.getElementById("manage-access").addEventListener("click", function () {
      alert("User access management logic goes here!");
      window.location.href = "#";
    });

    document.getElementById("manage-transactions").addEventListener("click", function () {
      alert("Transaction management logic goes here!");
      window.location.href = "#";
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

    // Mock window.location for testing redirects
    delete window.location;
    window.location = { href: "" };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("clicking 'view-users' shows alert and updates href", () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const btn = document.getElementById("view-users");

    btn.click();

    expect(alertMock).toHaveBeenCalledWith("View users logic goes here!");
    expect(window.location.href).toBe("#");

    alertMock.mockRestore();
  });

  test("clicking 'view-orders' shows alert and updates href", () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const btn = document.getElementById("view-orders");

    btn.click();

    expect(alertMock).toHaveBeenCalledWith("View orders logic goes here!");
    expect(window.location.href).toBe("#");

    alertMock.mockRestore();
  });

  test("clicking 'add-admin' shows alert and updates href", () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const btn = document.getElementById("add-admin");

    btn.click();

    expect(alertMock).toHaveBeenCalledWith("Admin creation logic goes here!");
    expect(window.location.href).toBe("#");

    alertMock.mockRestore();
  });

  test("clicking 'manage-access' shows alert and updates href", () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const btn = document.getElementById("manage-access");

    btn.click();

    expect(alertMock).toHaveBeenCalledWith("User access management logic goes here!");
    expect(window.location.href).toBe("#");

    alertMock.mockRestore();
  });

  test("clicking 'manage-transactions' shows alert and updates href", () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const btn = document.getElementById("manage-transactions");

    btn.click();

    expect(alertMock).toHaveBeenCalledWith("Transaction management logic goes here!");
    expect(window.location.href).toBe("#");

    alertMock.mockRestore();
  });

  test("clicking 'accountButton' shows alert", () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const btn = document.getElementById("accountButton");

    btn.click();

    expect(alertMock).toHaveBeenCalledWith("Account management will open here");

    alertMock.mockRestore();
  });

  test("clicking 'logoutButton' with confirm true alerts and redirects", () => {
    const confirmMock = jest.spyOn(window, 'confirm').mockImplementation(() => true);
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const btn = document.getElementById("logoutButton");

    btn.click();

    expect(confirmMock).toHaveBeenCalledWith('Are you sure you want to logout?');
    expect(alertMock).toHaveBeenCalledWith('Logging out...');
    expect(window.location.href).toBe('admin-signin.html');

    confirmMock.mockRestore();
    alertMock.mockRestore();
  });

  test("clicking 'logoutButton' with confirm false does nothing", () => {
    const confirmMock = jest.spyOn(window, 'confirm').mockImplementation(() => false);
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    const btn = document.getElementById("logoutButton");

    btn.click();

    expect(confirmMock).toHaveBeenCalledWith('Are you sure you want to logout?');
    expect(alertMock).not.toHaveBeenCalled();
    expect(window.location.href).toBe(''); // no redirect

    confirmMock.mockRestore();
    alertMock.mockRestore();
  });
});