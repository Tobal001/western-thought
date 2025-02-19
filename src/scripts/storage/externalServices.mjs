// scripts/externalServices.js
export default class ExternalServices {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async getPhilosophyData() {
    try {
      // Adjust the URL if needed. Here we assume your JSON file is at /json/western-thought.json.
      const response = await fetch(`${this.baseURL}json/western-thought.json`);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to load philosophy data:', error);
      throw error;
    }
  }
}
