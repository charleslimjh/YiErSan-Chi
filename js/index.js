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
  const password = document.getElementById("registerPass");

  createUserWithEmailAndPassword(auth, email.value, pass.value)
    .then((userCredential) => {
      // User is signed in
      const user = userCredential.user;

      // Create user in Firestore
      addDoc(collection(db, "users"), {
        name: name,
        email: email,
      })
        .then(() => {
          // Login user, redirect to main page
          alert("User created successfully! Redirecting to main page...");
          window.location.replace("main.html");
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
      window.location.replace("main.html");
    })
    .catch((error) => {
      alert("Invalid account credentials! Try again.");
      console.log(error.code, error.message);
    });
}
