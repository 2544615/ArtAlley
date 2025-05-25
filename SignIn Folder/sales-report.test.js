/**
 * @jest-environment jsdom
 */

import { jest } from "@jest/globals";
import { loadSalesReport } from "./sales-report.js";

// Mock Chart.js
jest.mock("chart.js/auto", () => ({
  __esModule: true,
  default: jest.fn(),
  Chart: jest.fn().mockImplementation(() => ({
    destroy: jest.fn(),
    update: jest.fn()
  }))
}));

// Mock Firebase
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({
    currentUser: { uid: "seller123" }
  })),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback({ uid: "seller123" });
  })
}));

jest.mock("firebase/firestore", () => {
  return {
    getFirestore: jest.fn(),
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(() =>
      Promise.resolve({
        forEach: (cb) => {
          cb({
            data: () => ({
              productId: "prod1",
              quantity: 3,
              price: 100,
              timestamp: {
                toDate: () => new Date()
              }
            })
          });
        }
      })
    ),
    doc: jest.fn(),
    deleteDoc: jest.fn()
  };
});

// Mock DOM elements
beforeEach(() => {
  document.body.innerHTML = `
    <canvas id="salesChart"></canvas>
    <table id="sales-table"></table>
    <tbody id="sales-body"></tbody>
    <select id="trendFilter"><option value="30" selected>30</option></select>
    <select id="reportType"><option value="table" selected>Table</option></select>
    <select id="valueTypeFilter"><option value="sales" selected>Sales</option></select>
    <div id="total-sales-summary"></div>
    <div id="total-quantity-summary"></div>
  `;
});

describe("Sales Report", () => {
  test("loads and displays table report correctly", async () => {
    await loadSalesReport(30);

    const table = document.getElementById("sales-table");
    const chart = document.getElementById("salesChart");
    const tbody = document.getElementById("sales-body");

    expect(table.style.display).toBe("table");
    expect(chart.style.display).toBe("none");
    expect(tbody.children.length).toBeGreaterThan(0);

    const summary = document.getElementById("total-sales-summary").textContent;
    expect(summary).toMatch(/Total Sales: R/);

    const quantitySummary = document.getElementById("total-quantity-summary").textContent;
    expect(quantitySummary).toMatch(/Total Items Sold:/);
  });

  test("displays chart when reportType is 'line'", async () => {
    document.getElementById("reportType").value = "line";
    await loadSalesReport(30);

    const table = document.getElementById("sales-table");
    const chart = document.getElementById("salesChart");

    expect(table.style.display).toBe("none");
    expect(chart.style.display).toBe("block");
  });

  test("displays pie chart when reportType is 'pie'", async () => {
    document.getElementById("reportType").value = "pie";
    await loadSalesReport(30);

    const table = document.getElementById("sales-table");
    const chart = document.getElementById("salesChart");

    expect(table.style.display).toBe("none");
    expect(chart.style.display).toBe("block");
  });
});
