import db from './firebase.mjs'
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js'

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
btnSaveChanges.addEventListener("click", () => { attemptSave(userDocSnap.data()) })

function loadUserData(userData) {    //loads user data into the input fields
    inputUsername.value = userData.username
    inputEmail.value = userData.email
    inputFullName.value = userData.fullname
    inputCompany.value = userData.company
    inputOldPassword.value = ""
    inputNewPassword.value = ""
    inputConfirmNewPassword.value = ""
}
//checks wether email is already in use
function checkEmail(email) {
    const emailQuery = query(usersCollection, where("email", "==", email))   //query that checks user emails that match the inputed email
    return getDocs(emailQuery).then((res) => {    //returns the value of the query snapshot
        if (res.size == 0) return 0    //email is not used
        else return 2   //email is used
    }).catch(() => { return 3 }) //error checking email
}
//valiadates the users email
async function valiadateEmail() {
    const email = inputEmail.value
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    switch (true) {
        case (!emailRegex.test(email)):
            return 1    //email is invalid
            break
        default:
            return await checkEmail(email)
            break
    }
}
//valiadates user data
async function valiadateData(userData) {
    switch (true) {
        case (inputUsername.value.trim() == ""):
            return 1    //no username
            break
        case (inputEmail.value.trim() == ""):
            return 2    //no email
            break
        case (inputEmail.value.trim() != userData.email):
            const res = await valiadateEmail()
            if (res != 0) {
                switch (res) {
                    case 1:
                        return 3 //invalid email
                        break
                    case 2:
                        return 4 //email is used
                        break
                    case 3:
                        return 5 //email error
                        break
                }
            }
            break
        case (inputOldPassword.value == "" && (inputNewPassword.value != "" || inputConfirmNewPassword.value != "")):
            return 6    //no old password
            break
        case (inputOldPassword.value != ""):
            if (inputOldPassword.value != userData.password) {
                return 7    //incorrect old password
            } else {
                const newPassword = inputNewPassword.value
                const confrimNewPassword = inputConfirmNewPassword.value
                if (newPassword.length < 6) {
                    return 8    //new password is too short
                } else if (newPassword != confrimNewPassword) {
                    return 9    //passwords dont match
                } else if (newPassword == userData.password) {
                    return 10   //didnt change password
                }
            }
            break
    }
    if (inputUsername.value == userData.username && inputEmail.value == userData.email && inputFullName.value == userData.fullname && inputCompany.value == userData.company && inputOldPassword.value == "") {
        return 11
    }
    return 0
}
//attempts to save the user data and handles invalid vaiadation
async function attemptSave(userData) {
    const valiadationResult = await valiadateData(userData)
    const passwordTemp = (inputNewPassword.value == "") ? userData.password : inputNewPassword.value
    inputOldPassword.value = ""
    inputNewPassword.value = ""
    inputConfirmNewPassword.value = ""
    console.log(valiadationResult)
    if (valiadationResult != 0) {
        switch (valiadateData) {
            case 1: //no username
                break
            case 2: //no email
                break
            case 3: //invalid email
                break
            case 4: //email is already in use
                break
            case 5: //email error
                break
            case 6: //no old password
                break
            case 7: //incorrect old password
                break
            case 8: //short password
                break
            case 9: //passwords dont match
                break
            case 10:    //password didnt change
                break
            case 11:    //no data change
                break
            default:    //valiadation error
                break
        }
        return
    }
    const userObject = {    //object that stores new user data, used for updating
        email: inputEmail.value.trim(),
        password: passwordTemp,
        username: inputUsername.value.trim(),
        fullname: inputFullName.value.trim(),
        company: inputCompany.value.trim()
    }
    updateDoc(userDocRef, userObject).then(() => {  //updates the user doc
        console.log("success")
    }).catch(() => {
        console.log("error")
    })
}
//TODO: del account, error handling, notifying and refreshong the page