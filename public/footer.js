/**
 * footer.js — Dynamic Apple-style footer sitemap builder.
 * Reads /pages.json and distributes links across columns.
 * Just add new entries to pages.json and the footer auto-expands.
 */
(function () {
  'use strict';

  // ── Column definitions ─────────────────────────────────────────────────────
  // Each column maps a heading to an array of page "title" strings from pages.json.
  // To add a new column/page: edit pages.json and add the title to a column below.
  const COLUMNS = [
    {
      heading: 'Shop',
      pages: ['Shop All', "Men's Collection", "Women's Collection"],
    },
    {
      heading: 'Discover',
      pages: ['Home', 'Offers', 'About'],
    },
    {
      heading: 'Support',
      pages: ['Contact', 'Profile'],
    },
    {
      heading: 'Legal',
      // These are static — not in pages.json
      static: [
        { title: 'Privacy Policy', href: '#' },
        { title: 'Terms of Use', href: '#' },
        { title: 'Cookie Settings', href: '#' },
        { title: 'Accessibility', href: '#' },
      ],
    },
  ];

  /**
   * Fetch pages.json, build the sitemap, and wire nav links to the SPA router.
   */
  async function buildFooter() {
    const nav = document.getElementById('footerSiteMap');
    if (!nav) return;

    // Fetch the dynamic page list
    let pages = [];
    try {
      const res = await fetch('/pages.json');
      if (res.ok) pages = await res.json();
    } catch (_) {
      // If fetch fails (e.g. file:// protocol), fall back gracefully
      console.warn('[footer.js] Could not load pages.json — using fallback links.');
    }

    // Build a lookup map: title → page object
    const pageMap = {};
    pages.forEach((p) => {
      pageMap[p.title] = p;
    });

    // Create one column per definition
    COLUMNS.forEach((col) => {
      const section = document.createElement('div');
      section.className = 'footer-col';

      const heading = document.createElement('h4');
      heading.className = 'footer-col-heading';
      heading.textContent = col.heading;
      section.appendChild(heading);

      const list = document.createElement('ul');
      list.className = 'footer-col-list';

      if (col.static) {
        // Render static links (e.g. Legal column)
        col.static.forEach((item) => {
          list.appendChild(makeListItem(item.title, item.href, null));
        });
      } else {
        // Render dynamic links from pages.json
        col.pages.forEach((title) => {
          const page = pageMap[title];
          if (page) {
            list.appendChild(makeListItem(page.title, page.href, page.dataGender || null));
          }
        });

        // Auto-append any NEW pages from pages.json not already listed in any column
        // (so every new entry shows up in an "Extras" overflow at the bottom of the last column)
      }

      section.appendChild(list);
      nav.appendChild(section);
    });

    // Append any unlisted pages from pages.json into an "Extras" column automatically
    const listedTitles = new Set(COLUMNS.flatMap((c) => c.pages || []));
    const extras = pages.filter((p) => !listedTitles.has(p.title));

    if (extras.length > 0) {
      const section = document.createElement('div');
      section.className = 'footer-col';

      const heading = document.createElement('h4');
      heading.className = 'footer-col-heading';
      heading.textContent = 'More';
      section.appendChild(heading);

      const list = document.createElement('ul');
      list.className = 'footer-col-list';
      extras.forEach((p) => {
        list.appendChild(makeListItem(p.title, p.href, p.dataGender || null));
      });
      section.appendChild(list);
      nav.appendChild(section);
    }

    // Wire footer links into the SPA nav system (same as header nav links)
    wireFooterLinks();
  }

  /**
   * Create a <li><a> element for the sitemap list.
   */
  function makeListItem(title, href, dataGender) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = href || '#';
    a.textContent = title;
    a.className = 'footer-nav-link';
    if (dataGender) a.dataset.gender = dataGender;
    li.appendChild(a);
    return li;
  }

  /**
   * Hook footer links into the existing SPA router.
   * Mirrors how header nav-links work in app.js.
   */
  function wireFooterLinks() {
    const nav = document.getElementById('footerSiteMap');
    if (!nav) return;

    nav.querySelectorAll('.footer-nav-link').forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;

        const page = href.slice(1); // strip '#'
        if (page === 'products') {
          // Respect data-gender filtering
          const gender = link.dataset.gender;
          const matchingNavLink = document.querySelector(
            gender
              ? `.nav-link[data-page="products"][data-gender="${gender}"]`
              : '.nav-link[data-page="products"]'
          );
          if (matchingNavLink) {
            e.preventDefault();
            matchingNavLink.click();
          }
        } else {
          const matchingNavLink = document.querySelector(`.nav-link[data-page="${page}"]`);
          if (matchingNavLink) {
            e.preventDefault();
            matchingNavLink.click();
          }
        }
      });
    });
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildFooter);
  } else {
    buildFooter();
  }
})();
