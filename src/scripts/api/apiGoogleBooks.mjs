import { convertToJson } from "../utils/domHelpers.mjs"
//Google books API key
const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

async function fetchGoogleBooks() {
    //Breakdown of URL parameters:
    //  q=inauthor:       -> Searches books author
    //  maxResults:       -> Limits results to given amount
    //  printType=books:  -> Ensures we only get books
    const url = `https://www.googleapis.com/books/v1/volumes?q=inauthor:Plato&maxResults=3&printType=books`

    try {
        const response = await fetch(url);
        const data = await convertToJson(response);

        //extract relevant book info
        const books = data.items.map(book => ({
            title: book.volumeInfo.title || "No title",
            authors: book.volumeInfo.authors || ["Uknown Author"],
            publishedDate: book.volumeInfo.publishedDate || "Unknown Date",
            link: book.volumeInfo.infoLink || "#",
            preview: book.volumeInfo.previewLink || "#"
        }));

        return books;
    } catch (error) {
        console.error("Error fetching books:", error);
    }
}

export async function testFetchGBooks() {
    try {
        const books = await fetchGoogleBooks();
        console.log("Top 3 Plato Books:", books)
    } catch (error) {
        console.error("Test failed:", error);
    }
}