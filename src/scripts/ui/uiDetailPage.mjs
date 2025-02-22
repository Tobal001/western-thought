import { fetchWikiData, fetchWikiImage } from "../api/apiWiki.mjs";
import { fetchGoogleBooks } from "../api/apiGoogleBooks.mjs";

export class pageDetails {
  /**
   * @param {string} philosophyType - The type of philosophy (if needed).
   * @param {string} philosophyId - The id of the philosophy object.
   * @param {object} dataSource - The data source to retrieve details.
   */
  constructor(philosophyType, philosophyId, dataSource) {
    this.philosophyId = philosophyId;
    this.philosophyType = philosophyType;
    this.dataSource = dataSource;
    this.philosophyData = null; // will hold the retrieved object
  }

  async init() {
    // Retrieve details using the ID and store the object in a new property
    this.philosophyData = await this.dataSource.findDataById(this.philosophyId);

    if (!this.philosophyData) {
      console.error("No item found with ID:", this.philosophyId);
      return;
    }

    // Use the item's name as the title to fetch Wikipedia data
    const wikiTitle = this.philosophyData.name;

    // Fetch Wiki summary and image using the API functions
    let wikiSummary = "";
    let wikiPhotoUrl = "";
    try {
      wikiSummary = await fetchWikiData(wikiTitle);
    } catch (error) {
      console.error("Error fetching wiki summary:", error);
    }
    try {
      wikiPhotoUrl = await fetchWikiImage(wikiTitle);
    } catch (error) {
      console.error("Error fetching wiki image:", error);
    }

    // If the page represents a thinker, fetch related books.
    let books = [];
    if (this.philosophyType === "thinkers") {
      try {
        books = await fetchGoogleBooks(wikiTitle);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    }

    // Render the HTML using the retrieved data from your data source and Wiki API
    const html = this.renderDetailTemplate(this.philosophyData, wikiPhotoUrl, wikiSummary, books);
    document.getElementById("detail-container").innerHTML = html;
  }

  renderDetailTemplate(item, wikiPhotoUrl, wikiSummary, books) {
    const booksSection = books.length
      ? `
          <div class="detail-books">
            <h3>Related Books</h3>
            <ul>
              ${books
        .map(
          (book) => `
                <li>
                  <a href="${book.link}" target="_blank">${book.title}</a><br>
                  <small>By: ${book.authors.join(", ")} (${book.publishedDate})</small>
                </li>
              `
        )
        .join("")}
            </ul>
          </div>`
      : "";

    // Breadcrumbs that will span the full top row of the detail page
    const breadcrumbs = `
        <nav class="breadcrumbs">
          <a href="/">Home</a>
          <span class="divider">/</span>
          <a href="/timeline.html">Timeline</a>
          <span class="divider">/</span>
          <span>${item.name}</span>
        </nav>
      `;

    // Sidebar content (adjust fields as needed)
    const sidebarContent = `
        <div class="sidebar-section">
          <strong>Born:</strong> ${item.born || "Unknown"}
        </div>
        <div class="sidebar-section">
          <strong>Died:</strong> ${item.died || "Unknown"}
        </div>
        <div class="sidebar-section">
          <strong>School:</strong> ${item.school || "N/A"}
        </div>
      `;

    return `
        <div class="detail-page">
          ${breadcrumbs}
          <h1 class="detail-title">${item.name}</h1>
          <div class="detail-content">

          <!-- Sidebar Content -->
            <!-- Main Content -->
            <div class="detail-main">
              
              <div class="detail-top">
                           <div class="detail-sidebar">
               <div id="detail-photo">
                ${wikiPhotoUrl
        ? `<img src="${wikiPhotoUrl}" alt="${item.name} photo">`
        : `<div class="no-photo">Photo not available</div>`
      }
              </div>
              ${sidebarContent}
              ${booksSection}
            </div>
            </div>
                <div id="detail-summary">
                  ${item.description
        ? `<p>${item.description}</p>`
        : wikiSummary
          ? `<p>${wikiSummary}</p>`
          : `<p>Summary not available</p>`
      }
                </div>
              </div>
  
          </div>
        </div>
      `;
  }

}
