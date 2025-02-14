const width = 1000;
const height = 600;
const margin = { top: 10, right: 10, bottom: 30, left: 50 };

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
        url: `https://github.com/YOUR_REPO/commit/${commit}`,
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

// Function to create scatterplot visualization
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
  
    // Add gridlines before axes
    const gridlines = svg
      .append("g")
      .attr("class", "gridlines")
      .attr("transform", `translate(${usableArea.left}, 0)`);
  
    gridlines.call(
      d3.axisLeft(yScale).tickFormat("").tickSize(-usableArea.width)
    );
  
    // Create the axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3
      .axisLeft(yScale)
      .tickFormat((d) => String(d % 24).padStart(2, "0") + ":00");
  
    // Add X axis
    svg
      .append("g")
      .attr("transform", `translate(0, ${usableArea.bottom})`)
      .call(xAxis);
  
    // Add Y axis
    svg
      .append("g")
      .attr("transform", `translate(${usableArea.left}, 0)`)
      .call(yAxis);
  
    // Draw scatter plot (dots)
    const dots = svg.append("g").attr("class", "dots");
  
    dots
      .selectAll("circle")
      .data(commits)
      .join("circle")
      .attr("cx", (d) => xScale(d.datetime))
      .attr("cy", (d) => yScale(d.hourFrac))
      .attr("r", 5)
      .attr("fill", "steelblue");
  }
  
  // Load data when DOM is ready
  document.addEventListener("DOMContentLoaded", async () => {
    await loadData();
  });