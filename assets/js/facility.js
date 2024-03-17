import db from './firebase.mjs'
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js'


const facilitiesCollection = collection(db, "facilities")
const facID = String(window.location).split("#")[1]
const facilityDocRef = doc(db, "facilities", facID)
const facDoc = await getDoc(facilityDocRef)
const facData = facDoc.data()

const facName = document.querySelector("#facName")
const facLocation = document.querySelector("#facLocation")
const facType = document.querySelector("#facType")
const facRevenue = document.querySelector("#facRevenue")

try {
    facName.innerHTML = facData.name
    facLocation.innerHTML = `<b>${facData.city}</b>, ${facData.address1}${facData.address2.length > 0 ? ", " + facData.address2 : ""}`
    facType.innerHTML = determineFacilityType(parseInt(facData.type))
    facRevenue.innerHTML=`Last month's revnue: <span>${facData.revenue}€</span>`
} catch (ex) {
    console.log(ex)
    alert('Error loading facility data')
}

function determineFacilityType(num) {
    switch (num) {
        case 1:
            return "Apartment"
            break
        case 2:
            return "House"
            break
    }
}