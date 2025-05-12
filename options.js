let templates = [];
let defaultTemplateName = "";

function loadTemplates() {
  chrome.storage.local.get(["templates", "defaultTemplate"], (data) => {
    templates = data.templates || [];
    defaultTemplateName = data.defaultTemplate || "";
    populateTemplateSelect();
    loadTemplateData(getCurrentTemplate());
  });
}

function populateTemplateSelect() {
  const select = document.getElementById("templateSelect");
  select.innerHTML = "";

  templates.forEach((template) => {
    const opt = document.createElement("option");
    opt.value = template.name;
    opt.textContent =
      template.name +
      (template.name === defaultTemplateName ? " (Default)" : "");
    select.appendChild(opt);
  });

  // Set current default
  if (defaultTemplateName) {
    select.value = defaultTemplateName;
  }
}

function loadTemplateData(template) {
  if (!template) return;
  document.getElementById("prefix").value = template.prefix || "";
  document.getElementById("postfix").value = template.postfix || "";
}

function getCurrentTemplate() {
  const name = document.getElementById("templateSelect").value;
  return templates.find((t) => t.name === name);
}

document.getElementById("templateSelect").addEventListener("change", () => {
  loadTemplateData(getCurrentTemplate());
});

document.getElementById("createNew").addEventListener("click", () => {
  const name = prompt("Enter new template name:");
  if (!name) return;
  if (templates.find((t) => t.name === name)) {
    alert("Template already exists.");
    return;
  }

  const newTemplate = { name, prefix: "", postfix: "" };
  templates.push(newTemplate);
  chrome.storage.local.set({ templates }, () => {
    populateTemplateSelect();
    document.getElementById("templateSelect").value = name;
    loadTemplateData(newTemplate);
  });
});

document.getElementById("save").addEventListener("click", () => {
  const currentName = document.getElementById("templateSelect").value;
  const prefix = document.getElementById("prefix").value;
  const postfix = document.getElementById("postfix").value;

  const tpl = templates.find((t) => t.name === currentName);
  if (tpl) {
    tpl.prefix = prefix;
    tpl.postfix = postfix;
    chrome.storage.local.set({ templates }, () => {
      document.getElementById("status").textContent = "Template saved.";
      setTimeout(() => {
        document.getElementById("status").textContent = "";
      }, 2000);
    });
  }
});

document.getElementById("setDefault").addEventListener("click", () => {
  const currentName = document.getElementById("templateSelect").value;
  defaultTemplateName = currentName;

  chrome.storage.local.set({ defaultTemplate: currentName }, () => {
    populateTemplateSelect(); // update label "(Default)"
    document.getElementById("templateSelect").value = currentName;

    // 👇 trigger change if needed
    document
      .getElementById("templateSelect")
      .dispatchEvent(new Event("change"));

    document.getElementById("status").textContent = "Default template updated.";
    setTimeout(() => {
      document.getElementById("status").textContent = "";
    }, 2000);
  });
});

document.getElementById("delete").addEventListener("click", () => {
  const currentName = document.getElementById("templateSelect").value;
  if (!confirm(`Delete template "${currentName}"?`)) return;

  templates = templates.filter((t) => t.name !== currentName);

  chrome.storage.local.set({ templates }, () => {
    if (defaultTemplateName === currentName) {
      defaultTemplateName = templates[0]?.name || "";
      chrome.storage.local.set({ defaultTemplate: defaultTemplateName });
    }

    populateTemplateSelect();
    loadTemplateData(getCurrentTemplate());
    document.getElementById("status").textContent = "Template deleted.";
    setTimeout(() => {
      document.getElementById("status").textContent = "";
    }, 2000);
  });
});

document.addEventListener("DOMContentLoaded", loadTemplates);
