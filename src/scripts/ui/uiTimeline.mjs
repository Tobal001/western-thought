import { renderListWithTemplate, qs } from "../utils/utils.mjs";
import { fetchWikiImage } from "../api/apiWiki.mjs";

// -----------------------------
// Thinker Template Functions (for sub-era segments only)
// -----------------------------

// Generates a simple thinker link (for the main timeline)

// Generates a full thinker card (for sub-era segments)
function thinkerCardTemplate(thinker) {
  return `
    <a href="/details-page/index.html?id=${thinker.id}&type=thinkers" class="thinker-link">
      <div class="card">
        <div class="card-text">
          <!-- Placeholder for the thinker's image -->
          <div class="thinker-img" id="thinker-image-${thinker.id}"></div>
          <div class="title-total">   
            <div class="title">${thinker.lived || ""}</div>
            <h2>${thinker.name}</h2>
            <div class="desc">${thinker.note || ""}</div>
            <div class="actions">
              <button><i class="far fa-heart"></i></button>
            </div>
          </div>
        </div>
      </div>
    </a>
  `;
}


// -----------------------------
// Era Template Functions
// -----------------------------

// Template for a main era timeline segment (without a simple list of key thinkers)
function timelineTemplate(era) {
  console.log("Rendering era:", era);
  return `
    <div class="row example-basic" id="${era.id}">
      <div class="col-md-12 example-title">
        <h2>${era.name}</h2>
        <span class="timeline-dates">${era.dateRange || ""}</span>
         <div class="timeline-content">
          <p>${era.description || ""}</p>
          <button class="view-details" data-era="${era.id}">View Details</button>
        </div>
      </div>
      <!-- Container for sub-era segments -->
      <div class="col-xs-10 col-xs-offset-1 col-sm-8 col-sm-offset-2">
        <ul class="timeline timeline-centered hidden" id="sub-${era.id}"></ul>
      </div>
    </div>
  `;
}

// Template for a sub-era segment (branch)
function subEraTemplate(branch) {
  // Use thinkerCardTemplate to generate a full card for each thinker in this branch.
  const thinkerCards = branch.thinkers && branch.thinkers.length
    ? branch.thinkers.map(thinkerCardTemplate).join("<br>")
    : "";
  return `
    <li class="timeline-item" id="${branch.id}">
      <div class="timeline-info">
        <span>${branch.timeframe || ""}</span>
      </div>
      <div class="timeline-marker"></div>
      <div class="timeline-content">
        <h3 class="timeline-title">${branch.name}</h3>
        <p>${branch.description || ""}</p>
        <!-- Container for Thinkers -->
        <div class="sub-era-thinkers">
          <h4>Key Thinkers:</h4>
          ${thinkerCards}
        </div>
      </div>
    </li>
  `;
}

// -----------------------------
// Image Updater
// -----------------------------

// Updates the background images for thinker cards (used in sub-era segments)
async function updateSubEraThinkersImages(branchList) {
  branchList.forEach((branch) => {
    if (branch.thinkers) {
      branch.thinkers.forEach(async (thinker) => {
        try {
          // Fetch the image URL using the thinker's name.
          const imageUrl = await fetchWikiImage(thinker.name);
          // Select the placeholder container for this thinker.
          const imageContainer = qs(`#thinker-image-${thinker.id}`);
          if (imageContainer) {
            imageContainer.classList.add('thinker-img');
            imageContainer.style.backgroundImage = `url(${imageUrl})`;
          }
        } catch (error) {
          console.error(`Error fetching image for ${thinker.name}:`, error);
          const imageContainer = qs(`#thinker-image-${thinker.id}`);
          if (imageContainer) {
            imageContainer.innerHTML = `<div class="error">Image not available</div>`;
          }
        }
      });
    }
  });
}

// -----------------------------
// Helper Function
// -----------------------------

function ensureDateRange(eraList) {
  return eraList.map((era) => {
    if (!era.dateRange && era.startYear && era.endYear) {
      era.dateRange = `${era.startYear} - ${era.endYear}`;
    }
    return era;
  });
}

// -----------------------------
// EraList Class
// -----------------------------

export default class EraList {
  /**
   * @param {Array} eraList - Array of era objects.
   * @param {HTMLElement} containerEl - DOM element where eras will be rendered.
   */
  constructor(eraList, containerEl) {
    this.eraList = ensureDateRange(eraList);
    this.containerEl = containerEl;
  }

  init() {
    if (!this.eraList || !this.eraList.length) {
      this.containerEl.innerHTML = `<li class="error">No eras found</li>`;
      return;
    }
    this.renderList();
    this.handleBreadcrumbs();
    this.setupViewDetailsListener();
  }

  renderList() {
    // Render each era using timelineTemplate.
    renderListWithTemplate(
      timelineTemplate,
      this.containerEl,
      this.eraList,
      "beforeend",
      true
    );
    // For each era that has Branches, render sub-era segments and update thinker images.
    this.eraList.forEach((era) => {
      if (era.Branches && era.Branches.length) {
        this.renderSubEraList(era.Branches, era.id);
        updateSubEraThinkersImages(era.Branches);
      }
    });
  }

  renderSubEraList(branchList, parentEraId) {
    const subEraContainer = qs(`#sub-${parentEraId}`);
    if (subEraContainer) {
      renderListWithTemplate(
        subEraTemplate,
        subEraContainer,
        branchList,
        "beforeend",
        true
      );
    }
  }

  setupViewDetailsListener() {
    this.containerEl.addEventListener("click", (event) => {
      const button = event.target.closest(".view-details");
      if (button) {
        const eraId = button.dataset.era;
        const subEraContainer = qs(`#sub-${eraId}`);
        if (subEraContainer) {
          subEraContainer.classList.toggle("hidden");
        }
      }
    });
  }

  handleBreadcrumbs() {
    const breadcrumbsElement = document.querySelector("#breadcrumbs");
    if (breadcrumbsElement) {
      breadcrumbsElement.innerHTML = `<span class="path">Western Philosophy</span> <span class="arrow">&gt;</span> <span class="path">(${this.eraList.length} eras)</span>`;
    }
  }
}

