import db from './firebase.mjs'
import { collection, query, where, getDocs, doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js'

const usersCollection = collection(db, "users") //firestore collection

const inputEmail = document.querySelector("#emailInput")
const inputPassword = document.querySelector("#passwordInput")
const inputPasswordConfirm = document.querySelector('#passwordConfrimInput')
const btnRegister = document.querySelector("#btnRegister")

btnRegister.addEventListener("click", attemptRegister)

function valiadateRegister() {   //valiadates user data
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ //regex that accepts valid email addressees
    switch (false) {
        case (emailRegex.test(inputEmail.value)):   //invalid email
            return 1
            break
        case (inputPassword.value == inputPasswordConfirm.value):   //passwords do not match
            return 2
            break
        case (inputPassword.value.trim().length >= 6):  //password is too short
            return 3
            break
        default:
            const emailQuery = query(usersCollection, where("email", "==", inputEmail.value))   //query that checks user emails that match the inputed email
            return getDocs(emailQuery).then((res) => {    //returns the value of the query snapshot
                if (res.size == 0) return 0    //email is not used
                else return 4   //email is used
            }).catch((error) => { //error handling
                console.log("Error while checking email", error)
                return 5
            })
            break
    }
}

async function attemptRegister() {  //attempts to register the user
    const valiadationStatus = await valiadateRegister()
    switch (valiadationStatus) {
        case 0: //info is ok
            const registationData = { //user data
                email: inputEmail.value,
                password: inputPassword.value,
                username: inputEmail.value.split("@")[0],    //default username is the email without the domain name
                verified: false
            }
            const newUserDoc = doc(usersCollection) //new doc to register the user
            setDoc(newUserDoc, registationData).then(() => {    //attempts to write new data to db
                console.log("User registered successfully") //success
            }).catch((error) => {   //error handling
                console.log("Error registering user doc", error)
            })
            break
        case 1: //invalid email
            break
        case 2: //passwornds dont match
            break
        case 3: //password too shot
            break
        case 4: //email is already used
            break
        default:
            console.log("Error valiadating registartion info")    //error
            break
    }
}