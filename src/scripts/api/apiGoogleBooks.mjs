import { convertToJson } from "../utils/utils.mjs";

//Google Books API key (ensure it's defined in your .env file)
const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

export async function fetchGoogleBooks(author) {
    // First try to search by author using "inauthor:"
    let url = `https://www.googleapis.com/books/v1/volumes?q=inauthor:${encodeURIComponent(author)}&maxResults=3&printType=books`;

    try {
        let response = await fetch(url);
        let data = await convertToJson(response);
        let books = [];

        if (data.items && data.items.length > 0) {
            books = data.items.map(book => ({
                title: book.volumeInfo.title || "No title",
                authors: book.volumeInfo.authors || ["Unknown Author"],
                publishedDate: book.volumeInfo.publishedDate || "Unknown Date",
                link: book.volumeInfo.infoLink || "#",
                preview: book.volumeInfo.previewLink || "#"
            }));
        } else {
            // Fallback: search using the author name as a general query.
            url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(author)}&maxResults=3&printType=books`;
            response = await fetch(url);
            data = await convertToJson(response);

            if (!data.items || data.items.length === 0) {
                console.warn("No books found for", author);
                return [];
            }

            books = data.items.map(book => ({
                title: book.volumeInfo.title || "No title",
                authors: book.volumeInfo.authors || ["Unknown Author"],
                publishedDate: book.volumeInfo.publishedDate || "Unknown Date",
                link: book.volumeInfo.infoLink || "#",
                preview: book.volumeInfo.previewLink || "#"
            }));
        }

        // Deduplicate books based on title (or another unique property)
        const uniqueBooks = books.filter((book, index, self) =>
            index === self.findIndex(b => b.title === book.title)
        );

        return uniqueBooks;
    } catch (error) {
        console.error("Error fetching books:", error);
        return [];
    }
}