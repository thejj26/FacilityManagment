import db from './firebase.mjs'
import { collection, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js'

const usersCollection = collection(db, "users")
const facilitiesCollection = collection(db, "facilities")
//html dom elements
const inputUsername = document.querySelector("#inputUsername")
const inputEmail = document.querySelector("#inputEmail")
const inputFullName = document.querySelector("#inputName")
const inputCompany = document.querySelector("#inputCompany")
const inputOldPassword = document.querySelector("#oldPassword")
const inputNewPassword = document.querySelector("#newPassword")
const inputConfirmNewPassword = document.querySelector("#confirmNewPassword")
const btnRevert = document.querySelector("#btnRevert")
const btnSaveChanges = document.querySelector("#btnSave")
const btnDel = document.querySelector("#delAccount")

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
btnDel.addEventListener("click", deleteAccount)

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
        switch (valiadationResult) {
            case 1: //no username
                setToastAlert("Username cannot be blank", true, false)
                break
            case 2: //no email
                setToastAlert("Email cannot be blank", true, false)
                break
            case 3: //invalid email
                setToastAlert("Invalid email", true, false)
                break
            case 4: //email is already in use
                setToastAlert("Email is already in use", true, false)
                break
            case 5: //email error
                setToastAlert("Error valiadating email", true, false)
                break
            case 6: //no old password
                setToastAlert("Enter old password", true, false)
                break
            case 7: //incorrect old password
                setToastAlert("Incorrect old password", true, false)
                break
            case 8: //short password
                setToastAlert("New password must contain at least 6 characters", true, false)
                break
            case 9: //passwords dont match
                setToastAlert("Passwords don't match", true, false)
                break
            case 10:    //password didnt change
                setToastAlert("New password cannot be the same as the old one", true, false)
                break
            case 11:    //no data change
                setToastAlert("No information was changed", false, false)
                break
            default:    //valiadation error
                setToastAlert("Error valiadating information", true, false)
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
        setToastAlert("Information updated", false, true)
    }).catch(() => {
        setToastAlert("Error updating information", true, false)
    })
}
//handlees the toast alert animation
function setToastAlert(text, isAlert, refreshPage) {
    //elements
    const alertToast = document.querySelector(".toast-alert")
    const toastContent = alertToast.firstElementChild
    //sets the text message
    toastContent.innerHTML = text
    //handles classes
    alertToast.classList.add("active")
    if (isAlert) alertToast.classList.remove("info")
    else alertToast.classList.add("info")
    //removes the active class after toast dissapears
    alertToast.addEventListener("animationend", () => {
        alertToast.classList.remove("active")
        if (refreshPage) window.location.reload()
    })
}
//deletes the user account
async function deleteAccount() {
    const response = confirm("Are you sure you want to delete your account? This action cannot be undone.")
    if (!response) return   //user confirmation
    const facilitiesQuery = query(facilitiesCollection, //query that checks for the facility owner
        where("owner", "==", localStorage.getItem("userID"))
    )
    const queryResult = await getDocs(facilitiesQuery)
    queryResult.forEach(_doc => {
        deleteDoc(doc(db, "facilities", _doc.id)).then(() => {
            deleteDoc(userDocRef).then(() => {
                window.location = "../../index.html"    //returning to the homepage after deleting account
            }).catch(() => {
                setToastAlert("Error while deleting account", true, false)
            })
        }).catch(() => {
            setToastAlert("Error while deleting account", true, false)
        })
    })

}