// app.js
import philosophyData from "./storage/philosophyData.mjs";
import PhilosophyEras from "./ui/uiTimeline.mjs";


const dataService = new philosophyData("western");
const timelineContainer = document.getElementById("timeline-container")
const eras = dataService.getData();

const timeline = new PhilosophyEras(eras, timelineContainer, dataService)
timeline.init();