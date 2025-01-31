console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// Add the theme switcher dropdown
document.body.insertAdjacentHTML(
    'afterbegin',
    `
      <label class="color-scheme">
        Theme:
        <select id="theme-select">
          <option value="light dark">Automatic</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>

    `
  );

// Function to set the color scheme
function setColorScheme(colorScheme) {
    document.documentElement.style.setProperty("color-scheme", colorScheme);
    localStorage.colorScheme = colorScheme; // Save preference
  }

// Get reference to the select element
const select = document.getElementById("theme-select");

// Check if there's a saved preference in localStorage
if ("colorScheme" in localStorage) {
  const savedScheme = localStorage.colorScheme;
  setColorScheme(savedScheme); // Apply the saved preference
  select.value = savedScheme; // Update the dropdown to match
}

// Add an event listener to the select element
select.addEventListener("input", (event) => {
  const selectedScheme = event.target.value;
  setColorScheme(selectedScheme); // Apply the selected color scheme
});

// Navigation links data
const pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact' },
    { url: 'resume/', title: 'Resume' },
    { url: 'https://github.com/Roseyroseo', title: 'GitHub' },
  ];


// Create <nav> and append it after the dropdown
const nav = document.createElement('nav');
document.body.insertBefore(nav, document.body.children[1]);

// Detect if we are on the home page
const ARE_WE_HOME = document.documentElement.classList.contains('home');

// Get the base URL for GitHub Pages 
const BASE_URL = '/portfolio/';

// Generate links for the navigation menu
for (const p of pages) {
    let url = p.url;
  
    // navigation links
    if (!url.startsWith("http")) {
        url = BASE_URL + url;
      }
  
    // Create a link element
    const a = document.createElement("a");
    a.href = url;
    a.textContent = p.title;
  
    // Highlight the current page
  if (a.host === location.host && a.pathname === location.pathname) {
    a.classList.add("current"); // Add the 'current' class
  }
  
    // Open external links in a new tab
    if (a.host !== location.host) {
        a.setAttribute("target", "_blank"); // Open external links in a new tab
        a.setAttribute("rel", "noopener noreferrer"); // Security best practice
      }
  
    // Add the link to the <nav>
    nav.append(a);
  }

// contact form
(function handleContactForm() {
    // Get the reference to the form
    const form = document.getElementById("contact-form");
  
    // Add an event listener to intercept the submit event
    form?.addEventListener("submit", function (event) {
      // Prevent the default form submission
      event.preventDefault();
  
      // Create a FormData object from the form
      const data = new FormData(form);
  
      // Start building the mailto URL
      let url = form.action + "?";
  
      // Iterate over the form fields
      for (let [name, value] of data) {
        // Append encoded key-value pairs to the URL
        url += `${encodeURIComponent(name)}=${encodeURIComponent(value)}&`;
      }
  
      // Remove the trailing '&' from the URL
      url = url.slice(0, -1);
  
      // Navigate to the URL (opens email client with prefilled fields)
      location.href = url;
    });
  })();

export async function fetchJSON(url) {
    try {
      // Fetch the JSON file from the given URL
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Fetched data:", data); // debugging
      return data; 
    }
    catch (error) {
      console.error("Error fetching or parsing JSON data:", error);
    }
  }

/**
 * Renders a project dynamically into a container element.
 * @param {Object} project - Object containing project details (title, image, description).
 * @param {HTMLElement} containerElement - The DOM element to append the project to.
 * @param {string} headingLevel - Optional heading level for the project title (default: 'h2').
 **/

export function renderProjects(project, containerElement){
  // Validate containerElement
  if (!(containerElement instanceof HTMLElement)) {
    console.error("Invalid container element provided.");
    return;
  }

  // Validate headingLevel
  const validHeadingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  if (!validHeadingTags.includes(headingLevel)) {
    console.warn(`Invalid heading level "${headingLevel}" provided. Defaulting to "h2".`);
    headingLevel = 'h2';
  }

  // Clear existing content in the container to avoid duplication
  containerElement.innerHTML = '';

  // Create the <article> element
  const article = document.createElement('article');

  // Populate the <article> with dynamic content
  article.innerHTML = `
    <${headingLevel}>${project.title || 'Untitled Project'}</${headingLevel}>
    <img src="${project.image || ''}" alt="${project.title || 'Project image'}">
    <p>${project.description || 'No description available.'}</p>
  `;

  // Append the <article> to the container
  containerElement.appendChild(article);
}