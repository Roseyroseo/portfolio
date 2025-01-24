console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// // Automatically log nav links on every page
// const navLinks = $$('#nav a');
// console.log('Navigation Links:', navLinks);

// // Find the link to the current page
// const currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname === location.pathname);

// // Add the 'current' class to the matching link
// currentLink?.classList.add('current'); // Safely add the class if the link exists

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

// Create <nav> and add it to the <body>
const nav = document.createElement('nav');
document.body.prepend(nav);

// Generate links for the navigation menu
for (let p of pages) {
    let url = p.url;
  
    // Adjust URL if not on the home page and URL is not absolute
    url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;
  
    // Create a link element
    const a = document.createElement('a');
    a.href = url;
    a.textContent = p.title;
  
    // Highlight the current page
    a.classList.toggle(
      'current',
      a.host === location.host && a.pathname === location.pathname
    );
  
    // Open external links in a new tab
    a.toggleAttribute('target', a.host !== location.host);
  
    // Add the link to the <nav>
    nav.append(a);
  }