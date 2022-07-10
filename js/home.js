// Import functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.8.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  orderBy,
  setDoc,
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
  const name = document.getElementById("userName");
  const email = document.getElementById("userEmail");
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
async function getLocation() {
  const locations = document.getElementById("locationSelect");
  const q2 = query(
    collection(db, "locations"),
    where("user", "==", sessionStorage.getItem("userId")),
    orderBy("name")
  );
  getDocs(q2).then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      if (
        sessionStorage.getItem("location") == null ||
        sessionStorage.getItem("location") == undefined
      ) {
        sessionStorage.setItem("location", doc.get("name"));
        locations.innerHTML +=
          "<option selected class='locationOption' value='" +
          doc.get("name") +
          "'>" +
          doc.get("name") +
          "</option>";
      } else if (sessionStorage.getItem("location") == doc.get("name")) {
        locations.innerHTML +=
          "<option selected class='locationOption' value='" +
          doc.get("name") +
          "'>" +
          doc.get("name") +
          "</option>";
      } else {
        locations.innerHTML +=
          "<option class='locationOption' value='" +
          doc.get("name") +
          "'>" +
          doc.get("name") +
          "</option>";
      }
    });
  });
}

// event listeners for change in locations
const locationSelect = document.getElementById("locationSelect");
locationSelect.addEventListener("change", function () {
  sessionStorage.setItem(
    "location",
    locationSelect.options[locationSelect.selectedIndex].value
  );
  document.location.reload();
});

// get food information for selected location
// i.e. categories, food items
async function getFood() {
  const itemCategory = document.getElementById("itemCategory");

  const q3 = query(
    collection(db, "locations"),
    where("user", "==", sessionStorage.getItem("userId")),
    where("name", "==", sessionStorage.getItem("location"))
  );

  getDocs(q3).then((querySnapshot) => {
    querySnapshot.forEach((doc1) => {
      // populate category dropdown
      var categories = doc1.get("categories");
      for (const category of categories) {
        itemCategory.innerHTML +=
          "<option class='itemCategoryOption' value='" +
          category +
          "'>" +
          category +
          "</option>";
      }

      // populate food table
      var foods = doc1
        .get("food")
        .sort((a, b) => Date.parse(a.expiry) - Date.parse(b.expiry));
      sessionStorage.setItem("foods", JSON.stringify(foods));
      const table = document.getElementById("foodTable");
      for (const food of foods) {
        var tmp;
        var time = Math.round(
          (Date.parse(food.expiry) - Date.now()) / 86400000
        );
        if (Date.now() >= Date.parse(food.expiry)) {
          tmp = "<td class='table-danger'>";
        } else if (time < 10) {
          tmp = "<td class='table-warning'>";
        } else {
          tmp = "<td class='table-secondary'>";
        }

        var row = document.createElement("tr");
        row.innerHTML += tmp + food.name + "</td>";
        row.innerHTML += tmp + food.quantity + "</td>";
        row.innerHTML += tmp + food.category + "</td>";
        row.innerHTML += tmp + food.expiry + "</td>";
        row.innerHTML += tmp + time + " days</td>";
        row.innerHTML +=
          tmp +
          '<button class="btn btn-close foodButton" value="' +
          food.name +
          '" ></button></td>';

        table.append(row);
      }

      // event listeners for removing item
      const deleteButtons = document.querySelectorAll(".foodButton");
      deleteButtons.forEach((button) => {
        button.addEventListener("click", function (event) {
          var tmp = JSON.parse(sessionStorage.getItem("foods"));
          deleteFromArray(tmp, event.currentTarget.value);
          getDocs(q3).then((querySnapshot) => {
            querySnapshot.forEach((res) => {
              setDoc(
                doc(db, "locations", res.id),
                { food: tmp },
                { merge: true }
              ).then(() => {
                window.location.reload();
              });
            });
          });
        });
      });
    });
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
    categories: [
      "Dairy",
      "Seafood & Meat",
      "Vegetables",
      "Fruits",
      "Staples",
      "Others",
    ],
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

// add new food item
const addItem = document.getElementById("addItemForm");
addItem.addEventListener("submit", addItemHandler);
function addItemHandler() {
  const category = document.getElementById("itemCategory");
  const name = document.getElementById("itemName");
  const quantity = document.getElementById("itemQuantity");
  const expiry = document.getElementById("itemExpiry");

  let tmp = JSON.parse(sessionStorage.getItem("foods"));
  console.log(tmp, typeof tmp);
  tmp.push({
    name: name.value,
    category: category.value,
    quantity: quantity.value,
    expiry: expiry.value,
  });

  const q3 = query(
    collection(db, "locations"),
    where("user", "==", sessionStorage.getItem("userId")),
    where("name", "==", sessionStorage.getItem("location"))
  );

  getDocs(q3).then((querySnapshot) => {
    querySnapshot.forEach((doc1) => {
      setDoc(
        doc(db, "locations", doc1.id),
        { food: tmp },
        { merge: true }
      ).then(() => {
        window.location.reload();
      });
    });
  });
}

// helper function for deleting item from arrays
function deleteFromArray(arr, item) {
  var index = -1;
  for (let tmp of arr) {
    if (tmp.name == item) {
      index = arr.indexOf(tmp);
    }
  }
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}
