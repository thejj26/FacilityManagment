import db from './firebase.mjs'
import { collection, query, where, getDocs, doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js'

const usersCollection = collection(db, "users")
//html dom elements
let inputUsername = document.querySelector("#inputUsername")
let inputEmail = document.querySelector("#inputEmail")
let inputFullName = document.querySelector("#inputName")
let inputCompany = document.querySelector("#inputCompany")
let inputOldPassword = document.querySelector("#oldPassword")
let inputNewPassword = document.querySelector("#newPassword")
let inputConfirmNewPassword = document.querySelector("#confirmNewPassword")
let btnRevert = document.querySelector("#btnRevert")
let btnSaveChanges = document.querySelector("#btnSave")
//fetching user data
const userDocRef = doc(db, "users", localStorage.getItem("userID"))
const userDocSnap = await getDoc(userDocRef)
//trying to load user data
try {
    loadUserData(userDocSnap.data())
} catch (error) {  //if an error occurs (for example an error fetching user data), the user is redirected
    confirm("Error loading user data")
    window.location = "../../index.html"
}

btnRevert.addEventListener("click", () => { loadUserData(userDocSnap.data()) }) //resets user data to the inital value

function loadUserData(userData) {    //loads user data into the input fields
    inputUsername.value = userData.username
    inputEmail.value = userData.email
    inputFullName.value = userData.fullname
    inputCompany.value = userData.company
    inputOldPassword.value=""
    inputNewPassword.value=""
    inputConfirmNewPassword.value=""
}