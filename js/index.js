// Import functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.8.2/firebase-auth.js";
import {
  getFirestore,
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/9.8.2/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQI12aP4kPkUN-mkY3ZdAmyBMJ3U4kYzw",
  authDomain: "yiersan-chi.firebaseapp.com",
  projectId: "yiersan-chi",
  storageBucket: "yiersan-chi.appspot.com",
  messagingSenderId: "633170881953",
  appId: "1:633170881953:web:6821be7eb43b4947006fe0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Register
const registerForm = document.getElementById("registerForm");
registerForm.addEventListener("submit", registerUser);

function registerUser() {
  // Get User Info
  const name = document.getElementById("registerName");
  const email = document.getElementById("registerEmail");
  const password = document.getElementById("registerPassword");

  console.log(name, email, password);

  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then((userCredential) => {
      // User is signed in
      const user = userCredential.user;

      // Create user in Firestore
      addDoc(collection(db, "users"), {
        name: name.value,
        email: email.value,
      })
        .then(() => {
          const q = query(
            collection(db, "users"),
            where("email", "==", user.email)
          );
          getDocs(q).then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              // Login user, redirect to main page
              addDoc(collection(db, "locations"), {
                name: "Default",
                user: doc.id,
                food: [],
                categories: [
                  "Dairy",
                  "Seafood & Meat",
                  "Vegetables",
                  "Fruits",
                  "Staples",
                  "Others",
                ],
              }).then(() => {
                alert("User created, redirecting to home page...");
                window.location.replace("home.html");
              });
            });
          });
        })
        .catch((error) => {
          alert("Server error, try again!");
          console.log(error);
        });
    })
    .catch((error) => {
      alert("Could not create user, try again!");
      console.log(error.code, error.message);
    });
}

// Login
const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", login);

function login() {
  const email = document.getElementById("loginEmail");
  const pass = document.getElementById("loginPassword");

  signInWithEmailAndPassword(auth, email.value, pass.value)
    .then((userCredential) => {
      const user = userCredential.user;
      alert("Login successful, redirecting to main page...");
      window.location.replace("home.html");
    })
    .catch((error) => {
      alert("Invalid account credentials! Try again.");
      console.log(error.code, error.message);
    });
}
