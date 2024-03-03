import db from './firebase.mjs'
import { collection, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js'

const facilitiesCollection = collection(db, "facilities")

const facilityList = document.querySelector("#facilityList")

document.querySelectorAll(".logout").forEach(el => {    //logout functionality
    el.addEventListener("click", () => {
        localStorage.removeItem("userID")
        window.location.replace("../../index.html")
    })
})

fetchFacilities(localStorage.getItem("userID")).then(() => {  //fetches user's facilities when the site loads
    if (facilities.length > 0) {    //checks if there are any facilities and removes the after element if so
        facilityList.classList.add("hide-after")
    } else {
        facilityList.classList.remove("hide-after")
    }
})

async function fetchFacilities(userID) {    //fetches facilities that belong to the current user
    const facilitiesQuery = query(facilitiesCollection, //query that checks for the facility owner
        where("owner", "==", userID)
    )
    const queryResult = await getDocs(facilitiesQuery)  //gets coresponding docs
    queryResult.forEach(doc => {
        facilities.push(doc) //adds facility docs to the array
        addFacilityCard(doc)//adds docs to the html
    })
}

let facilities = []

function generateFacilityCard(facility) {   //generates a html element with all the needed info from the facility
    return `
   <div class="facility row">
        <div class="info row col-11">
            <div class="col-2 icon">
                <span class="material-symbols-outlined">
                    home
                </span>
            </div>
            <div class="col-4">
                <p class="name">${facility.data().name}</p>
            </div>
            <div class="col-4">
                <p class="address">${facility.data().address}</p>
            </div>
            <div class="col-2 revenue">
                <p class="revenue">${facility.data().revenue}€</p>
            </div>
        </div>
        <div class="manage d-flex flex-column col-1">
            <div class="edit d-flex" id="edit-${facility.id}">
                <span class="material-symbols-outlined">
                    edit
                </span>
                <p>Edit</p>
            </div>
            <div class="delete d-flex" id="delete-${facility.id}">
                <span class="material-symbols-outlined">
                    delete
                </span>
                <p>Delete</p>
            </div>
        </div>
</div>
   `
}

function addFacilityCard(facility) {
    facilityList.innerHTML += generateFacilityCard(facility)
    document.querySelector(`#edit-${facility.id}`).addEventListener("click", () => {
        editFacility(facility.id)
    })
    document.querySelector(`#delete-${facility.id}`).addEventListener("click", () => {
        deleteFacility(facility.id)
    })
}

function deleteFacility(id) {
    const userResponse = confirm("Are you sure you want to delete this facility? This action cannot be undone.")
    if (!userResponse) return
    deleteDoc(doc(db, "facilities", id)).then(() => {
        window.location.reload()
    }).catch(() => {
        alert("Error deleting facility, try again or refresh the page.")
    })
}

function editFacility(id) { }