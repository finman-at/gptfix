let templates = [];
let currentTemplate = null;

function insertCustomUI() {
  if (document.getElementById("custom-gpt-send-btn")) return;

  const select = document.createElement("select");
  select.id = "templateSelect";

  Object.assign(select.style, {
    marginRight: "10px",
    padding: "8px",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "white",
    color: "black",
    border: "1px solid #ccc",
  });

  const button = document.createElement("button");
  button.id = "custom-gpt-send-btn";
  button.textContent = "Send + Fix";

  Object.assign(button.style, {
    padding: "10px 16px",
    borderRadius: "8px",
    backgroundColor: "#10a37f",
    color: "white",
    fontWeight: "bold",
    fontSize: "14px",
    border: "none",
    cursor: "pointer",
  });

  const wrapper = document.createElement("div");
  Object.assign(wrapper.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    zIndex: "9999",
    display: "flex",
    gap: "10px",
  });

  button.addEventListener("click", (e) => {
    e.preventDefault();
    const editor = document.querySelector(".ProseMirror");
    if (!editor) return;

    const selectedName = select.value;
    const tpl = templates.find((t) => t.name === selectedName);
    if (!tpl) return;

    const prefixText = tpl.prefix ? tpl.prefix.trim() + "\n" : "";
    const postfixText = tpl.postfix ? "\n" + tpl.postfix.trim() : "";
    const currentText = editor.textContent.trim();
    const newText = `${prefixText}${currentText}${postfixText}`;

    editor.innerHTML = "";
    const textNode = document.createTextNode(newText);
    editor.appendChild(textNode);
    editor.dispatchEvent(new InputEvent("input", { bubbles: true }));

    setTimeout(() => {
      const event = new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        key: "Enter",
        code: "Enter",
      });
      editor.dispatchEvent(event);
    }, 10);
  });

  wrapper.appendChild(select);
  wrapper.appendChild(button);
  document.body.appendChild(wrapper);

  chrome.storage.local.get(["templates", "defaultTemplate"], (data) => {
    templates = data.templates || [];
    const defaultName = data.defaultTemplate || "";
    templates.forEach((tpl) => {
      const opt = document.createElement("option");
      opt.value = tpl.name;
      opt.textContent = tpl.name;
      if (tpl.name === defaultName) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });
  });
}

const observer = new MutationObserver(() => {
  insertCustomUI();
});

observer.observe(document.body, { childList: true, subtree: true });
insertCustomUI();
