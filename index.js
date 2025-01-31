import { fetchJSON, renderProjects } from './global.js';

async function displayLatestProjects() {
    try {
        // Fetch all projects
        const projects = await fetchJSON('./lib/projects.json');
        console.log('Projects fetched:', projects);

        // Filter the latest 3 projects
        const latestProjects = projects.slice(0, 3);
        console.log('Latest projects:', latestProjects);

        // Select the projects container
        const projectsContainer = document.querySelector('.projects');

        if (!projectsContainer) {
            console.error('Projects container not found.');
            return; // exit if container is not found
        }

        // Render the latest projects
        latestProjects.forEach((project) => {
            renderProjects(project, projectsContainer, 'h2');
        });
    } catch (error) {
        console.error('Error displaying latest projects:', error);
    }
}

// Call the function to display the latest projects
displayLatestProjects();