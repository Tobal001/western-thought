// scripts/app.js
import EraList from './ui/uiTimeline.mjs';
import ExternalServices from './storage/externalServices.mjs';

document.addEventListener('DOMContentLoaded', async () => {
    // Create an instance of ExternalServices.
    // In this example, the base URL is assumed to be the project root.
    const externalServices = new ExternalServices();

    try {
        // Fetch the philosophy data
        const data = await externalServices.getPhilosophyData();
        const westernPhilosophy = data.WesternPhilosophy;

        // Convert the WesternPhilosophy object into an array of eras
        const eras = Object.values(westernPhilosophy);

        // Adjust each era object (for example, add a dateRange property)
        eras.forEach(era => {
            // Ensure that era.startYear and era.endYear exist in your JSON data.
            era.dateRange = `${era.startYear} - ${era.endYear}`;
        });

        // Select the container element where timeline segments will be rendered.
        const timelineContainer = document.querySelector('#timelineContainer');
        if (!timelineContainer) {
            throw new Error("Timeline container element not found in HTML.");
        }

        // Create an instance of EraList and initialize it
        const eraListInstance = new EraList(eras, timelineContainer);
        eraListInstance.init();

    } catch (error) {
        console.error("Error initializing the app:", error);
        const timelineContainer = document.querySelector('#timelineContainer');
        if (timelineContainer) {
            timelineContainer.innerHTML = `<p>Error loading data. Please try again later.</p>`;
        }
    }
});
