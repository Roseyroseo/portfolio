console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// Automatically log nav links on every page
const navLinks = $$('#nav a');
console.log('Navigation Links:', navLinks);

// Find the link to the current page
const currentLink = navLinks.find(
    (a) => a.host === location.host && a.pathname === location.pathname);

// Add the 'current' class to the matching link
currentLink?.classList.add('current'); // Safely add the class if the link exists