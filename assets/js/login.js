import db from './firebase.mjs'
import { collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js'

const usersCollection = collection(db, "users") //firestore collection

const inputEmail = document.querySelector("#emailInput")
const inputPassword = document.querySelector("#passwordInput")
const btnLogin = document.querySelector("#btnLogin")
const credentialsAlert = document.querySelector('#alert')

btnLogin.addEventListener("click", attemptLogin)  //login attempt on button click
document.addEventListener("keyup", () => {  //login attempot on enter
    if (event.key == "Enter") attemptLogin()
})

async function attemptLogin() {
    let userData = null //stores user data
    const queryResult = await getDocs(generateQuery())  //stores the query results, is forwarded the generated query from the function
    queryResult.forEach(doc => { //stores the query results (user data), !!!THERE SHOUlD ONLY BE ONE USER!!! for some reason accesing the first element directly does not work
        userData = doc.data()
        userData.id = doc.id  //adds id for easier future usage

    })
    if (userData == null) credentialsAlert.style.display = "block"    //no user is found, alert shows
    else {   //user is found
        localStorage.setItem("userID", userData.id)
        if (!!sessionStorage.getItem("getStartedCached")) window.location = "../../facilities.html"   //if user clicked on get started
                    else window.location = "../../index.html"
    }
}
function generateQuery() {  //generates a query to find all matching users
    const userQuery = query(usersCollection,    //generates a Query object
        where("email", "==", inputEmail.value), //query conditions
        where("password", "==", inputPassword.value)
    )
    return userQuery
}