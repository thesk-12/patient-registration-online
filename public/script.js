import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
async function generatePatientID(){

    const snapshot = await getDocs(collection(window.db,"patients"));

    let max = 0;

    snapshot.forEach((document)=>{

        const data = document.data();

        if(data.PatientID){

            const number = parseInt(
                data.PatientID.replace("PHY","")
            );

            if(number>max)
                max = number;

        }

    });

    max++;

    return "PHY"+String(max).padStart(3,"0");

}
const form = document.getElementById("patientForm");
const message = document.getElementById("message");

document.getElementById("dob").addEventListener("change", calculateAge);

// =========================
// AUTO CALCULATE AGE
// =========================

function calculateAge() {

    const dobInput = document.getElementById("dob");
    const ageInput = document.getElementById("age");

    if (!dobInput || !ageInput) return;

    if (dobInput.value === "") {

        ageInput.value = "";
        return;

    }

    const dob = new Date(dobInput.value);
    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();

    const monthDifference = today.getMonth() - dob.getMonth();

    if (
        monthDifference < 0 ||
        (monthDifference === 0 && today.getDate() < dob.getDate())
    ) {

        age--;

    }

    if (age < 0) {

        ageInput.value = "";
        return;

    }

    ageInput.value = age;

}
function showMessage(text,success){

    message.innerHTML=text;

    if(success){

        message.className="success";

    }else{

        message.className="error";

    }

    message.style.display="block";

    message.classList.add("fadeIn");

    setTimeout(()=>{

        message.style.display="none";

    },4000);

}

form.addEventListener("submit",async function(e){

    e.preventDefault();

    const contact=document.getElementById("contact").value.trim();

    if(contact!="" && !/^[0-9]{10}$/.test(contact)){

        showMessage("Contact Number must contain exactly 10 digits.",false);

        return;

    }

    const vas=document.getElementById("vas").value;

    const vasReview=document.getElementById("vasReview").value;

    if(vas!="" && (vas<0 || vas>10)){

        showMessage("VAS Score should be between 0 and 10.",false);

        return;

    }

    if(vasReview!="" && (vasReview<0 || vasReview>10)){

        showMessage("VAS Review Score should be between 0 and 10.",false);

        return;

    }

    const patient={

        name:document.getElementById("name").value.trim(),

        gender:document.getElementById("gender").value,

        dob:document.getElementById("dob").value,

        age:Number(document.getElementById("age").value),

        occupation:document.getElementById("occupation") || "Not Provided",

        contact:contact || "Not Provided",

        address:document.getElementById("address").value.trim(),

        history:document.getElementById("history").value.trim() || "No Significant History",

        problem:document.getElementById("problem").value.trim(),

        vas:vas  || "N/A",

        observation:document.getElementById("observation").value.trim() || "Not Recorded",

        diagnosis:document.getElementById("diagnosis").value.trim() || "Not Diagnosed",

        treatment:document.getElementById("treatment").value.trim(),

        visits:document.getElementById("visits").value || "1",

        vasReview:vasReview || "N/A",

        appointmentDate:document.getElementById("appointmentDate").value,

        appointmentTime:document.getElementById("appointmentTime").value,

        doctor:document.getElementById("doctor").value.trim() || "Self Referred",

        remarks:document.getElementById("remarks").value.trim() || "No Remarks"

    };

    if(

        patient.name==="" ||

        patient.gender==="" ||

        patient.address==="" ||

        patient.problem==="" ||

        patient.treatment==="" ||

        patient.appointmentDate==="" ||

        patient.appointmentTime===""

    ){

        showMessage("Please fill all required fields.",false);

        return;

    }

    try{

    const patientId = await generatePatientID();

    await addDoc(

        collection(window.db,"patients"),

        {

            PatientID:patientId,

            Name:patient.name,

            Gender:patient.gender,

            DOB:patient.dob,

            Age:patient.age,

            Occupation:patient.occupation,

            Contact:patient.contact,

            Address:patient.address,

            History:patient.history,

            Problem:patient.problem,

            VAS:patient.vas,

            Observation:patient.observation,

            Diagnosis:patient.diagnosis,

            Treatment:patient.treatment,

            Visits:patient.visits,

            VASReview:patient.vasReview,

            AppointmentDate:patient.appointmentDate,

            AppointmentTime:patient.appointmentTime,

            Doctor:patient.doctor,

            Remarks:patient.remarks,

            CreatedAt:serverTimestamp()

        }

    );

    showMessage(

        "Patient Registered Successfully"

        +

        "<br><br><b>Patient ID : "

        +

        patientId

        +

        "</b>",

        true

    );

    form.reset();

    document.getElementById("age").value="";

}
catch(error){

    console.log(error);

    showMessage(

        "Unable to save patient.",

        false

    );

}

});
// =========================
// VIEW PATIENTS
// =========================

// =========================
// VIEW PATIENTS
// =========================

async function viewPatients() {

    document.getElementById("patientList").style.display = "block";

    const table = document.getElementById("tableBody");

    table.innerHTML = "";

    try {

        const q = query(
            collection(window.db, "patients"),
            orderBy("CreatedAt", "desc")
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {

            table.innerHTML = `
            <tr>
                <td colspan="10">
                    No Patients Registered
                </td>
            </tr>
            `;

            return;

        }

        snapshot.forEach((document) => {

            const patient = document.data();

            table.innerHTML += `

            <tr>

            <td>${patient.PatientID}</td>

            <td>${patient.Name}</td>

            <td>${patient.Gender}</td>

            <td>${patient.Age}</td>

            <td>${patient.Contact}</td>

            <td>${patient.Problem}</td>

            <td>${patient.Treatment}</td>

            <td>${patient.AppointmentDate}</td>

            <td>${patient.AppointmentTime}</td>

            <td>

            <button
            class="deleteBtn"
            onclick="deletePatient('${document.id}')">

            Delete

            </button>

            </td>

            </tr>

            `;

        });

    }

    catch (error) {

        console.log(error);

        showMessage(

            "Unable to load patients.",

            false

        );

    }

}
// =========================
// DELETE PATIENT
// =========================

// =========================
// DELETE PATIENT
// =========================

async function deletePatient(id){

    if(!confirm("Delete this patient?"))
        return;

    try{

        await deleteDoc(

            doc(window.db,"patients",id)

        );

        showMessage(

            "Patient deleted successfully.",

            true

        );

        viewPatients();

    }

    catch(error){

        console.log(error);

        showMessage(

            "Unable to delete patient.",

            false

        );

    }

}
// =========================
// DOWNLOAD REPORT
// =========================

// =========================
// DOWNLOAD REPORT
// =========================

async function downloadReport(){

    try{

        const snapshot = await getDocs(

            collection(window.db,"patients")

        );

        const patients=[];

        snapshot.forEach((doc)=>{

            patients.push(doc.data());

        });

        if(patients.length===0){

            showMessage(

                "No patient records found.",

                false

            );

            return;

        }

        const workbook = XLSX.utils.book_new();

        const worksheet = XLSX.utils.json_to_sheet(patients);

        XLSX.utils.book_append_sheet(

            workbook,

            worksheet,

            "Patients"

        );

        XLSX.writeFile(

            workbook,

            "Patient_Report.xlsx"

        );

    }

    catch(error){

        console.log(error);

        showMessage(

            "Unable to download report.",

            false

        );

    }

}
// =========================
// DATE RESTRICTIONS
// =========================

window.onload=function(){

    const today=new Date();

    let month=today.getMonth()+1;

    let day=today.getDate();

    if(month<10)
        month="0"+month;

    if(day<10)
        day="0"+day;

    const current=today.getFullYear()+"-"+month+"-"+day;

    document.getElementById("appointmentDate").min=current;

    document.getElementById("dob").max=current;
    const dobField = document.getElementById("dob");

if (dobField) {

    dobField.addEventListener("change", calculateAge);
    dobField.addEventListener("input", calculateAge);

}

}

// =========================
// ONLY NUMBERS IN CONTACT
// =========================

document.getElementById("contact").addEventListener("input",function(){

    this.value=this.value.replace(/\D/g,"");

});

// =========================
// LIMIT VAS SCORE
// =========================

document.getElementById("vas").addEventListener("input",function(){

    if(this.value>10)
        this.value=10;

    if(this.value<0)
        this.value=0;

});

document.getElementById("vasReview").addEventListener("input",function(){

    if(this.value>10)
        this.value=10;

    if(this.value<0)
        this.value=0;

});