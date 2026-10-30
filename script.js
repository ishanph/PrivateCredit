const fileInput = document.getElementById("file-input");
const dropzone = document.getElementById("dropzone");
const selectedFile = document.getElementById("selected-file");
const filesPending = document.getElementById("files-pending");
const systemStatus = document.getElementById("system-status");
const summarizeButton = document.getElementById("summarize-button");
const verifyButton = document.getElementById("verify-button");
const draftButton = document.getElementById("draft-button");
const jsonOutput = document.getElementById("json-output");
const jsonBadge = document.getElementById("json-badge");
const repoTrigger = document.getElementById("repo-trigger");
const repoMenu = document.getElementById("repo-menu");
const repoOptions = Array.from(document.querySelectorAll(".repo-option"));
const selectedRepositoryName = document.getElementById("selected-repository-name");
const repositoryScopeList = document.getElementById("repository-scope-list");
const dashboardGrid = document.getElementById("dashboard-grid");
const viewTriggers = Array.from(document.querySelectorAll("[data-view-trigger]"));
const appViews = Array.from(document.querySelectorAll(".app-view"));
const jsonModal = document.getElementById("json-modal");
const jsonModalTitle = document.getElementById("json-modal-title");
const jsonModalContent = document.getElementById("json-modal-content");
const jsonModalClose = document.getElementById("json-modal-close");
const modelSelect = document.getElementById("model-select");
const templateSelect = document.getElementById("template-select");
const llmCommandInput = document.getElementById("llm-command-input");
const llmCommandRun = document.getElementById("llm-command-run");
const llmResponseOutput = document.getElementById("llm-response-output");
const templateFileInput = document.getElementById("template-file-input");
const templateUploadStatus = document.getElementById("template-upload-status");
const templateLibrary = document.getElementById("template-library");
const templateCountChip = document.getElementById("template-count-chip");
const templateModal = document.getElementById("template-modal");
const templateModalClose = document.getElementById("template-modal-close");
const templateModalCancel = document.getElementById("template-modal-cancel");
const templateModalSave = document.getElementById("template-modal-save");
const templateNameInput = document.getElementById("template-name-input");
const templateRegionInput = document.getElementById("template-region-input");

let currentFile = null;
let outputState = "empty";
let selectedRepository = "Korea/Jason";
let activeView = "portal";
let selectedModel = "General";
let selectedTemplate = "Korea_v6";
let editingTemplateId = null;
let selectedLlmModel = "openrouter/free";
let uploadedDocumentContext = {
  fileName: "",
  mimeType: "",
  extractedText: "",
  extractionStatus: "No document uploaded",
  pageCount: 0
};

const repositoryAccess = {
  Korea: ["/Korea", "/Korea/Jason", "/Korea/Skye"],
  "Korea/Jason": ["/Korea", "/Korea/Jason"],
  "Korea/Skye": ["/Korea", "/Korea/Skye"],
  India: ["/India", "/India/Ishan"],
  "India/Ishan": ["/India", "/India/Ishan"]
};

const dashboardOutputs = [
  {
    user: "Jason",
    region: "Korea",
    entries: [
      {
        company: "Korea_Company_2",
        status: "reviewed",
        summary:
          "Senior secured opportunity with recurring cash generation, moderate leverage, and covenant headroom after sponsor equity support.",
        pdfName: "korea_company_2_jason_review.pdf",
        json: {
          company: "Korea_Company_2",
          analyst: "Jason",
          revenue_mn: 228,
          ebitda_mn: 41,
          net_debt_mn: 132,
          leverage: "3.2x",
          interest_coverage: "2.8x",
          proposed_facility: "USD 95m senior secured loan",
          risk_rating: "BB",
          review_status: "reviewed"
        }
      },
      {
        company: "Korea_Company_5",
        status: "summary",
        summary:
          "Export-heavy manufacturer with stable backlog and acceptable FX sensitivity; margin resilience remains the main underwriting watchpoint.",
        pdfName: "korea_company_5_jason_summary.pdf",
        json: {
          company: "Korea_Company_5",
          analyst: "Jason",
          revenue_mn: 314,
          ebitda_margin: "16.4%",
          free_cash_flow_mn: 22,
          ltv: 0.61,
          covenant_headroom: "18%",
          liquidity_months: 14,
          review_status: "summary_generated"
        }
      }
    ]
  },
  {
    user: "Skye",
    region: "Korea",
    entries: [
      {
        company: "Korea_Company_3",
        status: "reviewed",
        summary:
          "Business services credit with sponsor backing, strong retention metrics, and a clean first-lien collateral package.",
        pdfName: "korea_company_3_skye_review.pdf",
        json: {
          company: "Korea_Company_3",
          analyst: "Skye",
          recurring_revenue_pct: "74%",
          ebitda_mn: 28,
          gross_leverage: "4.0x",
          interest_coverage: "2.3x",
          margin_bps: 725,
          collateral: ["share pledge", "accounts charge"],
          review_status: "verified"
        }
      },
      {
        company: "Korea_Company_7",
        status: "summary",
        summary:
          "Healthcare services platform with predictable volumes and decent deleveraging trajectory, though expansion capex needs monitoring.",
        pdfName: "korea_company_7_skye_summary.pdf",
        json: {
          company: "Korea_Company_7",
          analyst: "Skye",
          revenue_mn: 186,
          ebitda_mn: 33,
          capex_mn: 11,
          net_leverage: "3.6x",
          dscr: "1.9x",
          confidence: 0.94,
          review_status: "summary_generated"
        }
      }
    ]
  },
  {
    user: "Ishan",
    region: "India",
    entries: [
      {
        company: "India_Company_1",
        status: "reviewed",
        summary:
          "Logistics platform benefiting from domestic network scale, with moderate leverage and improving cash conversion in the latest quarter.",
        pdfName: "india_company_1_ishan_review.pdf",
        json: {
          company: "India_Company_1",
          analyst: "Ishan",
          revenue_mn: 205,
          ebitda_mn: 29,
          net_debt_mn: 88,
          leverage: "3.0x",
          working_capital_days: 37,
          irr_case: "15.2%",
          review_status: "reviewed"
        }
      },
      {
        company: "India_Company_4",
        status: "summary",
        summary:
          "Mid-market industrial borrower with visible receivables support and room for margin uplift post-procurement optimization.",
        pdfName: "india_company_4_ishan_summary.pdf",
        json: {
          company: "India_Company_4",
          analyst: "Ishan",
          revenue_mn: 142,
          ebitda_margin: "13.1%",
          receivables_turnover: "8.6x",
          ltv: 0.57,
          downside_recovery: "81%",
          review_status: "summary_generated"
        }
      }
    ]
  }
];

let templates = [
  { id: "tpl-korea-v6", name: "Korea_v6", region: "Korea", source: "System", fileName: "Korea_v6.docx" },
  { id: "tpl-korea-v5", name: "Korea_v5", region: "Korea", source: "System", fileName: "Korea_v5.docx" },
  { id: "tpl-india-v2", name: "India_v2", region: "India", source: "System", fileName: "India_v2.docx" }
];

const baseCreditTerms = {
  deal_id: "SC-2026-089",
  issuer: "Atlas Industrial Holdings",
  sector: "Diversified Industrials",
  geography: "Asia Pacific",
  facility_type: "Senior Secured Term Loan",
  currency: "USD",
  commitment_amount_mn: 185,
  leverage_metrics: {
    ltv: 0.68,
    net_leverage: "4.2x",
    icr: 2.45
  },
  structural_protections: {
    security_package: ["share pledge", "accounts charge", "receivables assignment"],
    ranking: "first lien",
    guarantor_coverage: "material subsidiaries"
  },
  covenants: {
    maintenance: ["minimum ICR", "maximum net leverage"],
    incurrence: ["restricted payments", "additional debt", "asset disposals"]
  },
  pricing: {
    margin_bps: 775,
    floor: "SOFR + 0.75%",
    oid: "1.5 points"
  },
  cashflows: [120000, 135000, 142000],
  risk_flags: [
    "customer concentration above 20%",
    "refinancing window within 24 months"
  ],
  confidence: 0.982,
  status: "processing"
};

resetInterface();
renderRepositoryScope();
renderDashboard();
renderTemplates();
renderTemplateOptions();

modelSelect.addEventListener("change", () => {
  selectedModel = modelSelect.value;
});

templateSelect.addEventListener("change", () => {
  selectedTemplate = templateSelect.value;
});

llmCommandRun.addEventListener("click", runLlmCommand);

templateFileInput.addEventListener("change", (event) => {
  const [file] = event.target.files;
  if (!file) {
    return;
  }

  const inferredName = file.name.replace(/\.docx$/i, "");
  const inferredRegion = inferTemplateRegion(inferredName);
  templates.push({
    id: `tpl-${Date.now()}`,
    name: inferredName,
    region: inferredRegion,
    source: "Uploaded",
    fileName: file.name
  });

  templateUploadStatus.textContent = `${file.name} uploaded to template library`;
  renderTemplates();
  renderTemplateOptions();
  templateFileInput.value = "";
});

viewTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    setActiveView(trigger.dataset.viewTrigger);
  });
});

fileInput.addEventListener("change", (event) => {
  const [file] = event.target.files;
  if (file) {
    void setCurrentFile(file);
  }
});

repoTrigger.addEventListener("click", () => {
  const isExpanded = repoTrigger.getAttribute("aria-expanded") === "true";
  repoTrigger.setAttribute("aria-expanded", String(!isExpanded));
  repoMenu.hidden = isExpanded;
});

repoOptions.forEach((option) => {
  option.addEventListener("click", () => {
    selectedRepository = option.dataset.repo;
    selectedRepositoryName.textContent = selectedRepository;
    repoOptions.forEach((entry) => entry.classList.remove("is-selected"));
    option.classList.add("is-selected");
    repoMenu.hidden = true;
    repoTrigger.setAttribute("aria-expanded", "false");
    renderRepositoryScope();
  });
});

document.addEventListener("click", (event) => {
  if (!event.target.closest("#repo-dropdown")) {
    repoMenu.hidden = true;
    repoTrigger.setAttribute("aria-expanded", "false");
  }

  const jsonButton = event.target.closest("[data-json-index]");
  if (jsonButton) {
    const userIndex = Number(jsonButton.dataset.userIndex);
    const entryIndex = Number(jsonButton.dataset.jsonIndex);
    openJsonModal(dashboardOutputs[userIndex].entries[entryIndex]);
  }

  const pdfButton = event.target.closest("[data-pdf-index]");
  if (pdfButton) {
    const userIndex = Number(pdfButton.dataset.userIndex);
    const entryIndex = Number(pdfButton.dataset.pdfIndex);
    const record = dashboardOutputs[userIndex].entries[entryIndex];
    downloadBlankPdf(record.pdfName);
  }

  const templateEditButton = event.target.closest("[data-template-edit-id]");
  if (templateEditButton) {
    openTemplateModal(templateEditButton.dataset.templateEditId);
  }

  const templateDownloadButton = event.target.closest("[data-template-download-id]");
  if (templateDownloadButton) {
    const template = templates.find((entry) => entry.id === templateDownloadButton.dataset.templateDownloadId);
    if (template) {
      downloadBlankDocx(template.fileName);
    }
  }

  const templateDeleteButton = event.target.closest("[data-template-delete-id]");
  if (templateDeleteButton) {
    deleteTemplate(templateDeleteButton.dataset.templateDeleteId);
  }
});

jsonModalClose.addEventListener("click", closeJsonModal);
templateModalClose.addEventListener("click", closeTemplateModal);
templateModalCancel.addEventListener("click", closeTemplateModal);
templateModalSave.addEventListener("click", saveTemplateEdits);

jsonModal.addEventListener("click", (event) => {
  if (event.target === jsonModal) {
    closeJsonModal();
  }
});

templateModal.addEventListener("click", (event) => {
  if (event.target === templateModal) {
    closeTemplateModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !jsonModal.hidden) {
    closeJsonModal();
  }

  if (event.key === "Escape" && !templateModal.hidden) {
    closeTemplateModal();
  }

  if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && activeView === "portal") {
    runLlmCommand();
  }
});

["dragenter", "dragover"].forEach((eventName) => {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.add("is-dragging");
  });
});

["dragleave", "dragend", "drop"].forEach((eventName) => {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.remove("is-dragging");
  });
});

dropzone.addEventListener("drop", (event) => {
  const [file] = event.dataTransfer.files;
  if (file) {
    fileInput.files = event.dataTransfer.files;
    void setCurrentFile(file);
  }
});

summarizeButton.addEventListener("click", () => {
  if (!currentFile) {
    setSystemState("Idle", "status status--draft");
    jsonBadge.textContent = "Upload required";
    return;
  }

  outputState = "processing";
  setSystemState("Processing", "status status--processing");
  jsonBadge.textContent = "Generating";
  summarizeButton.disabled = true;
  verifyButton.disabled = true;
  draftButton.disabled = true;
  summarizeButton.textContent = "SUMMARIZING...";

  window.setTimeout(() => {
    const payload = buildSummaryPayload(currentFile);
    jsonOutput.textContent = JSON.stringify(payload, null, 2);
    jsonBadge.textContent = "Credit terms extracted";
    summarizeButton.disabled = false;
    summarizeButton.textContent = "SUMMARIZE";
    filesPending.textContent = "1 File processed";
    setSystemState("Processing", "status status--processing");
    verifyButton.disabled = false;
    outputState = "summarized";
  }, 700);
});

verifyButton.addEventListener("click", () => {
  if (outputState !== "summarized") {
    return;
  }

  const parsed = JSON.parse(jsonOutput.textContent);
  parsed.status = "verified";
  parsed.verification = {
    reviewer: "Acme Private Credit Team",
    timestamp: new Date().toISOString()
  };
  jsonOutput.textContent = JSON.stringify(parsed, null, 2);
  jsonBadge.textContent = "Verified";
  setSystemState("Verified", "status status--verified");
  draftButton.disabled = false;
  draftButton.classList.remove("action-button--muted");
  draftButton.classList.add("action-button--draft-ready");
  outputState = "verified";
});

draftButton.addEventListener("click", () => {
  if (outputState !== "verified") {
    return;
  }

  downloadBlankPdf(`${selectedTemplate.toLowerCase()}_draft.pdf`);
  jsonBadge.textContent = "Draft exported";
  setSystemState("Drafting", "status status--draft");
  outputState = "drafted";
});

async function setCurrentFile(file) {
  currentFile = file;
  selectedFile.textContent = `${file.name} · ${formatFileSize(file.size)}`;
  filesPending.textContent = "1 File pending processing";
  setSystemState("Ready", "status status--processing");
  jsonBadge.textContent = "Document loaded";
  jsonOutput.textContent = "";
  verifyButton.disabled = true;
  draftButton.disabled = true;
  draftButton.classList.remove("action-button--draft-ready");
  draftButton.classList.add("action-button--muted");
  outputState = "ready";
  uploadedDocumentContext = {
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    extractedText: "",
    extractionStatus: "Preparing document context...",
    pageCount: 0
  };

  if (isPdfFile(file)) {
    selectedFile.textContent = `${file.name} · ${formatFileSize(file.size)} · extracting text`;
    try {
      const pdfExtraction = await extractPdfText(file);
      uploadedDocumentContext = {
        fileName: file.name,
        mimeType: file.type || "application/pdf",
        extractedText: pdfExtraction.text,
        extractionStatus: `PDF text extracted from ${pdfExtraction.pageCount} page(s)`,
        pageCount: pdfExtraction.pageCount
      };
      selectedFile.textContent = `${file.name} · ${formatFileSize(file.size)} · PDF text ready`;
    } catch (error) {
      uploadedDocumentContext = {
        fileName: file.name,
        mimeType: file.type || "application/pdf",
        extractedText: "",
        extractionStatus:
          error instanceof Error ? `PDF extraction failed: ${error.message}` : "PDF extraction failed",
        pageCount: 0
      };
      selectedFile.textContent = `${file.name} · ${formatFileSize(file.size)} · PDF text unavailable`;
    }
  } else {
    uploadedDocumentContext.extractionStatus =
      "Only uploaded PDF text is sent to the LLM in this demo version";
  }
}

function setSystemState(text, className) {
  systemStatus.textContent = text;
  systemStatus.className = className;
}

function resetInterface() {
  jsonOutput.textContent = "";
  verifyButton.disabled = true;
  draftButton.disabled = true;
  draftButton.classList.remove("action-button--draft-ready");
  draftButton.classList.add("action-button--muted");
}

function downloadBlankPdf(fileName = "acme-private-credit-draft.pdf") {
  const blankPdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 0 >>
stream

endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000191 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
241
%%EOF`;

  const blob = new Blob([blankPdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function downloadBlankDocx(fileName) {
  const blob = new Blob([], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function buildSummaryPayload(file) {
  return {
    ...baseCreditTerms,
    processing_config: {
      selected_model: selectedModel,
      selected_template: selectedTemplate,
      user_command: llmCommandInput.value.trim() || "No additional user command supplied"
    },
    repository_context: {
      selected_repository: selectedRepository,
      accessible_paths: repositoryAccess[selectedRepository]
    },
    source_document: {
      file_name: file.name,
      file_size_mb: Number((file.size / (1024 * 1024)).toFixed(2)),
      mime_type: file.type || "application/pdf"
    },
    extraction_notes: [
      "Demo output only for Acme Private Credit front-end review",
      "RAG-backed document grounding will replace this stub"
    ]
  };
}

function formatFileSize(size) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function renderRepositoryScope() {
  repositoryScopeList.innerHTML = repositoryAccess[selectedRepository]
    .map((path) => `<li>${path}</li>`)
    .join("");
}

function setActiveView(nextView) {
  activeView = nextView;
  appViews.forEach((view) => {
    view.hidden = view.dataset.view !== nextView;
  });
  viewTriggers.forEach((trigger) => {
    trigger.classList.toggle("nav-item--active", trigger.dataset.viewTrigger === nextView);
  });
}

function renderDashboard() {
  dashboardGrid.innerHTML = dashboardOutputs
    .map((group, userIndex) => {
      const cards = group.entries
        .map(
          (entry, entryIndex) => `
            <article class="output-card">
              <div class="output-card__topline">
                <div>
                  <p class="output-card__company">${entry.company}</p>
                  <p class="output-card__meta">${group.user} · ${group.region}</p>
                </div>
                <span class="output-card__tag">${entry.status}</span>
              </div>
              <p class="output-card__summary">${entry.summary}</p>
              <div class="output-card__actions">
                <button
                  class="mini-button mini-button--primary"
                  type="button"
                  data-user-index="${userIndex}"
                  data-json-index="${entryIndex}"
                >
                  View JSON
                </button>
                <button
                  class="mini-button mini-button--muted"
                  type="button"
                  data-user-index="${userIndex}"
                  data-pdf-index="${entryIndex}"
                >
                  Download PDF
                </button>
              </div>
            </article>
          `
        )
        .join("");

      return `
        <section class="user-output-group">
          <div class="user-output-group__header">
            <div class="user-output-group__identity">
              <div class="user-output-group__avatar">${group.user.charAt(0)}</div>
              <div>
                <p class="user-output-group__title">${group.user}</p>
                <p class="user-output-group__meta">${group.region} coverage</p>
              </div>
            </div>
            <span class="user-output-group__count">${group.entries.length} Outputs</span>
          </div>
          <div class="output-card-list">
            ${cards}
          </div>
        </section>
      `;
    })
    .join("");
}

function openJsonModal(entry) {
  jsonModalTitle.textContent = `${entry.company} JSON`;
  jsonModalContent.textContent = JSON.stringify(entry.json, null, 2);
  jsonModal.hidden = false;
}

function closeJsonModal() {
  jsonModal.hidden = true;
}

async function runLlmCommand() {
  const prompt = llmCommandInput.value.trim();
  if (!prompt) {
    llmResponseOutput.textContent = "Enter a text command first.";
    return;
  }

  llmCommandRun.disabled = true;
  llmCommandRun.setAttribute("aria-busy", "true");
  llmResponseOutput.textContent = "Thinking...";

  try {
    const response = await fetch(getLlmApiUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt,
        model: selectedLlmModel,
        context: {
          selectedRepository,
          accessiblePaths: repositoryAccess[selectedRepository],
          selectedTemplate,
          selectedModel,
          uploadedDocument: uploadedDocumentContext
        }
      })
    });

    const payload = await response.json();

    if (!response.ok) {
      llmResponseOutput.textContent = payload.error || "Unable to retrieve an LLM response.";
      return;
    }

    llmResponseOutput.textContent = payload.answer;
    updateDisplayedLlmModel(payload.model || selectedLlmModel);
  } catch (error) {
    llmResponseOutput.textContent =
      error instanceof Error ? error.message : "Unexpected LLM request error.";
  } finally {
    llmCommandRun.disabled = false;
    llmCommandRun.removeAttribute("aria-busy");
  }
}

function renderTemplates() {
  templateCountChip.textContent = `${templates.length} Templates`;
  templateLibrary.innerHTML =
    templates.length === 0
      ? `
        <article class="template-card">
          <p class="template-card__title">No templates available</p>
          <p class="template-card__source">Upload a blank DOCX template to repopulate the drafting library.</p>
        </article>
      `
      : templates
          .map(
            (template) => `
              <article class="template-card">
                <div class="template-card__topline">
                  <div>
                    <p class="template-card__title">${template.name}</p>
                    <p class="template-card__meta">${template.region} · ${template.fileName}</p>
                  </div>
                  <span class="output-card__tag">${template.source}</span>
                </div>
                <p class="template-card__source">Blank DOCX placeholder available for drafting export.</p>
                <div class="template-card__actions">
                  <button class="mini-button mini-button--primary" type="button" data-template-edit-id="${template.id}">
                    Edit
                  </button>
                  <button class="mini-button mini-button--muted" type="button" data-template-download-id="${template.id}">
                    Download DOCX
                  </button>
                  <button class="mini-button mini-button--danger" type="button" data-template-delete-id="${template.id}">
                    Delete
                  </button>
                </div>
              </article>
            `
          )
          .join("");
}

function renderTemplateOptions() {
  templateSelect.innerHTML = templates
    .map((template) => `<option value="${template.name}">${template.name}</option>`)
    .join("");

  if (!templates.some((template) => template.name === selectedTemplate)) {
    selectedTemplate = templates[0]?.name || "";
  }

  templateSelect.disabled = templates.length === 0;
  templateSelect.value = selectedTemplate;
}

function openTemplateModal(templateId) {
  const template = templates.find((entry) => entry.id === templateId);
  if (!template) {
    return;
  }

  editingTemplateId = templateId;
  templateNameInput.value = template.name;
  templateRegionInput.value = template.region;
  templateModal.hidden = false;
}

function closeTemplateModal() {
  editingTemplateId = null;
  templateModal.hidden = true;
}

function saveTemplateEdits() {
  const template = templates.find((entry) => entry.id === editingTemplateId);
  if (!template) {
    return;
  }

  const updatedName = templateNameInput.value.trim();
  if (!updatedName) {
    return;
  }

  const previousName = template.name;
  template.name = updatedName;
  template.region = templateRegionInput.value;
  template.fileName = `${updatedName}.docx`;

  if (selectedTemplate === previousName) {
    selectedTemplate = updatedName;
  }

  renderTemplates();
  renderTemplateOptions();
  closeTemplateModal();
}

function deleteTemplate(templateId) {
  const template = templates.find((entry) => entry.id === templateId);
  if (!template) {
    return;
  }

  templates = templates.filter((entry) => entry.id !== templateId);
  templateUploadStatus.textContent =
    templates.length === 0
      ? "No templates currently available"
      : `${template.name} removed from template library`;

  if (editingTemplateId === templateId) {
    closeTemplateModal();
  }

  if (selectedTemplate === template.name) {
    selectedTemplate = templates[0]?.name || "";
  }

  renderTemplates();
  renderTemplateOptions();
}

function inferTemplateRegion(templateName) {
  const lower = templateName.toLowerCase();
  if (lower.includes("korea")) {
    return "Korea";
  }

  if (lower.includes("india")) {
    return "India";
  }

  return "General";
}

function getLlmApiUrl() {
  if (window.location.protocol === "file:") {
    return "https://acme-private-credit-drafting-portal-demo.vercel.app/api/llm";
  }

  return "/api/llm";
}

function updateDisplayedLlmModel(modelName) {
  selectedLlmModel = modelName;
}

async function extractPdfText(file) {
  if (!window.pdfjsLib) {
    throw new Error("PDF parser not loaded");
  }

  if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
  }

  const data = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data }).promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    pages.push(pageText);
  }

  return {
    text: pages.join("\n\n").slice(0, 16000),
    pageCount: pdf.numPages
  };
}

function isPdfFile(file) {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}
