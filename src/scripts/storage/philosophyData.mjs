
// scripts/phiosphyData.mjs
export default class philosophyData {
  constructor(category) {
    this.category = category;
    this.path = "/json/western-thought.json";
  }
  async getData() {
    const response = await fetch(this.path);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const data = await response.json();
    // Return the array of philosophy eras directly
    return data.WesternPhilosophy.PhilosophyEra;
  }
  async findDataById(id) {
    const eras = await this.getData();
    // Loop over each era in the PhilosophyEra array.
    for (const era of eras) {
      // If the era itself matches the id, return it.
      if (era.id === id) {
        return era;
      }
      // Check if the era has Branches
      if (era.Branches) {
        for (const branch of era.Branches) {
          // If the branch matches the id, return it.
          if (branch.id === id) {
            return branch;
          }
          // Check if the branch has a thinkers array.
          if (branch.thinkers) {
            for (const thinker of branch.thinkers) {
              if (thinker.id === id) {
                return thinker;
              }
            }
          }
        }
      }
    }
    // If no match is found, return null (or handle as needed).
    return null;
  }

}
