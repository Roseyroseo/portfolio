console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

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
  
    // Ensure absolute paths for navigation links
    url = BASE_URL + url;
  
    // Create a link element
    const a = document.createElement("a");
    a.href = url;
    a.textContent = p.title;
  
    // Highlight the current page
    a.classList.toggle(
      "current",
      a.host === location.host && a.pathname === location.pathname
    );
  
    // Open external links in a new tab
    a.toggleAttribute("target", a.host !== location.host);
  
    // Add the link to the <nav>
    nav.append(a);
  }