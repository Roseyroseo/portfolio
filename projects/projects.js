import { fetchJSON } from "../global.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let projects = [];
let query = "";
let selectedIndex = -1; // -1 means no wedge is selected
let data = []; // Store pie chart data for reference

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
    applyFilters(); // Ensure filters are applied on load

    // Attach event listener to the search bar
    if (searchInput) {
      searchInput.addEventListener("input", (event) => {
        query = event.target.value; // Update the search query
        applyFilters(true); // Update the pie chart when searching
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

  data = rolledData.map(([year, count]) => ({
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
        selectedIndex = selectedIndex === i ? -1 : i; // Toggle selection

        // Update classes for selection effect
        svg
          .selectAll("path")
          .attr("class", (_, idx) => (idx === selectedIndex ? "selected" : null));

        legend
          .selectAll("li")
          .attr("class", (_, idx) => (idx === selectedIndex ? "selected" : null));

        applyFilters(false); // Do NOT redraw the pie chart
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
        applyFilters(); // Apply the filters dynamically
      });
  });
}

function applyFilters(updatePieChart = false) {
  const selectedYear =
    selectedIndex !== -1 ? data[selectedIndex]?.label : null; // Get selected year from the legend data
  console.log("Applying Filters - Selected Year:", selectedYear, "Query:", query);

  const filteredProjects = filterProjects(query, selectedYear); // Apply both filters
  renderProjects(filteredProjects); // Render the filtered projects

  // Update pie chart only when searching
  if (updatePieChart) {
    renderPieChart(filteredProjects); // Update the pie chart and legend dynamically
  }
}

// Call the main function to fetch and display projects
fetchAndDisplayProjects();
