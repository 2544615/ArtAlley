import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDUfE0XLFPlpw_SAJIFoQlJhylk-r2VY4Y",
  authDomain: "artalley-b9c96.firebaseapp.com",
  projectId: "artalley-b9c96",
  storageBucket: "artalley-b9c96.appspot.com",
  messagingSenderId: "1056868925602",
  appId: "1:1056868925602:web:4fa9734632b255594917fb"
};

// Firebase initialization
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

let cart = [];

export async function addToCart(product) {
  const user = auth.currentUser;
  if (!user) return alert("You must be logged in.");

  const userId = user.uid;
  const cartRef = doc(db, "users", userId, "cart", "active");
  const cartSnap = await getDoc(cartRef);

  if (!cartSnap.exists()) {
    await setDoc(cartRef, { total: 0 });
  }

  const itemsRef = collection(cartRef, "items");
  const q = query(itemsRef, where("name", "==", product.name));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const docRef = snapshot.docs[0].ref;
    const existingItem = snapshot.docs[0].data();
    if (existingItem.quantity + 1 > product.quantity) {
      return alert(`Only ${product.quantity} item(s) in stock.`);
    }
    await updateDoc(docRef, {
      quantity: existingItem.quantity + 1,
    });
  } else {
    if (product.quantity < 1) {
      return alert("This product is out of stock.");
    }

    await addDoc(itemsRef, {
      name: product.name,
      price: product.price,
      quantity: 1,
      user: userId,
      imageUrl: product.imageUrls?.[0] || "",
      stock: product.quantity,
    });
  }

  await loadCartFromFirestore(); // Refresh local cart
  updateCartUI();
}

export async function loadCartFromFirestore() {
  const user = auth.currentUser;
  if (!user) return;

  const cartItemsRef = collection(db, "users", user.uid, "cart", "active", "items");
  const snapshot = await getDocs(cartItemsRef);

  cart = [];
  snapshot.forEach((doc) => {
    cart.push(doc.data());
  });

  updateCartUI();
}

export function getCart() {
  return cart;
}

export function updateCartUI() {
  // In real app, DOM updates would go here.
  // In tests, this can be mocked or asserted separately.
  console.log("Cart updated:", cart);
}

// Automatically load cart when auth state changes
onAuthStateChanged(auth, async (user) => {
  if (user) {
    await loadCartFromFirestore();
  } else {
    cart = [];
    updateCartUI();
  }
});
