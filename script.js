
// ADMISSCHOOL - SCHOOL ADMISSION MANAGEMENT SYSTEM
// Data Alcott Systems - Task ID: WD-SCH-004
// Frontend project using HTML, CSS and JavaScript only.
// Data is stored in JavaScript arrays and objects.

let users = [
    {
        name: "Administrator",
        email: "admin@gmail.com",
        password: "admin123",
        role: "Admin"
    },
    {
        name: "Staff Member",
        email: "staff@gmail.com",
        password: "staff123",
        role: "Staff"
    }
];

let applications = [];
let payments = [];
let notifications = [];
let currentUser = null;
let applicationCount = 0;
let currentStep = 1;
let meritList = [];

const courses = [
    "Class 1 (CBSE)", "Class 2 (CBSE)", "Class 3 (CBSE)",
    "Class 4 (CBSE)", "Class 5 (CBSE)", "Class 6 (CBSE)",
    "Class 7 (CBSE)", "Class 8 (CBSE)", "Class 9 (CBSE)",
    "Class 10 (CBSE)",

    "Class 1 (ICSE)", "Class 2 (ICSE)", "Class 3 (ICSE)",
    "Class 4 (ICSE)", "Class 5 (ICSE)", "Class 6 (ICSE)",
    "Class 7 (ICSE)", "Class 8 (ICSE)", "Class 9 (ICSE)",
    "Class 10 (ICSE)",

    "Class 1 (State Board)", "Class 2 (State Board)",
    "Class 3 (State Board)", "Class 4 (State Board)",
    "Class 5 (State Board)", "Class 6 (State Board)",
    "Class 7 (State Board)", "Class 8 (State Board)",
    "Class 9 (State Board)", "Class 10 (State Board)",

    "11th Science", "11th Commerce", "11th Arts"
];

const documentFields = [
    { id: "docPhoto", name: "Passport Size Photo" },
    { id: "docSignature", name: "Signature" },
    { id: "docBirth", name: "Birth Certificate" },
    { id: "docMarksheet", name: "Previous Marksheet" },
    { id: "docTransfer", name: "Transfer Certificate" },
    { id: "docIdentity", name: "Identity Proof" },
    { id: "docParent", name: "Parent's ID Proof" }
];

function getElement(id) {
    return document.getElementById(id);
}

function getValue(id) {
    return getElement(id).value.trim();
}

function setMessage(id, message, type) {
    const element = getElement(id);
    element.textContent = message;
    element.className = "message " + (type || "");
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function(character) {
        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };
        return characters[character];
    });
}

function formatDate(date) {
    if (!date) return "-";
    return new Date(date + "T00:00:00").toLocaleDateString("en-IN");
}

function getApplication(id) {
    return applications.find(function(application) {
        return application.id === id;
    });
}

function getCurrentApplicantApplications() {
    if (!currentUser) return [];

    if (currentUser.role === "Applicant") {
        return applications.filter(function(application) {
            return application.email.toLowerCase() === currentUser.email.toLowerCase();
        });
    }

    return applications;
}

function isStaffOrAdmin() {
    return currentUser && (
        currentUser.role === "Admin" ||
        currentUser.role === "Staff"
    );
}

function showPage(pageName) {
    const page = getElement(pageName);
    if (!page) return;

    document.querySelectorAll(".page").forEach(function(section) {
        section.classList.add("hidden");
    });

    page.classList.remove("hidden");

    document.querySelectorAll(".nav-link").forEach(function(button) {
        button.classList.toggle(
            "active",
            button.dataset.page === pageName
        );
    });

    getElement("sidebar").classList.remove("open");

    if (pageName === "dashboard") updateDashboard();
    if (pageName === "applications") displayApplications();
    if (pageName === "documents") refreshDocumentPage();
    if (pageName === "review") refreshReviewPage();
    if (pageName === "exam") refreshExamPage();
    if (pageName === "merit") displayMeritList();
    if (pageName === "fees") refreshFeePage();
    if (pageName === "admission") refreshAdmissionPage();
    if (pageName === "reports") updateReports();
}

function showAuthForm(formName) {
    getElement("loginForm").classList.toggle("hidden", formName !== "login");
    getElement("registerForm").classList.toggle("hidden", formName !== "register");

    getElement("loginTab").classList.toggle("active", formName === "login");
    getElement("registerTab").classList.toggle("active", formName === "register");

    setMessage("authMessage", "", "");
}

function startApplication() {
    getElement("authPage").classList.add("hidden");
    getElement("appPage").classList.remove("hidden");

    getElement("userDisplay").textContent = currentUser.name;
    getElement("roleDisplay").textContent = currentUser.role;

    setupRoleNavigation();
    resetApplicationForm();

    if (currentUser.role === "Applicant") {
        getElement("studentName").value = currentUser.name;
        getElement("studentEmail").value = currentUser.email;
        getElement("studentEmail").readOnly = true;
    } else {
        getElement("studentEmail").readOnly = false;
    }

    showPage("dashboard");
}

function setupRoleNavigation() {
    const allowedPages = {
        Admin: [
            "dashboard", "registration", "applications", "documents",
            "review", "exam", "merit", "fees", "admission",
            "tracking", "reports"
        ],
        Staff: [
            "dashboard", "applications", "documents", "review",
            "exam", "merit", "tracking", "reports"
        ],
        Applicant: [
            "dashboard", "registration", "documents", "tracking"
        ]
    };

    document.querySelectorAll(".nav-link").forEach(function(button) {
        const page = button.dataset.page;
        button.classList.toggle(
            "hidden",
            !allowedPages[currentUser.role].includes(page)
        );
    });

    getElement("newApplicationButton").classList.toggle(
        "hidden",
        currentUser.role !== "Admin"
    );
}

function logout() {
    currentUser = null;
    getElement("appPage").classList.add("hidden");
    getElement("authPage").classList.remove("hidden");
    getElement("loginForm").reset();
    getElement("registerForm").reset();
    showAuthForm("login");
}

// LOGIN

getElement("loginTab").addEventListener("click", function() {
    showAuthForm("login");
});

getElement("registerTab").addEventListener("click", function() {
    showAuthForm("register");
});

getElement("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const email = getValue("loginEmail").toLowerCase();
    const password = getValue("loginPassword");
    const role = getValue("loginRole");

    const user = users.find(function(account) {
        return account.email.toLowerCase() === email &&
            account.password === password &&
            account.role === role;
    });

    if (!user) {
        setMessage("authMessage", "Invalid email, password or role.", "error");
        return;
    }

    currentUser = user;
    startApplication();
});

// REGISTER

getElement("registerForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const name = getValue("registerName");
    const email = getValue("registerEmail").toLowerCase();
    const password = getValue("registerPassword");
    const role = getValue("registerRole");

    const existingUser = users.find(function(user) {
        return user.email.toLowerCase() === email;
    });

    if (existingUser) {
        setMessage("authMessage", "An account with this email already exists.", "error");
        return;
    }

    users.push({
        name: name,
        email: email,
        password: password,
        role: role
    });

    setMessage("authMessage", "Account created successfully. Please login.", "success");
    getElement("registerForm").reset();
    showAuthForm("login");
    getElement("loginEmail").value = email;
    getElement("loginRole").value = role;
});

// NAVIGATION

document.querySelectorAll(".nav-link").forEach(function(button) {
    button.addEventListener("click", function() {
        showPage(button.dataset.page);
    });
});

getElement("logoutButton").addEventListener("click", logout);

getElement("menuButton").addEventListener("click", function() {
    getElement("sidebar").classList.toggle("open");
});

document.querySelectorAll("[data-back]").forEach(function(button) {
    button.addEventListener("click", function() {
        showPage(button.dataset.back);
    });
});

getElement("newApplicationButton").addEventListener("click", function() {
    showPage("registration");
});

getElement("themeButton").addEventListener("click", function() {
    document.body.classList.toggle("dark");
    getElement("themeButton").textContent =
        document.body.classList.contains("dark") ? "☀️" : "🌙";
});

// COURSE FILTER

function setupCourseFilter() {
    const filter = getElement("courseFilter");

    courses.forEach(function(course) {
        const option = document.createElement("option");
        option.value = course;
        option.textContent = course;
        filter.appendChild(option);
    });
}

// MULTI-STEP APPLICATION FORM

function showFormStep(step) {
    currentStep = step;

    [1, 2, 3].forEach(function(number) {
        getElement("formStep" + number).classList.toggle(
            "hidden",
            number !== step
        );

        getElement(
            number === 1 ? "stepOne" :
            number === 2 ? "stepTwo" : "stepThree"
        ).classList.toggle("active", number === step);
    });
}

function validateStep(step) {
    let ids = [];

    if (step === 1) {
        ids = ["studentName", "studentDOB", "studentGender"];
    } else if (step === 2) {
        ids = ["previousSchool", "previousClass", "academicScore", "course"];
    } else {
        ids = [
            "studentEmail", "studentPhone",
            "parentName", "parentPhone", "studentAddress"
        ];
    }

    for (let i = 0; i < ids.length; i++) {
        const field = getElement(ids[i]);

        if (!field.value.trim()) {
            field.focus();
            alert("Please complete all required fields.");
            return false;
        }

        if (!field.checkValidity()) {
            field.reportValidity();
            return false;
        }
    }

    if (step === 2) {
        const score = Number(getValue("academicScore"));

        if (score < 0 || score > 100) {
            alert("Academic score must be between 0 and 100.");
            getElement("academicScore").focus();
            return false;
        }
    }

    return true;
}

getElement("nextStep1").addEventListener("click", function() {
    if (validateStep(1)) showFormStep(2);
});

getElement("nextStep2").addEventListener("click", function() {
    if (validateStep(2)) showFormStep(3);
});

getElement("previousStep2").addEventListener("click", function() {
    showFormStep(1);
});

getElement("previousStep3").addEventListener("click", function() {
    showFormStep(2);
});

function resetApplicationForm() {
    getElement("applicationForm").reset();

    if (currentUser && currentUser.role === "Applicant") {
        getElement("studentName").value = currentUser.name;
        getElement("studentEmail").value = currentUser.email;
        getElement("studentEmail").readOnly = true;
    }

    showFormStep(1);
}

// SUBMIT APPLICATION

getElement("applicationForm").addEventListener("submit", function(event) {
    event.preventDefault();

    if (!validateStep(3)) return;

    const email = getValue("studentEmail").toLowerCase();

    if (currentUser.role === "Applicant" &&
        email !== currentUser.email.toLowerCase()) {
        setMessage(
            "applicationMessage",
            "Use the email address registered with your account.",
            "error"
        );
        return;
    }

    const academicScore = Number(getValue("academicScore"));

    if (academicScore < 0 || academicScore > 100) {
        setMessage("applicationMessage", "Enter a valid academic score.", "error");
        return;
    }

    applicationCount++;

    const id = "DAS-SCH-" + String(applicationCount).padStart(4, "0");

    const application = {
        id: id,
        name: getValue("studentName"),
        dob: getValue("studentDOB"),
        gender: getValue("studentGender"),
        nationality: getValue("studentNationality"),
        previousSchool: getValue("previousSchool"),
        previousClass: getValue("previousClass"),
        academicScore: academicScore,
        course: getValue("course"),
        email: email,
        phone: getValue("studentPhone"),
        parentName: getValue("parentName"),
        parentPhone: getValue("parentPhone"),
        address: getValue("studentAddress"),
        status: "Submitted",
        submittedDate: new Date().toISOString().slice(0, 10),
        comments: "",
        documents: [],
        examDate: "",
        examScore: null,
        finalScore: null,
        feeStatus: "Unpaid",
        admissionDate: ""
    };

    applications.push(application);

    notifications.push({
        email: email,
        message: "Your application " + id + " has been submitted."
    });

    setMessage(
        "applicationMessage",
        "Application submitted successfully! Your Application ID is " + id,
        "success"
    );

    resetApplicationForm();
    updateDashboard();
});

// DASHBOARD

function updateDashboard() {
    const visibleApplications = getCurrentApplicantApplications();

    const count = function(status) {
        return visibleApplications.filter(function(application) {
            return application.status === status;
        }).length;
    };

    getElement("totalCount").textContent = visibleApplications.length;
    getElement("submittedCount").textContent = count("Submitted");
    getElement("reviewCount").textContent = count("Under Review");
    getElement("shortlistedCount").textContent = count("Shortlisted");
    getElement("admittedCount").textContent = count("Admitted");
    getElement("rejectedCount").textContent = count("Rejected");

    const recent = visibleApplications.slice(-5).reverse();
    const recentBody = getElement("recentApplications");

    if (recent.length === 0) {
        recentBody.innerHTML = '<tr><td colspan="5" class="empty-row">No applications available.</td></tr>';
    } else {
        recentBody.innerHTML = recent.map(function(application) {
            return `
                <tr>
                    <td>${escapeHTML(application.id)}</td>
                    <td>${escapeHTML(application.name)}</td>
                    <td>${escapeHTML(application.course)}</td>
                    <td>${formatDate(application.submittedDate)}</td>
                    <td>${statusBadge(application.status)}</td>
                </tr>
            `;
        }).join("");
    }

    displayCourseAnalytics();
}

function statusBadge(status) {
    const className = "status-" + status.toLowerCase().replaceAll(" ", "-");

    return '<span class="status ' + className + '">' +
        escapeHTML(status) + '</span>';
}

function displayCourseAnalytics() {
    const visibleApplications = getCurrentApplicantApplications();
    const container = getElement("courseAnalytics");
    const counts = {};

    visibleApplications.forEach(function(application) {
        counts[application.course] = (counts[application.course] || 0) + 1;
    });

    const entries = Object.entries(counts);

    if (entries.length === 0) {
        container.innerHTML = "<p>No course applications available.</p>";
        return;
    }

    container.innerHTML = entries.map(function(entry) {
        return `
            <div class="analytics-item">
                <span>${escapeHTML(entry[0])}</span>
                <strong>${entry[1]}</strong>
            </div>
        `;
    }).join("");
}

// APPLICATION LISTING AND FILTERS

function displayApplications() {
    const body = getElement("applicationTable");
    const search = getValue("searchApplication").toLowerCase();
    const status = getValue("statusFilter");
    const course = getValue("courseFilter");
    const date = getValue("dateFilter");

    let list = getCurrentApplicantApplications();

    list = list.filter(function(application) {
        const matchesSearch =
            application.id.toLowerCase().includes(search) ||
            application.name.toLowerCase().includes(search) ||
            application.email.toLowerCase().includes(search);

        const matchesStatus = !status || application.status === status;
        const matchesCourse = !course || application.course === course;
        const matchesDate = !date || application.submittedDate === date;

        return matchesSearch && matchesStatus && matchesCourse && matchesDate;
    });

    if (list.length === 0) {
        body.innerHTML = '<tr><td colspan="6" class="empty-row">No applications found.</td></tr>';
        return;
    }

    body.innerHTML = list.map(function(application) {
        return `
            <tr>
                <td>${escapeHTML(application.id)}</td>
                <td>${escapeHTML(application.name)}</td>
                <td>${escapeHTML(application.course)}</td>
                <td>${formatDate(application.submittedDate)}</td>
                <td>${statusBadge(application.status)}</td>
                <td>
                    <button class="table-action" data-view="${escapeHTML(application.id)}">
                        View Details
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    body.querySelectorAll("[data-view]").forEach(function(button) {
        button.addEventListener("click", function() {
            viewApplication(button.dataset.view);
        });
    });
}

["searchApplication", "statusFilter", "courseFilter", "dateFilter"].forEach(function(id) {
    getElement(id).addEventListener("input", displayApplications);
    getElement(id).addEventListener("change", displayApplications);
});

// APPLICATION DETAIL VIEW

function viewApplication(id) {
    const application = getApplication(id);
    if (!application) return;

    if (currentUser.role === "Applicant" &&
        application.email.toLowerCase() !== currentUser.email.toLowerCase()) {
        alert("You cannot view this application.");
        return;
    }

    const documents = application.documents.length
        ? application.documents.map(function(document) {
            return "<li>" + escapeHTML(document.name) +
                " — " + escapeHTML(document.fileName) + "</li>";
        }).join("")
        : "<li>No documents uploaded.</li>";

    getElement("applicationDetailContent").innerHTML = `
        <h2>${escapeHTML(application.name)}</h2>
        <p><strong>Application ID:</strong> ${escapeHTML(application.id)}</p>
        <p><strong>Status:</strong> ${statusBadge(application.status)}</p>

        <h3>Personal Details</h3>
        <div class="detail-grid">
            ${detailItem("Date of Birth", application.dob)}
            ${detailItem("Gender", application.gender)}
            ${detailItem("Nationality", application.nationality)}
            ${detailItem("Email", application.email)}
            ${detailItem("Phone", application.phone)}
            ${detailItem("Address", application.address)}
        </div>

        <h3>Academic Details</h3>
        <div class="detail-grid">
            ${detailItem("Previous School", application.previousSchool)}
            ${detailItem("Previous Class", application.previousClass)}
            ${detailItem("Academic Score", application.academicScore + "%")}
            ${detailItem("Course", application.course)}
        </div>

        <h3>Parent / Guardian Details</h3>
        <div class="detail-grid">
            ${detailItem("Parent Name", application.parentName)}
            ${detailItem("Parent Phone", application.parentPhone)}
        </div>

        <h3>Application Details</h3>
        <div class="detail-grid">
            ${detailItem("Submitted Date", formatDate(application.submittedDate))}
            ${detailItem("Entrance Exam Score", application.examScore === null ? "Not entered" : application.examScore)}
            ${detailItem("Final Merit Score", application.finalScore === null ? "Not generated" : application.finalScore + "%")}
            ${detailItem("Fee Status", application.feeStatus)}
            ${detailItem("Review Comments", application.comments || "No comments")}
        </div>

        <h3>Uploaded Documents</h3>
        <ul>${documents}</ul>
    `;

    showPage("detail");
}

function detailItem(label, value) {
    return `
        <div class="detail-item">
            <strong>${escapeHTML(label)}</strong>
            <span>${escapeHTML(value || "-")}</span>
        </div>
    `;
}

// APPLICATION SELECT OPTIONS

function fillApplicationSelect(id, includeAll) {
    const select = getElement(id);
    const previousValue = select.value;
    const list = getCurrentApplicantApplications();

    select.innerHTML = '<option value="">Select Application</option>';

    list.forEach(function(application) {
        if (includeAll || application.status !== "Admitted") {
            const option = document.createElement("option");
            option.value = application.id;
            option.textContent = application.id + " - " + application.name;
            select.appendChild(option);
        }
    });

    if (list.some(function(application) {
        return application.id === previousValue;
    })) {
        select.value = previousValue;
    }
}

// DOCUMENT UPLOAD

function refreshDocumentPage() {
    fillApplicationSelect("documentApplication", true);
    displayDocuments();
}

function displayDocuments() {
    const id = getElement("documentApplication").value;
    const body = getElement("documentTable");
    const application = getApplication(id);

    if (!application || application.documents.length === 0) {
        body.innerHTML = '<tr><td colspan="4" class="empty-row">No documents uploaded.</td></tr>';
        return;
    }

    body.innerHTML = application.documents.map(function(document) {
        return `
            <tr>
                <td>${escapeHTML(document.name)}</td>
                <td>${escapeHTML(document.fileName)}</td>
                <td>${formatDate(document.uploadDate)}</td>
                <td><span class="status status-shortlisted">Uploaded</span></td>
            </tr>
        `;
    }).join("");
}

getElement("documentApplication").addEventListener("change", displayDocuments);

getElement("documentForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const id = getElement("documentApplication").value;
    const application = getApplication(id);

    if (!application) {
        alert("Please select an application.");
        return;
    }

    if (currentUser.role === "Applicant" &&
        application.email.toLowerCase() !== currentUser.email.toLowerCase()) {
        alert("You cannot upload documents for this application.");
        return;
    }

    let uploaded = 0;

    documentFields.forEach(function(field) {
        const input = getElement(field.id);
        const file = input.files[0];

        if (file) {
            const existing = application.documents.find(function(document) {
                return document.name === field.name;
            });

            const documentData = {
                name: field.name,
                fileName: file.name,
                uploadDate: new Date().toISOString().slice(0, 10)
            };

            if (existing) {
                existing.fileName = documentData.fileName;
                existing.uploadDate = documentData.uploadDate;
            } else {
                application.documents.push(documentData);
            }

            uploaded++;
            input.value = "";
        }
    });

    if (uploaded === 0) {
        alert("Choose at least one document to upload.");
        return;
    }

    displayDocuments();
    alert(uploaded + " document(s) uploaded successfully.");
});

// APPLICATION REVIEW

function refreshReviewPage() {
    displayPendingReviews();
    fillApplicationSelect("reviewApplication", true);
    loadReviewDetails();
}

function displayPendingReviews() {
    const body = getElement("reviewTable");

    const pending = applications.filter(function(application) {
        return application.status !== "Admitted" &&
            application.status !== "Rejected" &&
            application.status !== "Merit List";
    });

    if (pending.length === 0) {
        body.innerHTML = '<tr><td colspan="5" class="empty-row">No applications awaiting review.</td></tr>';
        return;
    }

    body.innerHTML = pending.map(function(application) {
        return `
            <tr>
                <td>${escapeHTML(application.id)}</td>
                <td>${escapeHTML(application.name)}</td>
                <td>${escapeHTML(application.course)}</td>
                <td>${statusBadge(application.status)}</td>
                <td>
                    <button class="table-action" data-review="${escapeHTML(application.id)}">
                        Review
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    body.querySelectorAll("[data-review]").forEach(function(button) {
        button.addEventListener("click", function() {
            getElement("reviewApplication").value = button.dataset.review;
            loadReviewDetails();
        });
    });
}

function loadReviewDetails() {
    const id = getElement("reviewApplication").value;
    const application = getApplication(id);
    const box = getElement("reviewStudentDetails");

    if (!application) {
        box.textContent = "Select an application to view student details.";
        return;
    }

    box.innerHTML = `
        <h3>${escapeHTML(application.name)}</h3>
        <div class="detail-grid">
            ${detailItem("Application ID", application.id)}
            ${detailItem("Course", application.course)}
            ${detailItem("Email", application.email)}
            ${detailItem("Phone", application.phone)}
            ${detailItem("Academic Score", application.academicScore + "%")}
            ${detailItem("Current Status", application.status)}
            ${detailItem("Previous School", application.previousSchool)}
            ${detailItem("Parent Name", application.parentName)}
        </div>
        <p><strong>Uploaded Documents:</strong> ${application.documents.length}</p>
        <p><strong>Previous Comments:</strong> ${escapeHTML(application.comments || "None")}</p>
    `;

    getElement("reviewStatus").value =
        application.status === "Submitted" ? "Under Review" : application.status;

    getElement("reviewComments").value = application.comments || "";
}

getElement("reviewApplication").addEventListener("change", loadReviewDetails);

getElement("saveReviewButton").addEventListener("click", function() {
    const id = getElement("reviewApplication").value;
    const application = getApplication(id);

    if (!application) {
        setMessage("reviewMessage", "Select an application first.", "error");
        return;
    }

    if (application.status === "Admitted" ||
        application.status === "Rejected" ||
        application.status === "Merit List") {
        setMessage("reviewMessage", "This application is no longer available for review.", "error");
        return;
    }

    const newStatus = getValue("reviewStatus");
    const comments = getValue("reviewComments");

    if (newStatus === "Rejected" && !comments) {
        setMessage("reviewMessage", "Enter a reason before rejecting an application.", "error");
        return;
    }

    application.status = newStatus;
    application.comments = comments;

    notifications.push({
        email: application.email,
        message: "Your application status has been updated to " + newStatus + "."
    });

    setMessage("reviewMessage", "Review decision saved successfully.", "success");

    displayPendingReviews();
    loadReviewDetails();
    updateDashboard();
});

// ENTRANCE EXAM MANAGEMENT

function refreshExamPage() {
    fillApplicationSelect("examApplication", true);
    displayExamResults();
}

function displayExamResults() {
    const body = getElement("examTable");
    const list = getCurrentApplicantApplications().filter(function(application) {
        return application.examScore !== null;
    });

    if (list.length === 0) {
        body.innerHTML = '<tr><td colspan="4" class="empty-row">No exam results available.</td></tr>';
        return;
    }

    body.innerHTML = list.map(function(application) {
        return `
            <tr>
                <td>${escapeHTML(application.id)}</td>
                <td>${escapeHTML(application.name)}</td>
                <td>${formatDate(application.examDate)}</td>
                <td>${application.examScore}/100</td>
            </tr>
        `;
    }).join("");
}

getElement("saveExamButton").addEventListener("click", function() {
    const id = getElement("examApplication").value;
    const application = getApplication(id);
    const date = getValue("examDate");
    const scoreValue = getValue("examScore");

    if (!application || !date || scoreValue === "") {
        setMessage("examMessage", "Select an application and enter exam details.", "error");
        return;
    }

    const score = Number(scoreValue);

    if (score < 0 || score > 100) {
        setMessage("examMessage", "Exam score must be between 0 and 100.", "error");
        return;
    }

    application.examDate = date;
    application.examScore = score;

    setMessage("examMessage", "Exam details saved successfully.", "success");
    displayExamResults();
});

// MERIT LIST

function displayMeritList() {
    const body = getElement("meritTable");

    meritList = applications.filter(function(application) {
        return application.status === "Merit List" ||
            application.status === "Admitted";
    }).filter(function(application) {
        return application.finalScore !== null;
    }).sort(function(first, second) {
        return second.finalScore - first.finalScore;
    });

    if (meritList.length === 0) {
        body.innerHTML = '<tr><td colspan="7" class="empty-row">No merit list generated yet.</td></tr>';
        return;
    }

    body.innerHTML = meritList.map(function(application, index) {
        return `
            <tr>
                <td>${index + 1}</td>
                <td>${escapeHTML(application.id)}</td>
                <td>${escapeHTML(application.name)}</td>
                <td>${escapeHTML(application.course)}</td>
                <td>${application.academicScore}%</td>
                <td>${application.examScore}%</td>
                <td><strong>${application.finalScore}%</strong></td>
            </tr>
        `;
    }).join("");
}

getElement("generateMeritButton").addEventListener("click", function() {
    const eligible = applications.filter(function(application) {
        return application.status === "Shortlisted" &&
            application.examScore !== null;
    });

    if (eligible.length === 0) {
        setMessage(
            "meritMessage",
            "No eligible applicants. Applications must be Shortlisted and have an entrance exam score.",
            "error"
        );
        return;
    }

    eligible.forEach(function(application) {
        application.finalScore = Number((
            application.academicScore * 0.60 +
            application.examScore * 0.40
        ).toFixed(2));

        application.status = "Merit List";
    });

    meritList = eligible.sort(function(first, second) {
        return second.finalScore - first.finalScore;
    });

    setMessage("meritMessage", "Merit list generated successfully.", "success");
    displayMeritList();
    updateDashboard();
});

// FEE MANAGEMENT

function getCourseFee(course) {
    if (course.includes("11th Science")) return 35000;
    if (course.includes("11th Commerce")) return 30000;
    if (course.includes("11th Arts")) return 28000;

    const classNumber = Number(course.match(/\d+/)[0]);

    if (classNumber <= 5) return 20000;
    return 25000;
}

function refreshFeePage() {
    fillApplicationSelect("feeApplication", true);
    displayPayments();
}

function displayPayments() {
    const body = getElement("feeTable");
    let list = payments;

    if (currentUser.role === "Applicant") {
        list = payments.filter(function(payment) {
            return payment.email.toLowerCase() === currentUser.email.toLowerCase();
        });
    }

    if (list.length === 0) {
        body.innerHTML = '<tr><td colspan="7" class="empty-row">No payment records found.</td></tr>';
        return;
    }

    body.innerHTML = list.map(function(payment) {
        return `
            <tr>
                <td>${escapeHTML(payment.receiptId)}</td>
                <td>${escapeHTML(payment.applicationId)}</td>
                <td>${escapeHTML(payment.studentName)}</td>
                <td>₹${payment.amount.toLocaleString("en-IN")}</td>
                <td>${escapeHTML(payment.method)}</td>
                <td><span class="status status-admitted">Paid</span></td>
                <td>
                    <button class="table-action" data-receipt="${escapeHTML(payment.receiptId)}">
                        Print Receipt
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    body.querySelectorAll("[data-receipt]").forEach(function(button) {
        button.addEventListener("click", function() {
            printReceipt(button.dataset.receipt);
        });
    });
}

getElement("feeApplication").addEventListener("change", function() {
    const application = getApplication(getElement("feeApplication").value);

    if (application) {
        getElement("feeAmount").value = getCourseFee(application.course);
    } else {
        getElement("feeAmount").value = "";
    }
});

getElement("payFeeButton").addEventListener("click", function() {
    const id = getElement("feeApplication").value;
    const application = getApplication(id);
    const amount = Number(getValue("feeAmount"));
    const method = getValue("paymentMethod");

    if (!application || amount <= 0 || !Number.isFinite(amount)) {
        setMessage("feeMessage", "Select an application and enter a valid fee amount.", "error");
        return;
    }

    if (application.feeStatus === "Paid") {
        setMessage("feeMessage", "The fee for this application is already paid.", "error");
        return;
    }

    const receiptId = "FEE-" + String(payments.length + 1).padStart(4, "0");

    const payment = {
        receiptId: receiptId,
        applicationId: application.id,
        studentName: application.name,
        email: application.email,
        amount: amount,
        method: method,
        date: new Date().toISOString().slice(0, 10),
        status: "Paid"
    };

    payments.push(payment);
    application.feeStatus = "Paid";

    setMessage("feeMessage", "Simulated payment successful. Receipt: " + receiptId, "success");
    displayPayments();
});

function printReceipt(receiptId) {
    const payment = payments.find(function(item) {
        return item.receiptId === receiptId;
    });

    if (!payment) return;

    const receiptWindow = window.open("", "_blank");

    if (!receiptWindow) {
        alert("Allow pop-ups to print the receipt.");
        return;
    }

    receiptWindow.document.write(`
        <html>
        <head><title>Fee Receipt</title></head>
        <body style="font-family:Arial;padding:35px">
            <h1>AdmitSchool</h1>
            <h2>Fee Payment Receipt</h2>
            <hr>
            <p><strong>Receipt ID:</strong> ${escapeHTML(payment.receiptId)}</p>
            <p><strong>Application ID:</strong> ${escapeHTML(payment.applicationId)}</p>
            <p><strong>Student:</strong> ${escapeHTML(payment.studentName)}</p>
            <p><strong>Amount:</strong> ₹${payment.amount.toLocaleString("en-IN")}</p>
            <p><strong>Payment Method:</strong> ${escapeHTML(payment.method)}</p>
            <p><strong>Date:</strong> ${formatDate(payment.date)}</p>
            <p><strong>Status:</strong> Paid</p>
            <hr>
            <p>Thank you.</p>
            <script>window.onload = function() { window.print(); }<\/script>
        </body>
        </html>
    `);

    receiptWindow.document.close();
}

// ADMISSION CONFIRMATION

function refreshAdmissionPage() {
    fillApplicationSelect("admissionApplication", true);
    displayAdmittedStudents();
    loadAdmissionDetails();
}

function loadAdmissionDetails() {
    const application = getApplication(getElement("admissionApplication").value);
    const box = getElement("admissionDetails");

    if (!application) {
        box.textContent = "Select an application to view its admission eligibility.";
        return;
    }

    const eligible = application.status === "Merit List" &&
        application.feeStatus === "Paid";

    box.innerHTML = `
        <h3>${escapeHTML(application.name)}</h3>
        <div class="detail-grid">
            ${detailItem("Application ID", application.id)}
            ${detailItem("Course", application.course)}
            ${detailItem("Application Status", application.status)}
            ${detailItem("Fee Status", application.feeStatus)}
            ${detailItem("Final Merit Score", application.finalScore === null ? "Not available" : application.finalScore + "%")}
        </div>
        <p><strong>Admission Eligibility:</strong>
        ${eligible ? "Eligible for confirmation" : "Not eligible yet. Applicant must be in Merit List and fees must be paid."}</p>
    `;

    getElement("confirmAdmissionButton").disabled =
        !eligible || application.status === "Admitted";
}

getElement("admissionApplication").addEventListener("change", loadAdmissionDetails);

getElement("confirmAdmissionButton").addEventListener("click", function() {
    const application = getApplication(getElement("admissionApplication").value);

    if (!application) {
        setMessage("admissionMessage", "Select an application.", "error");
        return;
    }

    if (application.status !== "Merit List" || application.feeStatus !== "Paid") {
        setMessage(
            "admissionMessage",
            "Only applicants on the merit list with paid fees can be admitted.",
            "error"
        );
        return;
    }

    application.status = "Admitted";
    application.admissionDate = new Date().toISOString().slice(0, 10);

    notifications.push({
        email: application.email,
        message: "Congratulations! Your admission has been confirmed."
    });

    setMessage("admissionMessage", "Admission confirmed successfully.", "success");

    displayAdmittedStudents();
    loadAdmissionDetails();
    updateDashboard();
});

function displayAdmittedStudents() {
    const body = getElement("admittedTable");

    const list = getCurrentApplicantApplications().filter(function(application) {
        return application.status === "Admitted";
    });

    if (list.length === 0) {
        body.innerHTML = '<tr><td colspan="5" class="empty-row">No admitted students yet.</td></tr>';
        return;
    }

    body.innerHTML = list.map(function(application) {
        return `
            <tr>
                <td>${escapeHTML(application.id)}</td>
                <td>${escapeHTML(application.name)}</td>
                <td>${escapeHTML(application.course)}</td>
                <td>${statusBadge(application.status)}</td>
                <td>
                    <button class="table-action" data-letter="${escapeHTML(application.id)}">
                        View Letter
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    body.querySelectorAll("[data-letter]").forEach(function(button) {
        button.addEventListener("click", function() {
            generateAdmissionLetter(button.dataset.letter);
        });
    });
}

function generateAdmissionLetter(id) {
    const application = getApplication(id);
    if (!application || application.status !== "Admitted") return;

    const letterWindow = window.open("", "_blank");

    if (!letterWindow) {
        alert("Allow pop-ups to view the admission letter.");
        return;
    }

    letterWindow.document.write(`
        <html>
        <head><title>Admission Letter</title></head>
        <body style="font-family:Arial;max-width:750px;margin:40px auto;line-height:1.8;padding:20px">
            <h1 style="text-align:center;color:#7041d8">AdmitSchool</h1>
            <h2 style="text-align:center">Admission Confirmation Letter</h2>
            <hr>
            <p>Date: ${formatDate(application.admissionDate)}</p>
            <p>Application ID: ${escapeHTML(application.id)}</p>
            <p>Dear ${escapeHTML(application.name)},</p>
            <p>Congratulations! We are pleased to confirm your admission to AdmitSchool.</p>
            <p><strong>Student Name:</strong> ${escapeHTML(application.name)}</p>
            <p><strong>Course:</strong> ${escapeHTML(application.course)}</p>
            <p><strong>Application ID:</strong> ${escapeHTML(application.id)}</p>
            <p><strong>Admission Status:</strong> Admitted</p>
            <p>We welcome you and wish you success in your studies.</p>
            <br><br>
            <p>Admissions Office<br>AdmitSchool</p>
            <script>window.onload = function() { window.print(); }<\/script>
        </body>
        </html>
    `);

    letterWindow.document.close();
}

// APPLICATION TRACKING

getElement("trackButton").addEventListener("click", function() {
    const id = getValue("trackingId").toUpperCase();
    const application = getApplication(id);
    const result = getElement("trackingResult");

    if (!application) {
        result.textContent = "Application not found. Please check the Application ID.";
        return;
    }

    if (currentUser.role === "Applicant" &&
        application.email.toLowerCase() !== currentUser.email.toLowerCase()) {
        result.textContent = "You can only track your own application.";
        return;
    }

    result.innerHTML = `
        <h3>${escapeHTML(application.name)}</h3>
        <p><strong>Application ID:</strong> ${escapeHTML(application.id)}</p>
        <p><strong>Course:</strong> ${escapeHTML(application.course)}</p>
        <p><strong>Submitted Date:</strong> ${formatDate(application.submittedDate)}</p>
        <p><strong>Current Status:</strong> ${statusBadge(application.status)}</p>
        <p><strong>Comments:</strong> ${escapeHTML(application.comments || "No comments available.")}</p>
    `;
});

// REPORTS

function updateReports() {
    const list = getCurrentApplicantApplications();

    const admitted = list.filter(function(application) {
        return application.status === "Admitted";
    }).length;

    const rejected = list.filter(function(application) {
        return application.status === "Rejected";
    }).length;

    const pending = list.length - admitted - rejected;

    getElement("reportTotal").textContent = list.length;
    getElement("reportAdmitted").textContent = admitted;
    getElement("reportRejected").textContent = rejected;
    getElement("reportPending").textContent = pending;

    const courseCounts = {};
    const genderCounts = {};

    list.forEach(function(application) {
        courseCounts[application.course] =
            (courseCounts[application.course] || 0) + 1;

        genderCounts[application.gender] =
            (genderCounts[application.gender] || 0) + 1;
    });

    const courseReport = getElement("courseReport");
    const genderReport = getElement("genderReport");

    const courseEntries = Object.entries(courseCounts);
    const genderEntries = Object.entries(genderCounts);

    courseReport.innerHTML = courseEntries.length
        ? courseEntries.map(function(entry) {
            return `<div class="analytics-item">
                <span>${escapeHTML(entry[0])}</span>
                <strong>${entry[1]}</strong>
            </div>`;
        }).join("")
        : "<p>No course data available.</p>";

    genderReport.innerHTML = genderEntries.length
        ? genderEntries.map(function(entry) {
            return `<div class="analytics-item">
                <span>${escapeHTML(entry[0])}</span>
                <strong>${entry[1]}</strong>
            </div>`;
        }).join("")
        : "<p>No demographic data available.</p>";
}

// CSV EXPORT

getElement("exportCSVButton").addEventListener("click", function() {
    const list = getCurrentApplicantApplications();

    if (list.length === 0) {
        alert("No application records to export.");
        return;
    }

    const rows = [
        [
            "Application ID", "Student Name", "Email", "Phone",
            "Course", "Academic Score", "Entrance Score",
            "Final Score", "Status", "Submitted Date", "Fee Status"
        ]
    ];

    list.forEach(function(application) {
        rows.push([
            application.id,
            application.name,
            application.email,
            application.phone,
            application.course,
            application.academicScore,
            application.examScore === null ? "" : application.examScore,
            application.finalScore === null ? "" : application.finalScore,
            application.status,
            application.submittedDate,
            application.feeStatus
        ]);
    });

    const csv = rows.map(function(row) {
        return row.map(function(value) {
            return '"' + String(value ?? "").replaceAll('"', '""') + '"';
        }).join(",");
    }).join("\n");

    const file = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = "AdmitSchool_Admission_Report.csv";
    link.click();

    URL.revokeObjectURL(url);
});

// PRINT REPORT / SAVE AS PDF

getElement("printButton").addEventListener("click", function() {
    window.print();
});

// INITIAL SETUP

setupCourseFilter();
showFormStep(1);

// Refresh dashboard when the page is first opened after login.
