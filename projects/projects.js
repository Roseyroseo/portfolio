import { fetchJSON, renderProjects } from "../global.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

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

        // Generate the pie chart for projects by year
        renderPieChart(projects);

    } catch (error) {
        console.error("Error fetching or rendering projects:", error);
    }
}
displayProjects();

// Function to render the pie chart
function renderPieChart(projects) {
    // Group projects by year and count them
    let rolledData = d3.rollups(
        projects,
        (v) => v.length,
        (d) => d.year
    );

    // Convert rolledData into format suitable for the pie chart
    let data = rolledData.map(([year, count]) => {
        return { value: count, label: year };
    });

    console.log("Rolled data for pie chart:", data);

    // Generate pie slices
    let sliceGenerator = d3.pie().value((d) => d.value);
    let arcData = sliceGenerator(data);
    let colors = d3.scaleOrdinal(d3.schemeAccent);

    // Create an arc generator
    let arcGenerator = d3
        .arc()
        .innerRadius(0)
        .outerRadius(50);

    // Clear existing pie chart
    const svg = d3.select("#projects-pie-plot");
    svg.selectAll("*").remove();

    // Render pie chart
    arcData.forEach((d, index) => {
        svg.append("path")
            .attr("d", arcGenerator(d))
            .attr("fill", colors(index))
            .attr("stroke-width", 0.5);
    });

    // Render the legend
    const legend = d3.select(".legend");
    legend.selectAll("*").remove(); // Clear existing legend items

    data.forEach((d, idx) => {
        legend
            .append("li")
            .attr("style", `--color: ${colors(idx)}`)
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
}

let query = "";
let searchInput = document.querySelector(".searchBar");

searchInput.addEventListener('input', (event) => {
    query = event.target.value.toLowerCase(); // Normalize to lowercase
    filterAndRenderProjects(); // Call function to update the project list & chart
});

function filterAndRenderProjects() {
    // Filter projects based on search query
    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query);
    });

    // Clear and re-render the project list
    projectsContainer.innerHTML = ''; 
    renderProjects(filteredProjects, projectsContainer, 'h2');

    // Update the pie chart with filtered projects
    renderPieChart(filteredProjects);
}

