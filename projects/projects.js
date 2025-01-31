import { fetchJSON, renderProjects } from "../global.js";

async function displayProjects() {
    const projectsContainer = document.querySelector(".projects");
    const projectsTitle = document.querySelector(".projects-title");

    if (!projectsContainer) {
        console.warn("Projects container not found.");
        return;
    }

    // Fetch project data from JSON
    const projects = await fetchJSON("../lib/projects.json");

    if (!projects || !Array.isArray(projects)) {
        console.warn("Invalid or empty projects data.");
        projectsContainer.innerHTML = "<p>No projects available.</p>";
        return;
    }

    // Update the projects count in the title
    if (projectsTitle) {
        projectsTitle.textContent = `Projects (${projects.length})`;
    }

    // Render each project dynamically
    projects.forEach((project) => {
        renderProjects(project, projectsContainer, "h2");
    });
}

// Call the function to display projects
displayProjects();