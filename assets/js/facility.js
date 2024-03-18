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

const togglePie = document.querySelector('a[href="#pieGraph"]')
const toggleLine = document.querySelector('a[href="#lineGraph"]')

togglePie.addEventListener("click", () => {
    if (!togglePie.classList.contains("active")) {
        togglePie.classList.add("active")
        if(toggleLine.classList.contains("active")) toggleLine.click()
        toggleLine.classList.remove("active")
    }else{
        togglePie.classList.remove("active")
    }
})
toggleLine.addEventListener("click", () => {
    if (!toggleLine.classList.contains("active")) {
        toggleLine.classList.add("active")
        if(togglePie.classList.contains("active")) togglePie.click()
        togglePie.classList.remove("active")
    }else{
        toggleLine.classList.remove("active")
    }
})

try {
    facName.innerHTML = facData.name
    facLocation.innerHTML = `<b>${facData.city}</b>, ${facData.address1}${facData.address2.length > 0 ? ", " + facData.address2 : ""}`
    facType.innerHTML = determineFacilityType(parseInt(facData.type))
    facRevenue.innerHTML = `Last month's revnue: <span>${facData.revenue}€</span>`
} catch (ex) {
    console.log(ex)
    alert('Error loading facility data')
}

loadPieChart()
loadLineChart()

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

async function loadPieChart() {
    const data = {
        labels: [
            'Red',
            'Blue',
            'Yellow'
        ],
        datasets: [{
            label: 'My First Dataset',
            data: [300, 50, 100],
            backgroundColor: [
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
                'rgb(255, 205, 86)'
            ],
            hoverOffset: 4
        }]
    };

    new Chart(
        document.getElementById('pieCanvas'),
        {
            type: 'doughnut',
            data: data
        }
    );
}

async function loadLineChart() {
    const labels = [1, 2, 3, 4, 5, 6, 7];
    const data = {
        labels: labels,
        datasets: [{
            label: 'My First Dataset',
            data: [65, 59, 80, 81, 56, 55, 40],
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    };

    new Chart(
        document.getElementById('lineCanvas'),
        {
            type: 'line',
            data: data
        }
    );
}