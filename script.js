// script.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDsjF0qZ_sAC281REEuTM16UPw96FfeuDo",
  authDomain: "sagadat-toi.firebaseapp.com",
  projectId: "sagadat-toi",
  storageBucket: "sagadat-toi.firebasestorage.app",
  messagingSenderId: "473584135678",
  appId: "1:473584135678:web:2668a21009654b7327a4af"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function getHashFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function showError() {
  document.body.innerHTML = `
    <div style="text-align:center;padding:60px;font-size:1.6em;color:#c0392b;background:#fff;border-radius:12px;margin:20px auto;max-width:600px;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
      Сіздің сілтемеңіз қате! Бізбен хабарласыңыз.
    </div>`;
}

function updateCountdown() {
  const targetDate = new Date("2025-06-30T18:00:00+06:00");
  const now = new Date();
  const diff = targetDate - now;

  if (diff <= 0) {
    document.getElementById("countdown").innerHTML = "<span>Той басталды!</span>";
    return;
  }

  const days = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0');
  const hours = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
  const minutes = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
  const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');

  document.getElementById("countdown").innerText = `${days}:${hours}:${minutes}:${seconds}`;

}

setInterval(updateCountdown, 1000);

async function main() {
  document.body.style.opacity = "0";
  document.body.style.transition = "opacity 0.5s ease";
  setTimeout(() => (document.body.style.opacity = "1"), 100);

  const hash = getHashFromURL();
  if (!hash) return showError();

  try {
    const docRef = doc(db, "sagadat", hash);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return showError();

    const data = docSnap.data();
    const numberOfPeople = data.numberOfPeople || 0;
    const nameContainer = document.getElementById("nameCheckboxes");
    nameContainer.innerHTML = "";

    const people = [];
    for (let i = 1; i <= numberOfPeople; i++) {
      const personKey = `person${i}`;
      const name = data[personKey];
      if (name) {
        people.push({ name, index: i });
        nameContainer.innerHTML += `
          <label>
            <input type="checkbox" name="guests" value="${name}" data-person="${i}"> ${name}
          </label>
        `;
      }
    }

    const wishesDiv = document.getElementById("wishes");
    wishesDiv.innerHTML = ""; // Clear existing content

    const allDocs = await getDocs(collection(db, "sagadat"));
    for (const docSnap of allDocs.docs) {
      const wish = docSnap.data().wish;
      if (wish) {
        wishesDiv.innerHTML += `
          <div class="wish-card">
            <p>${wish}</p>
          </div>`;
      }
    }


    document.getElementById("rsvpForm").addEventListener("submit", async (e) => {
      e.preventDefault();

      try {
        const checkboxes = document.querySelectorAll('input[name="guests"]');
        const updates = {};
        for (const cb of checkboxes) {
          const personNum = cb.getAttribute("data-person");
          const attending = cb.checked;
          updates[`person${personNum}WillCome`] = attending;
        }

        const wishText = document.getElementById("wish").value.trim();
        if (wishText) {
          updates["wish"] = wishText; // Save wish as a top-level field
        }

        await setDoc(docRef, updates, { merge: true });

        alert("Жауабыңыз үшін рақмет!");
        document.getElementById("rsvpForm").reset();
        location.reload();
      } catch (error) {
        console.error("Error submitting RSVP:", error);
        alert("Қате пайда болды. Кейінірек қайталап көріңіз.");
      }
    });
  } catch (error) {
    console.error("Error loading data:", error);
    showError();
  }
}

window.onload = function() {
  main();
  playAudio();
}