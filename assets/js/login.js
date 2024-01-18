import db from './firebase.mjs'
import { collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js';

//firestore collection
const usersCollection = collection(db, "users")

const inputEmail = document.querySelector("#emailInput")
const inputPassword = document.querySelector("#passwordInput")
const btnLogin = document.querySelector("#btnLogin")
const credentialsAlert = document.querySelector('#alert')

btnLogin.addEventListener("click", async () => {    //checks for an existing user on click
    let userData = null //stores user data
    const queryResult = await getDocs(generateQuery())  //stores the query results, is forwarded the generated query from the function
    userData=queryResult[0] //stores the query results (user data), !!!THERE SHOUlD ONLY BE ONE USER!!!
    if (userData == null) { //no user is found
        credentialsAlert.style.display = "block"    //alerts shows
    } else (    //user is found
        alert(JSON.stringify(userData)) //TODO redirect
    )
})

function generateQuery() {  //generates a query to find all matching users
    const userQuery = query(usersCollection,    //generates a Query object
        where("email", "==", inputEmail.value), //query conditions
        where("password", "==", inputPassword.value)
    )
    return userQuery
}