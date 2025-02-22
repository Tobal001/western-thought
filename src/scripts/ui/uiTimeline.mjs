import { renderListWithTemplate, qs } from "../utils/utils.mjs";
import { fetchWikiImage, } from "../api/apiWiki.mjs";

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
          </div>
        </div>
      </div>
    </a>
  `;
}




// -----------------------------
// Era Template Functions
// -----------------------------

function timelineTemplate(era) {
  console.log("Rendering era:", era);
  let subContent = "";

  // If the era has branches (sub-eras)
  if (era.Branches && era.Branches.length) {
    subContent = `<ul class="timeline timeline-centered hidden" id="sub-${era.id}"></ul>`;
  }
  // Else if the era has thinkers directly
  else if (era.thinkers && era.thinkers.length) {
    subContent = `
      <div class="era-thinkers hidden" id="sub-${era.id}">
        ${era.thinkers.map(thinkerCardTemplate).join("<br>")}
      </div>
    `;
  }

  return `
    <div class="row" id="${era.id}">
      <div class="title">
        <h2>${era.name}</h2>
        <span class="timeline-dates">${era.dateRange || ""}</span>
         <div class="timeline-content">
          <p>${era.description || ""}</p>
          <button class="view-details container" data-era="${era.id}"> 
            <svg viewBox="0 0 512 512" height="1em" xmlns="http://www.w3.org/2000/svg" class="chevron-down">
              <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"></path>
            </svg>
          </button>
        </div>
      </div>
      <!-- Container for sub-era segments or thinker cards -->
      <div class="">
        ${subContent}
      </div>
    </div>
  `;
}

function subBranchTemplate(subBranch) {
  const thinkerCards = subBranch.thinkers && subBranch.thinkers.length
    ? subBranch.thinkers.map(thinkerCardTemplate).join("<br>")
    : "";

  return `
    <li class="nested-sub-branch" id="${subBranch.id}">
      <h4>${subBranch.name}</h4>
      <div class="sub-branch-thinkers">
        ${thinkerCards}
      </div>
    </li>
  `;
}

// Template for a sub-era segment (branch)
function subEraTemplate(branch) {
  const thinkerCards = branch.thinkers && branch.thinkers.length
    ? branch.thinkers.map(thinkerCardTemplate).join("<br>")
    : "";

  // If this branch has subBranches (e.g., Stoicism, Epicureanism, etc.),
  // render them in a nested section
  let nestedSubBranchesHTML = "";
  if (branch.subBranches && branch.subBranches.length > 0) {
    nestedSubBranchesHTML = `
      <ul class="nested-branches">
        ${branch.subBranches.map(sub => subBranchTemplate(sub)).join("")}
      </ul>
    `;
  }

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
        <!-- Include the nested sub-branches here -->
        ${nestedSubBranchesHTML}
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
          const imageContainer = qs(`#thinker-image-${thinker.id}`);
          if (imageContainer) {
            imageContainer.innerHTML = `<div class="error">Image not available</div>`;
          }
        }
      });
    }
    // If this branch has nested sub-branches, recursively update their images
    if (branch.subBranches && branch.subBranches.length > 0) {
      updateSubEraThinkersImages(branch.subBranches);
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

export default class PhilosophyEras {
  /**
   * @param {Array} eraList - Array of era objects.
   * @param {HTMLElement} timelineContainer - DOM element where eras will be rendered.
   */
  constructor(eras, timelineContainer, dataSource) {
    this.eras = ensureDateRange(eras);
    this.timelineContainer = timelineContainer;
    this.dataSource = dataSource;
    this.philosophyData = null;
  }

  async init() {
    try {
      const list = await this.dataSource.getData(this.eras);
      if (!list) {
        throw new Error("No data received from server");
      }
      this.renderList();
      this.setupViewDetailsListener();
    } catch (error) {
      console.error("Error in init:", error);
      if (this.timelineContainer) {
        this.timelineContainer.innerHTML = `<li class="error">Error loading Philosphy Eras. Please try again later.</li>`;
      }
    }
  }

  renderList() {
    // Render each era using timelineTemplate.
    renderListWithTemplate(
      timelineTemplate,
      this.timelineContainer,
      this.eras,
      "beforeend",
      true
    );

    // For each era that has Branches, render sub-era segments and update thinker images.
    this.eras.forEach((era) => {
      const branches = era.Branches || era.subBranches;
      if (branches && branches.length) {
        this.renderSubEraList(branches, era.id);
        updateSubEraThinkersImages(branches);
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
    this.timelineContainer.addEventListener("click", (event) => {
      const button = event.target.closest(".view-details");
      if (button) {
        // Toggle the "active" class to rotate the chevron
        button.classList.toggle("active");

        // Use the data-era attribute to find the associated sub-era container
        const eraId = button.dataset.era;
        const subEraContainer = qs(`#sub-${eraId}`);
        if (subEraContainer) {
          subEraContainer.classList.toggle("hidden");
        }
      }
    });
  }

  navigateToDetailsPage() {
    this.timelineContainer.addEventListener("click", (event) => {
      // Use closest() to catch clicks even if a nested element is clicked
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
  }

  handleBreadcrumbs() {
    const breadcrumbsElement = document.querySelector("#breadcrumbs");
    if (breadcrumbsElement) {
      breadcrumbsElement.innerHTML = `<span class="path">Western Philosophy</span> <span class="arrow">&gt;</span> <span class="path">(${this.eraList.length} eras)</span>`;
    }
  }



}

