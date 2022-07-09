// Import functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.8.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
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

// Ensure user is logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("body").style.display = "block";
    getInfo(user);
  } else {
    window.location.replace("/index.html");
  }
});

// Sign Out
let signOutLink = document.getElementById("signOutButton");
signOutLink.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      // Sign-out successful.
      window.location.replace("index.html");
    })
    .catch((error) => {
      // An error happened.
      alert("An error occurred. Try again.");
      console.log("Error occurred.");
    });
});

function getInfo(user) {
  const userEmail = user.email;

  const q = query(collection(db, "users"), where("email", "==", userEmail));
  getDocs(q).then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      console.log(doc.id, doc.data());
    });
  })
}
