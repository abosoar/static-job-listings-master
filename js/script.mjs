import { Job } from "./Job.mjs";
const stateData = {
  jobData: [],
  filteredJobs: [],
  filters: new Set(),
};
const stateHandler = {
  set(target, property, value) {
    target[property] = value;
    switch (property) {
      case "jobData":
        target[property] = value;
        target["filteredJobs"] = value;
        initializePage();
        break;
      case "filters":
        filterJobs();
        updateFilters();
        updateJobs();
        break;
      case "addedFilter":
        target["filters"].add(value);
        filterJobs();
        updateFilters();
        updateJobs();
        break;
      case "removedFilter":
        target["filters"].delete(value);
        updateFilters();
        filterJobs();
        updateJobs();
        break;
      case "filteredJobs":
        target[property] = value;
        updateJobs();
        break;
      default:
        break;
    }
    return true;
  },
};
const appStateProxy = new Proxy(stateData, stateHandler);
const elements = {
  jobsContainer: document.querySelector(".jobs-container"),
  jobTemplate: document.querySelector("#job-template"),
  filtersPanel: document.querySelector(".filters-panel"),
  filtersContainer: document.querySelector(".filters"),
  filtersClear: document.querySelector(".clear-filters"),
};

fetch("./data.json")
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    const jobData = data;

    appStateProxy.jobData = jobData.map((job) => new Job(job));
  });
function initializePage() {
  elements.filtersClear.addEventListener("click", () => {
    appStateProxy.filters = new Set([]);
  });
  updateJobs();
}
function updateFilters() {
  elements.filtersContainer.innerHTML = "";

  if (appStateProxy.filters.size === 0) {
    elements.filtersPanel.classList.add("hidden");
  } else {
    elements.filtersPanel.classList.remove("hidden");
    appStateProxy.filters.forEach((filter) => {
      const filterEl = createFilterEl(filter);
      elements.filtersContainer.appendChild(filterEl);
    });
    elements.filtersContainer.appendChild(elements.filtersClear);

  }
}
function createFilterEl(filterText) {
  const filterEl = document.createElement("div");
  filterEl.classList.add("filter");
  const filterNameEl = document.createElement("div");
  filterNameEl.classList.add("filter-name");
  filterNameEl.textContent = filterText;
  const filterDeleteEl = document.createElement("div");
  filterDeleteEl.classList.add("filter-delete");
  filterDeleteEl.innerHTML = '<i class="ph-bold ph-x close-icon"></i>';
  filterDeleteEl.addEventListener("click", () => {
    appStateProxy.filters = appStateProxy.filters.difference(
      new Set([filterText])
    );
    console.log(appStateProxy.filters);
  });
  filterEl.appendChild(filterNameEl);
  filterEl.appendChild(filterDeleteEl);
  return filterEl;
}
function updateJobs() {
  const jobTemplate = elements.jobTemplate;
  elements.jobsContainer.innerHTML = "";
  appStateProxy.filteredJobs.forEach((job) => {
    const jobClone = document.importNode(jobTemplate.content, true);
    if (job.featured) {
      jobClone.querySelector(".job").classList.add("featured");
    }
    jobClone.querySelector(".company-logo").src = job.logo;
    jobClone.querySelector(".company-logo").alt = `${job.company} logo`;
    if (job.new) {
      jobClone.querySelector(".badge-new").classList.remove("hidden");
    }
    if (job.featured) {
      jobClone.querySelector(".badge-featured").classList.remove("hidden");
    }
    jobClone.querySelector(".company").textContent = job.company;
    jobClone.querySelector(".position").textContent = job.position;
    jobClone.querySelector(".posted-at").textContent = job.postedAt;
    jobClone.querySelector(".contract").textContent = job.contract;
    jobClone.querySelector(".location").textContent = job.location;
    const tagsContainer = jobClone.querySelector(".tags");
    job.tags.forEach((tag) => {
      const tagElement = document.createElement("span");
      tagElement.classList.add("tag");
      if(appStateProxy.filters.has(tag)){
        tagElement.classList.add("tag-selected");
      }
      tagElement.id = tag;
      tagElement.textContent = tag;
      tagElement.addEventListener("click", () => {
        if (appStateProxy.filters.has(tag)) {
          appStateProxy.removedFilter = tag;
        } else {
          appStateProxy.addedFilter = tag;
        }
      });
      tagsContainer.appendChild(tagElement);
    });
    elements.jobsContainer.appendChild(jobClone);
  });
  elements.jobsContainer.appendChild(jobTemplate);
}
function filterJobs() {
  appStateProxy.filteredJobs = appStateProxy.jobData.filter((job) => {
    const jobTags = new Set(job.tags);
    const logic =
      jobTags.intersection(appStateProxy.filters).size >=
      appStateProxy.filters.size;
    return logic;
  });
}
