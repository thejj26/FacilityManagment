import db from './firebase.mjs'
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js'


try {
    const userDocRef = doc(db, "users", localStorage.getItem("userID"))
    const userDocSnap = await getDoc(userDocRef)
    if (!userDocSnap.exists()) {
        localStorage.removeItem("userID")
        window.location="../../index.html"
    }
} catch (e) {
    console.log("Error finding user", e)
}
