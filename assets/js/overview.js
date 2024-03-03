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
        addFacilityCard(doc)//adds docs to the html
    })
}

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

function addFacilityCard(facility) {    //adds the generated cards to the site and adds event listeners where needed
    facilityList.innerHTML += generateFacilityCard(facility)    //adds the card to the facilities list on screen
    document.querySelector(`#edit-${facility.id}`).addEventListener("click", () => {
        editFacility(facility)  //editing the specific facility
    })
    document.querySelector(`#delete-${facility.id}`).addEventListener("click", () => {
        deleteFacility(facility.id) //deleting the specific facility
    })
}

function deleteFacility(id) {   //facility deletion
    const userResponse = confirm("Are you sure you want to delete this facility? This action cannot be undone.")
    if (!userResponse) return   //if user has  canceled
    deleteDoc(doc(db, "facilities", id)).then(() => {   //user has agreed -> attepmting deletion
        window.location.reload()    //realoading to refresh the data
    }).catch(() => {
        alert("Error deleting facility, try again or refresh the page.")    //error
    })
}

function editFacility(facility) {   //facility edit
    document.querySelector("#hidden").click()   //opening of the modal
    //needed DOM elements
    const facName = document.querySelector("#editFacName")
    const facType = document.querySelector("#editType")
    const facCity = document.querySelector("#editFacCity")
    const facAdd1 = document.querySelector("#editFacAdd1")
    const facAdd2 = document.querySelector("#editFacAdd2")

    document.querySelector("#btnRevert").addEventListener("click", () => {  //reverts data to the default (unchanged) state
        facName.value = facility.data().name
        facType.value = facility.data().type
        facCity.value = facility.data().city
        facAdd1.value = facility.data().address1
        facAdd2.value = facility.data().address2
    })
    document.querySelector("#btnRevert").click()    //lodaing data
    document.querySelector("#facName").innerHTML = facility.data().name //facility name at the top
    //attepting to save the data and update the facility doc
    document.querySelector("#btnSave").addEventListener("click", () => {
        switch (true) { //checks if the entred data is valid
            case (facName.value.trim().length < 1): //no name

                break
            case (facCity.value.trim().length < 1): //no city
                break
            case (facAdd1.value.trim().length < 1): //no address

                break
            default:    //data is valid
                const facilityObject = {    //object used to update the doc
                    name: facName.value.trim(),
                    type: facType.value,
                    city: facCity.value.trim(),
                    address1: facAdd1.value.trim(),
                    address2: facAdd2.value.trim() ?? "",
                    revenue: facility.data().revenue,
                    owner: facility.data().owner
                }
        }
    })
}
// TODO:
// -finish facility edit
// -adding facilities
// -responsive
// -delete users's facilities when user is deleted