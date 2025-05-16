import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, query, where, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDUfE0XLFPlpw_SAJIFoQlJhylk-r2VY4Y",
  authDomain: "artalley-b9c96.firebaseapp.com",
  projectId: "artalley-b9c96",
  storageBucket: "artalley-b9c96.appspot.com",
  messagingSenderId: "1056868925602",
  appId: "1:1056868925602:web:4fa9734632b255594917fb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);


onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Please log in to view your orders.");
    window.location.href = "../SignIn Folder/login-seller.html";
    return;
  }

  try {
    console.log("Fetching orders for user:", user.uid);
    
    // const q = query(
    //   collection(db, "orders"),
    //   where("userId", "==", user.uid),
    //   orderBy("timestamp", "desc")
    // );

    
    //     const snapshot = await getDocs(q);
    //     console.log("Orders snapshot:", snapshot);
        
    //     if (snapshot.empty) {
    //       console.log("No orders found for user"); 
    //       ordersContainer.innerHTML = "<p style='text-align:center;'>You have no orders yet.</p>";
    //       return;
    //     }

    const ordersRef = collection(db, "orders");
    const snapshot = await getDocs(ordersRef);

    const sellerOrders = [];

    snapshot.forEach((doc) => {
    const order = doc.data();
    const sellerItems = order.items.filter(item => item.sellerID === seller.uid);
    if (sellerItems.length > 0) {
        sellerOrders.push({ ...order, items: sellerItems });
    }
    });
    console.log(sellerOrders);

        } catch (error) {
            console.error("Error fetching orders:", error);
            // ordersContainer.innerHTML = `
            //   <p style='text-align:center;color:red;'>
            //     Error loading orders. Please try again later.
            //   </p>
            //   <p style='text-align:center;font-size:0.8rem;'>
            //     ${error.message || 'Unknown error'}
            //   </p>
            // `;
        }
        });