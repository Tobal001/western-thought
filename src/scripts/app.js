// app.js
import philosophyData from './storage/philosophyData.mjs';
import EraList from './ui/uiTimeline.mjs';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Create an instance of your data service.
        const dataService = new philosophyData("western");

        // getData() now returns an array of era objects.
        const eras = await dataService.getData();

        // Select the container where the timeline should be rendered.
        const timelineContainer = document.querySelector('#timeline-container');
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
