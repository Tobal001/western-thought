// Base URL for the English Wikipedia MediaWiki API
const baseUrl = "https://en.wikipedia.org/w/api.php";

function convertToJson(res) {
    if (res.ok) {
        return res.json();
    } else {
        throw new Error("Bad Response");
    }
}

//functions to fetch data from Wikipedia 
async function fetchWikiData(title) {
    // API parameters:
    //   action=query    -> We'll query data
    //   prop=extracts   -> We want the page extract (intro summary)
    //   titles={name}   -> The page title we're querying
    //   exintro=1       -> Only the intro paragraph
    //   explaintext=1   -> Return it as plain text (no HTML tags)
    //   format=json     -> JSON response
    //   origin=*        -> Needed for CORS in client-side fetch requests
    const url = `${baseUrl}?action=query&prop=extracts&titles=${title}&exintro=1&explaintext=1&format=json&origin=*`;

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

export async function testFetch() {
    try {
        const summary = await fetchWikiData();
        console.log("Summary of Plato:", summary); // Logs the fetched summary
    } catch (error) {
        console.error("Test failed:", error);
    }
}

