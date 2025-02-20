//apiWiki.mjs
import { convertToJson } from "../utils/utils.mjs";
// Base URL for the English Wikipedia MediaWiki API
const WIKI_API_URL = "https://en.wikipedia.org/w/api.php";

//functions to fetch data from Wikipedia 
export async function fetchWikiData(title) {
    // Breakdown of URL parameters:
    //   action=query    -> We'll query data
    //   prop=extracts   -> We want the page extract (intro summary)
    //   titles={name}   -> The page title we're querying
    //   exintro=1       -> Only the intro paragraph
    //   explaintext=1   -> Return it as plain text (no HTML tags)
    //   format=json     -> JSON response
    //   origin=*        -> Needed for CORS in client-side fetch requests
    const url = `${WIKI_API_URL}?action=query&prop=extracts&titles=${title}&exintro=1&explaintext=1&format=json&origin=*`;

    try {
        // Makes the request and parses JSON response
        const response = await fetch(url);
        const data = await convertToJson(response);

        // Access nested object data
        const pages = data?.query?.pages;
        const pageId = Object.keys(pages)[0]; // Get the first page ID
        const page = pages[pageId]; // Access the actual page data
        const summary = page.extract || "No summary available.";

        return summary; // Return the summary text
    } catch (error) {
        console.error("Error fetching Wikipedia data:", error);
        throw error;
    }
}

// In apiWiki.mjs
export async function fetchWikiImage(title) {
    const url = `${WIKI_API_URL}?action=query&prop=pageimages&titles=${title}&format=json&pithumbsize=200&origin=*`;



    try {
        const response = await fetch(url);
        const data = await response.json();

        const pages = data?.query?.pages;
        const pageId = Object.keys(pages)[0];
        const page = pages[pageId];
    

        if (page && page.thumbnail && page.thumbnail.source) {
            return page.thumbnail.source;
        } else {
            throw new Error("No image available for this title.");
        }
    } catch (error) {
        console.error("Error fetching Wikipedia image:", error);
        throw error;
    }
}

// Update showWikiImage so it passes the title:
export async function showWikiImage(title) {
    try {
        const imageUrl = await fetchWikiImage(title);
        return `<img src="${imageUrl}" alt="${title} image" />`;
    } catch (error) {
        console.error("Error showing Wikipedia image:", error);
        return `<div class="error">Image not available</div>`;
    }
}


export async function testFetch() {
    try {
        const summary = await fetchWikiData();
        console.log("Summary of Plato:", summary); // Logs the fetched summary
    } catch (error) {
        console.error("Test failed:", error);
    }
}


export async function testWikidata() {
    const entity = await fetchWikidataEntity("Q36303");
    console.log("Entity data:", entity);
  
    const works = await fetchNotableWorks("Q12345");
    console.log("Notable works:", works);
  
    // If you want to get books written by this author using SPARQL:
    const books = await fetchBooksByAuthor("Q12345");
    console.log("Books by author:", books);
  }
  




