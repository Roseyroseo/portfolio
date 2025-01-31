import { fetchJSON, renderProjects } from "../global.js";

async function displayProjects() {
    const projectsContainer = document.querySelector(".projects");
    const projectsTitle = document.querySelector(".projects-title");

    if (!projectsContainer) {
        console.warn("Projects container not found.");
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

        // Update project count
        if (projectsTitle) {
            projectsTitle.textContent = `Projects (${projects.length})`;
        }

        // Render projects
        projects.forEach((project) => {
            console.log("Rendering project:", project);
            renderProjects(project, projectsContainer, "h2"); // Pass "h2" explicitly
        });

    } catch (error) {
        console.error("Error fetching or rendering projects:", error);
    }
}

displayProjects();