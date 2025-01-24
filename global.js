console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// Automatically log nav links on every page
const navLinks = $$('#nav a');
console.log('Navigation Links:', navLinks);