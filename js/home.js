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
  getDocs,
  addDoc,
  orderBy,
  deleteDoc,
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
let userId;

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

// get all user information
function getInfo(user) {
  // get user information
  const name = document.getElementById('userName');
  const email = document.getElementById('userEmail');
  const q = query(collection(db, "users"), where("email", "==", user.email));
  getDocs(q).then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      sessionStorage.setItem("userId", doc.id);
      name.value = doc.get("name");
      email.value = doc.get("email");
      getLocation();
      getFood();
    });
  });
}

// get all location information
function getLocation() {
  const q2 = query(
    collection(db, "locations"),
    where("user", "==", sessionStorage.getItem("userId"))
  );
  getDocs(q2).then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      console.log(doc.id, doc.data());
    });
  });
}

// TODO SELECT KITCHEN PROPERLY
function getFood() {
  // get food information for selected location
  // const location = document.getElementById("selectedLocation");
  
  const q3 = query(
    collection(db, "locations"),
    where("user", "==", sessionStorage.getItem("userId")),
    where("name", "==", "My Kitchen 2")
  );

  getDocs(q3).then((querySnapshot) => { 
    querySnapshot.forEach((doc) => {
      var foods = doc.get("food").sort((a,b) => Date.parse(a.expiry) - Date.parse(b.expiry));
      const table = document.getElementById('foodTable');

      for (const food of foods) {
        var tmp;
        var time = Math.round((Date.parse(food.expiry) - Date.now())/86400000);
        if (Date.now() >= Date.parse(food.expiry)) {
          tmp = "<td class='table-danger'>";
        } else if (time < 10) {
          tmp = "<td class='table-warning'>";
        } else {
          tmp = "<td class='table-secondary'>";
        }

        var row = document.createElement("tr");
        row.innerHTML += (tmp + food.name + "</td>");
        row.innerHTML += (tmp + food.quantity + "</td>");
        row.innerHTML += (tmp + food.category + "</td>");
        row.innerHTML += (tmp + food.expiry + "</td>");
        row.innerHTML += (tmp + time + " days</td>");
        row.innerHTML += (tmp + '<button class="btn btn-light ">Remove</button></td>');

        table.append(row);
      }
    })
  });
}

// add new location to database
const location = document.getElementById("newLocationForm");
location.addEventListener("submit", addLocation);
function addLocation() {
  const location = document.getElementById("newLocation");
  addDoc(collection(db, "locations"), {
    user: sessionStorage.getItem("userId"),
    name: location.value,
    food: [],
    categories: ["Dairy", "Seafood & Meat", "Vegetables", "Fruits", "Staples"],
  })
    .then(() => {
      alert("Location added!");
      document.location.reload();
    })
    .catch((error) => {
      alert("Error adding location, try again later!");
      console.log(error);
    });
}
