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
        // Render a list of books if available.
        const booksSection = books.length
        ? `
          <div id="detail-books">
            <h3>Related Books</h3>
            <ul>
              ${books
                .map(book => `
                  <li>
                    <a href="${book.link}" target="_blank">${book.title}</a>
                    <br>
                    <small>By: ${book.authors.join(", ")} (${book.publishedDate})</small>
                  </li>
                `)
                .join("")}
            </ul>
          </div>`
        : "";
    
        return `
          <div class="detail-page">
            <h1 id="detail-title">${item.name}</h1>
            <div id="detail-photo">
              ${wikiPhotoUrl
                ? `<img src="${wikiPhotoUrl}" alt="${item.name} photo">`
                : `<div class="no-photo">Photo not available</div>`
              }
            </div>
            <div id="detail-summary">
              ${item.description
                ? `<p>${item.description}</p>`
                : wikiSummary
                    ? `<p>${wikiSummary}</p>`
                    : `<p>Summary not available</p>`
              }
            </div>
            ${booksSection}
        `;
      }
}
