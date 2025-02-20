import { convertToJson } from "../utils/utils.mjs";
// scripts/externalServices.js
export default class philosophyData {
  constructor(category) {
    this.category = category;
    this.path = "../json/western-thought.json";
  }
  async getData() {

    const response = await fetch(this.path);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const data = await response.json();

    return Object.values(data.WesternPhilosophy)
  }
  async findDataById(id) {
    const data = await this.getData();
    return data.find((item) => item.id === id);
  }
}
