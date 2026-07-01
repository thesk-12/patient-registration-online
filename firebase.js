import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCUIHkc3D9Ll3Jc5Wtq8Gbv6rFVT7bQcyI",
  authDomain: "patient-info-system-56221.firebaseapp.com",
  projectId: "patient-info-system-56221",
  storageBucket: "patient-info-system-56221.firebasestorage.app",
  messagingSenderId: "336130423992",
  appId: "1:336130423992:web:f4be533fef94c5621ac84d"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

window.db = db;