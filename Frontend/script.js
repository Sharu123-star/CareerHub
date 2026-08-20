// ==========================================
// CAREERHUB - MAIN SCRIPT
// ==========================================

const API_URL = "http://127.0.0.1:5000";


// ==========================================
// GET LOGGED-IN USER
// ==========================================

function getLoggedInUser() {

    const storedUser = localStorage.getItem("loggedInUser");

    if (!storedUser) {
        return null;
    }

    try {

        return JSON.parse(storedUser);

    } catch (error) {

        console.error("Invalid stored user:", error);

        localStorage.removeItem("loggedInUser");

        return null;
    }
}


// ==========================================
// LOGOUT
// ==========================================

const logoutBtn =
    document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", function (event) {

        event.preventDefault();

        localStorage.removeItem("loggedInUser");

        window.location.href = "login.html";

    });

}


// ==========================================
// LOGIN
// ==========================================

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value.trim();

        try {

            const response = await fetch(
                `${API_URL}/api/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                alert(
                    data.message ||
                    "Invalid email or password."
                );

                return;
            }

            localStorage.setItem(
                "loggedInUser",
                JSON.stringify(data.user)
            );

            alert("Login successful!");

            window.location.href =
                "dashboard.html";

        } catch (error) {

            console.error("Login error:", error);

            alert(
                "Cannot connect to the server."
            );

        }

    });

}


// ==========================================
// REGISTER
// ==========================================

const registerForm =
    document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const name =
                document.getElementById("name").value.trim();

            const email =
                document.getElementById("email").value.trim();

            const password =
                document.getElementById("password").value.trim();

            const college =
                document.getElementById("college").value.trim();

            try {

                const response = await fetch(
                    `${API_URL}/api/register`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            name: name,
                            email: email,
                            password: password,
                            college: college
                        })
                    }
                );

                const data =
                    await response.json();

                if (!response.ok) {

                    alert(
                        data.message ||
                        "Registration failed."
                    );

                    return;
                }

                alert(
                    "Account created successfully!"
                );

                window.location.href =
                    "login.html";

            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );

                alert(
                    "Cannot connect to the server."
                );

            }

        }
    );

}


// ==========================================
// DASHBOARD WELCOME
// ==========================================

const welcomeMessage =
    document.getElementById("welcomeMessage");

if (welcomeMessage) {

    const user =
        getLoggedInUser();

    if (user) {

        welcomeMessage.innerHTML =
            `Welcome, ${user.name} 👋`;

    } else {

        welcomeMessage.innerHTML =
            "Welcome to CareerHub 👋";

    }

}


// ==========================================
// PROFILE
// ==========================================

const profileName =
    document.getElementById("profileName");

const profileEmail =
    document.getElementById("profileEmail");

const profileCollege =
    document.getElementById("profileCollege");

if (
    profileName ||
    profileEmail ||
    profileCollege
) {

    const user =
        getLoggedInUser();

    if (!user) {

        if (profileName) {
            profileName.textContent =
                "Please login first.";
        }

        if (profileEmail) {
            profileEmail.textContent = "-";
        }

        if (profileCollege) {
            profileCollege.textContent = "-";
        }

    } else {

        if (profileName) {
            profileName.textContent =
                user.name;
        }

        if (profileEmail) {
            profileEmail.textContent =
                user.email;
        }

        if (profileCollege) {
            profileCollege.textContent =
                user.college;
        }

    }

}


// ==========================================
// SKILLS
// ==========================================

const skillForm =
    document.getElementById("skillForm");

const skillsContainer =
    document.getElementById("skillsContainer");

if (skillForm) {

    skillForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const user =
                getLoggedInUser();

            if (!user) {

                alert("Please login first.");

                window.location.href =
                    "login.html";

                return;
            }

            const skillInput =
                document.getElementById("skillName");

            const skillName =
                skillInput.value.trim();

            if (!skillName) {

                alert("Please enter a skill.");

                return;
            }

            try {

                const response = await fetch(
                    `${API_URL}/api/skills`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            user_id: user.id,
                            skill_name: skillName
                        })
                    }
                );

                const data =
                    await response.json();

                if (!response.ok) {

                    alert(
                        data.message ||
                        "Failed to add skill."
                    );

                    return;
                }

                alert(
                    "Skill added successfully!"
                );

                skillInput.value = "";

                loadSkills();

            } catch (error) {

                console.error(
                    "Skill error:",
                    error
                );

                alert(
                    "Cannot connect to the server."
                );

            }

        }
    );

}


async function loadSkills() {

    if (!skillsContainer) {
        return;
    }

    const user =
        getLoggedInUser();

    if (!user) {

        skillsContainer.innerHTML =
            "<p>Please login first.</p>";

        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/api/skills/${user.id}`
        );

        const skills =
            await response.json();

        if (!response.ok) {

            skillsContainer.innerHTML =
                "<p>Failed to load skills.</p>";

            return;
        }

        if (skills.length === 0) {

            skillsContainer.innerHTML =
                "<p>No skills added yet.</p>";

            return;
        }

        skillsContainer.innerHTML = "";

        skills.forEach(function (skill) {

            const skillDiv =
                document.createElement("div");

            skillDiv.className =
                "skill-item";

            skillDiv.innerHTML = `

                <span>
                    ${skill.skill_name}
                </span>

                <button
                    class="delete-skill-btn"
                    onclick="deleteSkill(${skill.id})">

                    Delete

                </button>

            `;

            skillsContainer.appendChild(
                skillDiv
            );

        });

    } catch (error) {

        console.error(
            "Load skills error:",
            error
        );

        skillsContainer.innerHTML =
            "<p>Cannot connect to the server.</p>";

    }

}

if (skillsContainer) {
    loadSkills();
}


async function deleteSkill(skillId) {

    if (!confirm(
        "Are you sure you want to delete this skill?"
    )) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/api/skills/${skillId}`,
            {
                method: "DELETE"
            }
        );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                data.message ||
                "Failed to delete skill."
            );

            return;
        }

        alert(
            "Skill deleted successfully!"
        );

        loadSkills();

    } catch (error) {

        console.error(
            "Delete skill error:",
            error
        );

        alert(
            "Cannot connect to the server."
        );

    }

}


// ==========================================
// PROJECTS
// ==========================================

const projectForm =
    document.getElementById("projectForm");

const projectsContainer =
    document.getElementById("projectsContainer");

if (projectForm) {

    projectForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const user =
                getLoggedInUser();

            if (!user) {

                alert("Please login first.");

                window.location.href =
                    "login.html";

                return;
            }

            const projectName =
                document.getElementById(
                    "projectName"
                ).value.trim();

            const description =
                document.getElementById(
                    "projectDescription"
                ).value.trim();

            const technologies =
                document.getElementById(
                    "technologies"
                ).value.trim();

            const projectLink =
                document.getElementById(
                    "projectLink"
                ).value.trim();

            try {

                const response = await fetch(
                    `${API_URL}/api/projects`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            user_id:
                                user.id,

                            project_name:
                                projectName,

                            description:
                                description,

                            technologies:
                                technologies,

                            project_link:
                                projectLink

                        })
                    }
                );

                const data =
                    await response.json();

                if (!response.ok) {

                    alert(
                        data.message ||
                        "Failed to add project."
                    );

                    return;
                }

                alert(
                    "Project added successfully!"
                );

                projectForm.reset();

                loadProjects();

            } catch (error) {

                console.error(
                    "Project error:",
                    error
                );

                alert(
                    "Cannot connect to the server."
                );

            }

        }
    );

}


async function loadProjects() {

    if (!projectsContainer) {
        return;
    }

    const user =
        getLoggedInUser();

    if (!user) {

        projectsContainer.innerHTML =
            "<p>Please login first.</p>";

        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/api/projects/${user.id}`
        );

        const projects =
            await response.json();

        if (!response.ok) {

            projectsContainer.innerHTML =
                "<p>Failed to load projects.</p>";

            return;
        }

        if (projects.length === 0) {

            projectsContainer.innerHTML =
                "<p>No projects added yet.</p>";

            return;
        }

        projectsContainer.innerHTML = "";

        projects.forEach(function (project) {

            const projectDiv =
                document.createElement("div");

            projectDiv.className =
                "project-item";

            projectDiv.innerHTML = `

                <div class="project-content">

                    <h3>
                        ${project.project_name}
                    </h3>

                    <p>
                        ${project.description}
                    </p>

                    <p>
                        <strong>
                            Technologies:
                        </strong>

                        ${project.technologies}
                    </p>

                    ${
                        project.project_link
                        ?
                        `
                        <a
                            href="${project.project_link}"
                            target="_blank">

                            View Project

                        </a>
                        `
                        :
                        ""
                    }

                </div>

                <button
                    class="delete-project-btn"
                    onclick="deleteProject(
                        ${project.id}
                    )">

                    Delete

                </button>

            `;

            projectsContainer.appendChild(
                projectDiv
            );

        });

    } catch (error) {

        console.error(
            "Load projects error:",
            error
        );

        projectsContainer.innerHTML =
            "<p>Cannot connect to the server.</p>";

    }

}

if (projectsContainer) {
    loadProjects();
}


async function deleteProject(projectId) {

    if (!confirm(
        "Are you sure you want to delete this project?"
    )) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/api/projects/${projectId}`,
            {
                method: "DELETE"
            }
        );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                data.message ||
                "Failed to delete project."
            );

            return;
        }

        alert(
            "Project deleted successfully!"
        );

        loadProjects();

    } catch (error) {

        console.error(
            "Delete project error:",
            error
        );

        alert(
            "Cannot connect to the server."
        );

    }

}


// ==========================================
// CERTIFICATIONS
// ==========================================

const certificationForm =
    document.getElementById(
        "certificationForm"
    );

const certificationsContainer =
    document.getElementById(
        "certificationsContainer"
    );

if (certificationForm) {

    certificationForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const user =
                getLoggedInUser();

            if (!user) {

                alert("Please login first.");

                window.location.href =
                    "login.html";

                return;
            }

            const certificationName =
                document.getElementById(
                    "certificationName"
                ).value.trim();

            const issuingOrganization =
                document.getElementById(
                    "issuingOrganization"
                ).value.trim();

            const issueDate =
                document.getElementById(
                    "issueDate"
                ).value;

            const certificateLink =
                document.getElementById(
                    "certificateLink"
                ).value.trim();

            try {

                const response = await fetch(
                    `${API_URL}/api/certifications`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            user_id:
                                user.id,

                            certificate_name:
                                certificationName,

                            organization:
                                issuingOrganization,

                            issue_date:
                                issueDate,

                            certificate_link:
                                certificateLink

                        })
                    }
                );

                const data =
                    await response.json();

                if (!response.ok) {

                    alert(
                        data.message ||
                        "Failed to add certification."
                    );

                    return;
                }

                alert(
                    "Certification added successfully!"
                );

                certificationForm.reset();

                loadCertifications();

            } catch (error) {

                console.error(
                    "Certification error:",
                    error
                );

                alert(
                    "Cannot connect to the server."
                );

            }

        }
    );

}


async function loadCertifications() {

    if (!certificationsContainer) {
        return;
    }

    const user =
        getLoggedInUser();

    if (!user) {

        certificationsContainer.innerHTML =
            "<p>Please login first.</p>";

        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/api/certifications/${user.id}`
        );

        const certifications =
            await response.json();

        if (!response.ok) {

            certificationsContainer.innerHTML =
                "<p>Failed to load certifications.</p>";

            return;
        }

        if (certifications.length === 0) {

            certificationsContainer.innerHTML =
                "<p>No certifications added yet.</p>";

            return;
        }

        certificationsContainer.innerHTML = "";

        certifications.forEach(
            function (certification) {

                const certDiv =
                    document.createElement("div");

                certDiv.className =
                    "certification-item";

                certDiv.innerHTML = `

                    <div class="certification-content">

                        <h3>
                            ${certification.certificate_name}
                        </h3>

                        <p>
                            <strong>
                                Organization:
                            </strong>

                            ${certification.organization}
                        </p>

                        <p>
                            <strong>
                                Issue Date:
                            </strong>

                            ${certification.issue_date || "-"}
                        </p>

                        ${
                            certification.certificate_link
                            ?
                            `
                            <a
                                href="${certification.certificate_link}"
                                target="_blank">

                                View Certificate

                            </a>
                            `
                            :
                            ""
                        }

                    </div>

                    <button
                        class="delete-certification-btn"
                        onclick="deleteCertification(
                            ${certification.id}
                        )">

                        Delete

                    </button>

                `;

                certificationsContainer.appendChild(
                    certDiv
                );

            }
        );

    } catch (error) {

        console.error(
            "Load certifications error:",
            error
        );

        certificationsContainer.innerHTML =
            "<p>Cannot connect to the server.</p>";

    }

}

if (certificationsContainer) {
    loadCertifications();
}


async function deleteCertification(
    certificationId
) {

    if (!confirm(
        "Are you sure you want to delete this certification?"
    )) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/api/certifications/${certificationId}`,
            {
                method: "DELETE"
            }
        );

        const data =
            await response.json();

        if (!response.ok) {

            alert(
                data.message ||
                "Failed to delete certification."
            );

            return;
        }

        alert(
            "Certification deleted successfully!"
        );

        loadCertifications();

    } catch (error) {

        console.error(
            "Delete certification error:",
            error
        );

        alert(
            "Cannot connect to the server."
        );

    }

}


// ==========================================
// INTERNSHIPS
// ==========================================

const internshipsContainer =
    document.getElementById(
        "internshipsContainer"
    );

const internshipSearch =
    document.getElementById(
        "internshipSearch"
    );

let allInternships = [];


// IDs of internships already applied for
let appliedInternshipIds = new Set();


if (internshipsContainer) {
    loadInternships();
}


// ==========================================
// LOAD INTERNSHIPS
// ==========================================

async function loadInternships() {

    try {

        const user =
            getLoggedInUser();

        const response = await fetch(
            `${API_URL}/api/internships`
        );

        const internships =
            await response.json();

        if (!response.ok) {

            internshipsContainer.innerHTML =
                "<p>Failed to load internships.</p>";

            return;
        }

        allInternships =
            internships;


        // Load existing applications
        if (user) {

            try {

                const applicationResponse =
                    await fetch(
                        `${API_URL}/api/applications/${user.id}`
                    );

                const applications =
                    await applicationResponse.json();

                if (applicationResponse.ok) {

                    appliedInternshipIds =
                        new Set(
                            applications.map(
                                function (application) {

                                    return Number(
                                        application.internship_id
                                    );

                                }
                            )
                        );

                }

            } catch (error) {

                console.error(
                    "Could not load application history:",
                    error
                );

            }

        }

        displayInternships(
            internships
        );

    } catch (error) {

        console.error(
            "Internships error:",
            error
        );

        if (internshipsContainer) {

            internshipsContainer.innerHTML =
                "<p>Cannot connect to the server.</p>";

        }

    }

}


// ==========================================
// DISPLAY INTERNSHIPS
// ==========================================

function displayInternships(
    internships
) {

    if (!internshipsContainer) {
        return;
    }

    internshipsContainer.innerHTML = "";

    if (internships.length === 0) {

        internshipsContainer.innerHTML =
            "<p>No internships found.</p>";

        return;
    }

    internships.forEach(
        function (internship) {

            const internshipDiv =
                document.createElement("div");

            internshipDiv.className =
                "internship-item";


            const alreadyApplied =
                appliedInternshipIds.has(
                    Number(internship.id)
                );


            internshipDiv.innerHTML = `

                <h3>
                    ${internship.internship_title}
                </h3>

                <p class="internship-company">
                    ${internship.company_name}
                </p>

                <p>
                    ${internship.description}
                </p>

                <p>
                    <strong>
                        Required Skills:
                    </strong>

                    ${internship.required_skills}
                </p>

                <p>
                    <strong>
                        Location:
                    </strong>

                    ${internship.location}
                </p>

                ${
                    alreadyApplied

                    ?

                    `
                    <button
                        class="apply-btn already-applied-btn"
                        disabled>

                        ✓ Already Applied

                    </button>
                    `

                    :

                    `
                    <button
                        class="apply-btn"
                        data-id="${internship.id}">

                        Apply Now

                    </button>
                    `
                }

            `;


            if (!alreadyApplied) {

                const applyButton =
                    internshipDiv.querySelector(
                        ".apply-btn"
                    );

                applyButton.addEventListener(
                    "click",
                    function () {

                        applyForInternship(
                            internship.id,
                            internship.application_link,
                            applyButton
                        );

                    }
                );

            }


            internshipsContainer.appendChild(
                internshipDiv
            );

        }
    );

}


// ==========================================
// SEARCH INTERNSHIPS
// ==========================================

if (internshipSearch) {

    internshipSearch.addEventListener(
        "input",
        function () {

            const searchText =
                internshipSearch.value
                    .toLowerCase()
                    .trim();

            const filtered =
                allInternships.filter(
                    function (internship) {

                        return (

                            internship.company_name
                                .toLowerCase()
                                .includes(searchText)

                            ||

                            internship.internship_title
                                .toLowerCase()
                                .includes(searchText)

                            ||

                            internship.required_skills
                                .toLowerCase()
                                .includes(searchText)

                            ||

                            internship.location
                                .toLowerCase()
                                .includes(searchText)

                        );

                    }
                );

            displayInternships(
                filtered
            );

        }
    );

}


// ==========================================
// APPLY FOR INTERNSHIP
// ==========================================

async function applyForInternship(
    internshipId,
    applicationLink,
    button
) {

    const user =
        getLoggedInUser();

    if (!user) {

        alert("Please login first.");

        window.location.href =
            "login.html";

        return;
    }


    if (button) {

        button.disabled = true;

        button.textContent =
            "Applying...";

    }


    try {

        const response = await fetch(
            `${API_URL}/api/applications`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    user_id:
                        user.id,

                    internship_id:
                        internshipId

                })
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            if (
                data.message &&
                data.message
                    .toLowerCase()
                    .includes("already applied")
            ) {

                appliedInternshipIds.add(
                    Number(internshipId)
                );

                if (button) {

                    button.textContent =
                        "✓ Already Applied";

                    button.classList.add(
                        "already-applied-btn"
                    );

                    button.disabled = true;

                }

                return;
            }


            alert(
                data.message ||
                "Failed to apply."
            );


            if (button) {

                button.disabled = false;

                button.textContent =
                    "Apply Now";

            }

            return;
        }


        appliedInternshipIds.add(
            Number(internshipId)
        );


        alert(
            "Application submitted successfully! 📋"
        );


        if (button) {

            button.textContent =
                "✓ Already Applied";

            button.classList.add(
                "already-applied-btn"
            );

            button.disabled = true;

        }


        // Open company application website
        if (applicationLink) {

            window.open(
                applicationLink,
                "_blank"
            );

        }

    } catch (error) {

        console.error(
            "Application error:",
            error
        );

        alert(
            "Cannot connect to the server."
        );


        if (button) {

            button.disabled = false;

            button.textContent =
                "Apply Now";

        }

    }

}


// ==========================================
// APPLICATIONS
// ==========================================

const applicationsContainer =
    document.getElementById(
        "applicationsContainer"
    );

if (applicationsContainer) {

    loadApplications();

}


async function loadApplications() {

    if (!applicationsContainer) {
        return;
    }


    const user =
        getLoggedInUser();


    if (!user) {

        applicationsContainer.innerHTML =
            "<p>Please login to view your applications.</p>";

        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/api/applications/${user.id}`
        );

        const applications =
            await response.json();


        if (!response.ok) {

            applicationsContainer.innerHTML =
                "<p>Failed to load applications.</p>";

            return;
        }


        if (applications.length === 0) {

            applicationsContainer.innerHTML =
                "<p>You have not applied for any internships yet.</p>";

            return;
        }


        applicationsContainer.innerHTML = "";


        applications.forEach(
            function (application) {

                const applicationDiv =
                    document.createElement("div");

                applicationDiv.className =
                    "application-item";


                applicationDiv.innerHTML = `

                    <div class="application-content">

                        <h3>
                            ${application.internship_title}
                        </h3>

                        <p class="application-company">
                            ${application.company_name}
                        </p>

                        <p>
                            <strong>
                                Location:
                            </strong>

                            ${application.location}
                        </p>

                        <p>
                            <strong>
                                Applied Date:
                            </strong>

                            ${new Date(
                                application.applied_date
                            ).toLocaleDateString()}
                        </p>

                        <span class="application-status">

                            Status:
                            ${application.status}

                        </span>

                    </div>


                    <button
                        class="delete-application-btn"
                        onclick="deleteApplication(
                            ${application.id}
                        )">

                        Delete

                    </button>

                `;


                applicationsContainer.appendChild(
                    applicationDiv
                );

            }
        );


    } catch (error) {

        console.error(
            "Applications error:",
            error
        );

        applicationsContainer.innerHTML =
            "<p>Cannot connect to the server.</p>";

    }

}


// ==========================================
// DELETE APPLICATION
// ==========================================

async function deleteApplication(
    applicationId
) {

    if (!confirm(
        "Are you sure you want to delete this application?"
    )) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/api/applications/${applicationId}`,
            {
                method: "DELETE"
            }
        );

        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to delete application."
            );

            return;
        }


        alert(
            "Application deleted successfully!"
        );


        loadApplications();


    } catch (error) {

        console.error(
            "Delete application error:",
            error
        );

        alert(
            "Cannot connect to the server."
        );

    }

}


// ==========================================
// ADMIN LOGIN
// ==========================================

const adminLoginForm =
    document.getElementById(
        "adminLoginForm"
    );


if (adminLoginForm) {

    adminLoginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                document.getElementById(
                    "adminEmail"
                ).value.trim();


            const password =
                document.getElementById(
                    "adminPassword"
                ).value;


            try {

                const response = await fetch(
                    `${API_URL}/api/admin/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            email:
                                email,

                            password:
                                password

                        })
                    }
                );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Invalid admin login."
                    );

                    return;
                }


                // Store admin information
                localStorage.setItem(
                    "admin",
                    JSON.stringify(data.admin)
                );


                window.location.href =
                    "admin.html";


            } catch (error) {

                console.error(
                    "Admin login error:",
                    error
                );

                alert(
                    "Cannot connect to the server."
                );

            }

        }
    );

}


// ==========================================
// PROTECT ADMIN PAGE
// ==========================================

if (
    window.location.pathname.endsWith(
        "/admin.html"
    )
) {

    const admin =
        localStorage.getItem("admin");


    if (!admin) {

        alert(
            "Please login as admin first."
        );


        window.location.href =
            "admin-login.html";

    }

}


// ==========================================
// ADMIN LOGOUT
// ==========================================

const adminLogoutBtn =
    document.getElementById(
        "adminLogoutBtn"
    );


if (adminLogoutBtn) {

    adminLogoutBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            localStorage.removeItem(
                "admin"
            );


            window.location.href =
                "admin-login.html";

        }
    );

}


// ==========================================
// ADMIN - LOAD ALL APPLICATIONS
// ==========================================

const adminApplicationsContainer =
    document.getElementById(
        "adminApplicationsContainer"
    );


if (adminApplicationsContainer) {

    loadAdminApplications();

}


async function loadAdminApplications() {

    if (!adminApplicationsContainer) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/api/admin/applications`
        );


        const applications =
            await response.json();


        if (!response.ok) {

            adminApplicationsContainer.innerHTML =
                "<p>Failed to load applications.</p>";

            return;
        }


        if (applications.length === 0) {

            adminApplicationsContainer.innerHTML =
                "<p>No student applications yet.</p>";

            return;
        }


        adminApplicationsContainer.innerHTML = "";


        applications.forEach(
            function (application) {

                const applicationDiv =
                    document.createElement("div");


                applicationDiv.className =
                    "admin-application-item";


                applicationDiv.innerHTML = `

                    <div class="admin-application-info">

                        <h3>
                            ${application.internship_title}
                        </h3>

                        <p>
                            <strong>
                                Company:
                            </strong>

                            ${application.company_name}
                        </p>

                        <p>
                            <strong>
                                Student:
                            </strong>

                            ${application.student_name}
                        </p>

                        <p>
                            <strong>
                                Email:
                            </strong>

                            ${application.student_email}
                        </p>

                        <p>
                            <strong>
                                Location:
                            </strong>

                            ${application.location}
                        </p>

                        <p>
                            <strong>
                                Applied Date:
                            </strong>

                            ${new Date(
                                application.applied_date
                            ).toLocaleDateString()}
                        </p>

                        <p>
                            <strong>
                                Current Status:
                            </strong>

                            <span class="admin-status">
                                ${application.status}
                            </span>

                        </p>

                    </div>


                    <div class="admin-status-control">

                        <label>
                            Update Status
                        </label>


                        <select
                            onchange="
                                updateAdminApplicationStatus(
                                    ${application.id},
                                    this.value
                                )
                            ">

                            <option
                                value="Applied"
                                ${
                                    application.status === "Applied"
                                    ? "selected"
                                    : ""
                                }>

                                Applied

                            </option>


                            <option
                                value="Interview"
                                ${
                                    application.status === "Interview"
                                    ? "selected"
                                    : ""
                                }>

                                Interview

                            </option>


                            <option
                                value="Selected"
                                ${
                                    application.status === "Selected"
                                    ? "selected"
                                    : ""
                                }>

                                Selected

                            </option>


                            <option
                                value="Rejected"
                                ${
                                    application.status === "Rejected"
                                    ? "selected"
                                    : ""
                                }>

                                Rejected

                            </option>

                        </select>

                    </div>

                `;


                adminApplicationsContainer.appendChild(
                    applicationDiv
                );

            }
        );


    } catch (error) {

        console.error(
            "Admin applications error:",
            error
        );


        adminApplicationsContainer.innerHTML =
            "<p>Cannot connect to the server.</p>";

    }

}


// ==========================================
// ADMIN - UPDATE APPLICATION STATUS
// ==========================================

async function updateAdminApplicationStatus(
    applicationId,
    status
) {

    try {

        const response = await fetch(
            `${API_URL}/api/admin/applications/${applicationId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    status: status
                })
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to update status."
            );

            return;
        }


        alert(
            "Application status updated successfully!"
        );


        loadAdminApplications();


    } catch (error) {

        console.error(
            "Admin status error:",
            error
        );


        alert(
            "Cannot connect to the server."
        );

    }

}
// ==========================================
// FORGOT PASSWORD
// ==========================================

// ==========================================
// FORGOT PASSWORD
// ==========================================

const forgotPasswordForm =
    document.getElementById("forgotPasswordForm");

if (forgotPasswordForm) {

    forgotPasswordForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const email =
                document.getElementById("forgotEmail").value.trim();

            const newPassword =
                document.getElementById("newPassword").value;

            const confirmPassword =
                document.getElementById("confirmPassword").value;


            // Check email
            if (!email) {
                alert("Please enter your email.");
                return;
            }


            // Check password
            if (!newPassword || !confirmPassword) {
                alert("Please enter and confirm your new password.");
                return;
            }


            // Check passwords match
            if (newPassword !== confirmPassword) {
                alert("Passwords do not match.");
                return;
            }


            // Check password length
            if (newPassword.length < 6) {
                alert("Password must be at least 6 characters.");
                return;
            }


            try {

                const response = await fetch(
                    `${API_URL}/api/forgot-password`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            email: email,
                            newPassword: newPassword
                        })
                    }
                );


                // Read response safely
                const text = await response.text();

                let data;

                try {
                    data = JSON.parse(text);
                } catch (error) {
                    console.error(
                        "Server returned:",
                        text
                    );

                    alert(
                        "Server error. Check the backend terminal."
                    );

                    return;
                }


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Failed to reset password."
                    );

                    return;
                }


                alert(
                    "Password reset successfully! Please login with your new password."
                );


                window.location.href =
                    "login.html";


            } catch (error) {

                console.error(
                    "Forgot password error:",
                    error
                );

                alert(
                    "Cannot connect to the server. Make sure server.js is running on port 5000."
                );

            }

        }
    );

}