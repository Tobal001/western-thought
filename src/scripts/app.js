// app.js
import philosophyData from './storage/philosophyData.mjs';
import EraList from './ui/uiTimeline.mjs';

const timelineContainer = document.querySelector('#timeline-container');

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Create an instance of your data service.
        const dataService = new philosophyData("western");

        // getData() now returns an array of era objects.
        const eras = await dataService.getData();

        // Select the container where the timeline should be rendered.
        if (!timelineContainer) {
            throw new Error('Timeline container not found in the DOM.');
        }

        // Create an EraList instance using the fetched data.
        const eraList = new EraList(eras, timelineContainer);
        eraList.init();
    } catch (error) {
        console.error('Error initializing the app:', error);
    }
});

timelineContainer.addEventListener("click", (event) => {
    // Use closest() to catch clicks even if a nested element is clicked
    const eraLink = event.target.closest(".era-link");
    const subEraLink = event.target.closest(".subera-link");
    const thinkerLink = event.target.closest(".thinker-link");

    if (eraLink) {
        event.preventDefault();
        // For example, navigate to the details page or do something else
        const url = eraLink.getAttribute("href");
        console.log("Era clicked, navigating to:", url);
        window.location.href = url;
    } else if (subEraLink) {
        event.preventDefault();
        const url = subEraLink.getAttribute("href");
        console.log("Sub-era clicked, navigating to:", url);
        window.location.href = url;
    } else if (thinkerLink) {
        event.preventDefault();
        const url = thinkerLink.getAttribute("href");
        console.log("Thinker clicked, navigating to:", url);
        window.location.href = url;
    }
});
