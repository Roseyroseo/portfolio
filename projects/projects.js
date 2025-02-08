import { fetchJSON } from "../global.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let projects = [];
let query = "";
let selectedIndex = -1; // -1 means no wedge is selected

async function fetchAndDisplayProjects() {
  const projectsContainer = document.querySelector(".projects");
  const searchInput = document.querySelector(".searchBar");

  if (!projectsContainer) {
    console.error("Projects container not found!");
    return;
  }

  try {
    // Fetch projects data
    projects = await fetchJSON("../lib/projects.json");

    // Display all projects initially
    renderProjects(projects);

    // Attach event listener to the search bar
    if (searchInput) {
        searchInput.addEventListener("input", (event) => {
            query = event.target.value; // Update the search query
    
            // Get the currently selected year
            const selectedYear = selectedIndex !== -1 ? data[selectedIndex].label : null;
    
            // Apply both filters at once
            const filteredProjects = filterProjects(query, selectedYear);
    
            // Render the updated projects
            renderProjects(filteredProjects);
        });
    }

    // Render the initial pie chart
    renderPieChart(projects);
  } catch (error) {
    console.error("Error fetching or rendering projects:", error);
  }
}

function filterProjects(query, selectedYear) {
    return projects.filter((project) => {
        const values = Object.values(project)
            .join(" ")
            .toLowerCase();
        const matchesQuery = values.includes(query.toLowerCase());
        const matchesYear = selectedYear ? project.year === selectedYear : true;
        return matchesQuery && matchesYear;
    });
}

function renderProjects(projectsToRender) {
  const projectsContainer = document.querySelector(".projects");
  projectsContainer.innerHTML = ""; // Clear existing projects

  projectsToRender.forEach((project) => {
    const article = document.createElement("article");
    article.innerHTML = `
      <h2>${project.title}</h2>
      <img src="${project.image}" alt="${project.title}" />
      <p>${project.description}</p>
      <footer><time class="project-year">c. ${project.year}</time></footer>
    `;
    projectsContainer.appendChild(article);
  });
}

function renderPieChart(projectsToVisualize) {
  const svg = d3.select("#projects-pie-plot");
  const legend = d3.select(".legend");

  // Clear previous chart and legend
  svg.selectAll("*").remove();
  legend.selectAll("*").remove();

  // Group projects by year and count
  const rolledData = d3.rollups(
    projectsToVisualize,
    (v) => v.length,
    (d) => d.year
  );

  const data = rolledData.map(([year, count]) => ({
    label: year,
    value: count,
  }));

  const colors = d3.scaleOrdinal(d3.schemeAccent);

  const arcGenerator = d3
    .arc()
    .innerRadius(0)
    .outerRadius(50);

  const pie = d3.pie().value((d) => d.value);
  const arcData = pie(data);

  // Draw pie chart with interactivity
  arcData.forEach((d, i) => {
    svg
      .append("path")
      .attr("d", arcGenerator(d))
      .attr("fill", colors(i))
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.3)
      .on("click", () => {
        selectedIndex = selectedIndex === i ? -1 : i;
    
        // Update classes for visual selection
        svg
          .selectAll("path")
          .attr("class", (_, idx) => (idx === selectedIndex ? "selected" : null));
    
        legend
          .selectAll("li")
          .attr("class", (_, idx) => (idx === selectedIndex ? "selected" : null));
    
        // Get the selected year
        const selectedYear = selectedIndex !== -1 ? data[selectedIndex].label : null;
    
        // Apply both search and year filtering
        const filteredProjects = filterProjects(query, selectedYear);
        renderProjects(filteredProjects);
    });
  });

  // Draw legend with interactivity
  data.forEach((d, i) => {
    legend
      .append("li")
      .attr("style", `--color:${colors(i)}`)
      .html(`<span class="swatch"></span> ${d.label} (${d.value})`)
      .on("click", () => {
        // Simulate wedge click
        svg.selectAll("path").nodes()[i].dispatchEvent(new Event("click"));
      });
  });
}

// Call the main function to fetch and display projects
fetchAndDisplayProjects();
