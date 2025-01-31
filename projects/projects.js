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

    try {
        console.log("Fetching projects JSON...");
        const projects = await fetchJSON("../lib/projects.json");
        console.log("Projects fetched:", projects);

        if (!projects || !Array.isArray(projects)) {
            console.warn("Invalid or empty projects data.");
            projectsContainer.innerHTML = "<p>No projects available.</p>";
            return;
        }
        // Update the projects title with the total number of projects
        if (projectsTitle) {
            projectsTitle.textContent = `Projects (${projects.length})`;
        }
        // Render each project into the container
        projects.forEach((project) => {
            renderProjects(project, projectsContainer, "h2");
        });

    } catch (error) {
        console.error("Error fetching or rendering projects:", error);
    }
}

displayProjects();