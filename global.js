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

// Detect if we are on the home page
const ARE_WE_HOME = document.documentElement.classList.contains('home');

// Get the base URL for GitHub Pages 
const BASE_URL = '/portfolio/';

// Create <nav> and add it to the <body>
const nav = document.createElement('nav');
document.body.prepend(nav);

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