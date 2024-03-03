import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js';


//app data for valiadating
const firebaseConfig = {
    apiKey: "AIzaSyD1ZFJ9o69xXoKiIVT_QyMavG7IN-D_3B4",
    authDomain: "facility-management-b1f0f.firebaseapp.com",
    projectId: "facility-management-b1f0f",
    storageBucket: "facility-management-b1f0f.appspot.com",
    messagingSenderId: "40431073598",
    appId: "1:40431073598:web:b79fe624052aec9783d46f"
}
//initialization
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

//exporting to other js files
export default db