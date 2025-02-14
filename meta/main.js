const width = 1000;
const height = 600;
const margin = { top: 10, right: 10, bottom: 50, left: 50 }; 

const usableArea = {
  top: margin.top,
  right: width - margin.right,
  bottom: height - margin.bottom,
  left: margin.left,
  width: width - margin.left - margin.right,
  height: height - margin.top - margin.bottom,
};

let data = [];
let commits = [];
let brushSelection = null;

// Create SVG for scatterplot
const svg = d3
  .select("#chart")
  .append("svg")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .style("overflow", "visible");

// Function to load and process data
async function loadData() {
  data = await d3.csv("loc.csv", (row) => ({
    ...row,
    line: +row.line,
    depth: +row.depth,
    length: +row.length,
    date: new Date(row.date + "T00:00" + row.timezone),
    datetime: new Date(row.datetime),
  }));

  processCommits();
  displayStats();
  createScatterplot();
}

// Function to process commits
function processCommits() {
  commits = d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;

      let ret = {
        id: commit,
        url: `https://github.com/Roseyroseo/portfolio/commit/${commit}`,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, "lines", {
        value: lines,
        enumerable: false, // Hide from console logs
        configurable: false,
        writable: false,
      });

      return ret;
    });
}
// Display aggregated statistics
function displayStats() {
    // Process commits before displaying stats
    processCommits();

    // Select the stats container
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');

    // Add total commits
    dl.append('dt').text('Commits');
    dl.append('dd').text(commits.length);

    // Add total LOC (Lines of Code)
    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(data.length);

    // Additional statistics
    dl.append('dt').text('Number of files');
    dl.append('dd').text(d3.group(data, d => d.file).size);

    dl.append('dt').text('Longest line length');
    dl.append('dd').text(d3.max(data, d => d.length));

    dl.append('dt').text('Average file length');
    const fileLengths = d3.rollups(
        data,
        v => d3.max(v, d => d.line),
        d => d.file
    );
    dl.append('dd').text(d3.mean(fileLengths, d => d[1]).toFixed(2));

    // Find the most common time of day for commits
    const workByPeriod = d3.rollups(
        data,
        v => v.length,
        d => new Date(d.datetime).toLocaleString('en', { dayPeriod: 'short' })
    );
    const maxPeriod = d3.greatest(workByPeriod, d => d[1])?.[0];
    dl.append('dt').text('Most active time of day');
    dl.append('dd').text(maxPeriod);
}

// Function to update tooltip visibility
function updateTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
    const author = document.getElementById('commit-author');
    const lines = document.getElementById('commit-lines');
  
    if (Object.keys(commit).length === 0) return;
  
    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString('en', { dateStyle: 'full' });
    author.textContent = commit.author;
    lines.textContent = commit.totalLines;
  }

// function to control tooltip visibility
function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
  }

// Function to update tooltip position
function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX + 10}px`;
  tooltip.style.top = `${event.clientY + 10}px`;
}

// Function to create scatterplot visualization with brushing
function createScatterplot() {
    if (!commits.length) return;

    // Define scales
    const xScale = d3
        .scaleTime()
        .domain(d3.extent(commits, (d) => d.datetime))
        .range([usableArea.left, usableArea.right])
        .nice();

    const yScale = d3
        .scaleLinear()
        .domain([0, 24]) // Represents hours in a day
        .range([usableArea.bottom, usableArea.top]);

    // Create a **square root** scale for the dot size
    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
    const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([2, 30]);  // Adjust size as needed

    // Sort commits by total lines so **smaller dots are on top**
    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

    // Add gridlines before axes
    const gridlines = svg.append("g")
        .attr("class", "gridlines")
        .attr("transform", `translate(${usableArea.left}, 0)`);
    gridlines.call(d3.axisLeft(yScale).tickFormat("").tickSize(-usableArea.width));

    // Create axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale)
        .tickFormat((d) => String(d % 24).padStart(2, "0") + ":00");

    // Add X axis
    svg.append("g")
        .attr("transform", `translate(0, ${usableArea.bottom})`)
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-35)");

    // Add Y axis
    svg.append("g")
        .attr("transform", `translate(${usableArea.left}, 0)`)
        .call(yAxis);

    // Define a color scale for time of day (bluer for night, orangish for day)
    const colorScale = d3.scaleSequential(d3.interpolateRdYlBu)
        .domain([0, 24]);

    // Draw scatter plot (dots)
    const dots = svg.append("g").attr("class", "dots");

    dots.selectAll("circle")
        .data(sortedCommits) // Use sorted commits to draw larger dots first
        .join("circle")
        .attr("cx", (d) => xScale(d.datetime))
        .attr("cy", (d) => yScale(d.hourFrac))
        .attr("r", (d) => rScale(d.totalLines))  // **Set radius based on lines edited**
        .attr("fill", (d) => colorScale(d.hourFrac))
        .style("fill-opacity", 0.7) // Add transparency for overlapping dots
        .on("mouseenter", function (event, d) {
            d3.select(event.currentTarget).style("fill-opacity", 1); // Full opacity on hover
            updateTooltipContent(d);
            updateTooltipVisibility(true);
            updateTooltipPosition(event);
        })
        .on("mouseleave", function () {
            d3.select(event.currentTarget).style("fill-opacity", 0.7); // Restore transparency
            updateTooltipContent({});
            updateTooltipVisibility(false);
        })
        .on("mousemove", (event) => {
            updateTooltipPosition(event);
        });
}

  // Load data when DOM is ready
  document.addEventListener("DOMContentLoaded", async () => {
    await loadData();
  });