import db from './firebase.mjs'
import { collection, query, where, getDocs, doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js'

const usersCollection = collection(db, "users") //firestore collection

const inputEmail = document.querySelector("#emailInput")
const inputPassword = document.querySelector("#passwordInput")
const inputPasswordConfirm = document.querySelector('#passwordConfrimInput')
const btnRegister = document.querySelector("#btnRegister")
const registerAlert = document.querySelector("#alert")

btnRegister.addEventListener("click", attemptRegister)

function valiadateRegister() {   //valiadates user data
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ //regex that accepts valid email addressees
    switch (false) {
        case (emailRegex.test(inputEmail.value)):   //invalid email
            btnRegister.addEventListener("click", attemptRegister)   //adds event listener back
            return 1
            break
        case (inputPassword.value == inputPasswordConfirm.value):   //passwords do not match
            btnRegister.addEventListener("click", attemptRegister)
            return 2
            break
        case (inputPassword.value.trim().length >= 6):  //password is too short
            btnRegister.addEventListener("click", attemptRegister)
            return 3
            break
        default:
            const emailQuery = query(usersCollection, where("email", "==", inputEmail.value))   //query that checks user emails that match the inputed email
            return getDocs(emailQuery).then((res) => {    //returns the value of the query snapshot
                if (res.size == 0) return 0    //email is not used
                else {  //email is used
                    btnRegister.addEventListener("click", attemptRegister)
                    return 4
                }
            }).catch((error) => { //error handling
                console.log("Error while checking email", error)
                btnRegister.addEventListener("click", attemptRegister)
                return 5
            })
            break
    }
}

async function attemptRegister() {  //attempts to register the user
    btnRegister.removeEventListener("click", attemptRegister)    //removes event listener to avoid spamming
    const valiadationStatus = await valiadateRegister()
    switch (valiadationStatus) {
        case 0: //info is ok
            const registationData = { //user data
                email: inputEmail.value,
                password: inputPassword.value,
                username: inputEmail.value.split("@")[0],    //default username is the email without the domain name
                fullname: "",
                company:""
            }
            const newUserDoc = doc(usersCollection) //new doc to register the user
            setDoc(newUserDoc, registationData).then(async () => {    //attempts to write new data to db
                console.log("User registered successfully") //success
                //get the current user's id to store it
                const currentUserQuery = query(usersCollection, where("email", "==", inputEmail.value))
                const queryResult = await getDocs(currentUserQuery)
                queryResult.forEach(doc => {
                    localStorage.setItem("userID", doc.id)
                    if (!!sessionStorage.getItem("getStartedCached")) window.location = "../../facilities.html"   //if user clicked on get started
                    else window.location = "../../index.html"
                })
            }).catch((error) => {   //error handling
                console.log("Error registering user doc", error)
            })
            break
        case 1: //invalid email
            registerAlert.style.display = "block"
            registerAlert.innerHTML = "Invalid email address."
            break
        case 2: //passwornds dont match
            registerAlert.style.display = "block"
            registerAlert.innerHTML = "Passwords do not match."
            break
        case 3: //password too short
            registerAlert.style.display = "block"
            registerAlert.innerHTML = "Password must contain at least 6 characters."
            break
        case 4: //email is already used
            registerAlert.style.display = "block"
            registerAlert.innerHTML = "An account with this email already exists."
            break
        default:
            console.log("Error valiadating registartion info")    //error
            registerAlert.style.display = "block"
            registerAlert.innerHTML = "Error registering account. Try again."
            break
    }
}