const FORM_URL = 'https://help.snapchat.com/hc/en-gb/requests/new?co=true&ticket_form_id=149423';

const MY_USERNAME = 'YOUR_SNAPCHAT_USERNAME';
const MY_EMAIL = 'YOUR_EMAIL';
const MY_PHONE = 'YOUR_MOBILE_NUMBER';

const textarea = document.getElementById('friends');
const countEl = document.getElementById('count');
const submitBtn = document.getElementById('submit');
const statusWrap = document.getElementById('status-wrap');
const warning = document.getElementById('warning');

function getNames() {
  return textarea.value
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

textarea.addEventListener('input', () => {
  const names = getNames();
  countEl.textContent = names.length;
  submitBtn.disabled = names.length === 0;
  warning.style.display = names.length > 5 ? 'block' : 'none';
});

function makeStatusItem(name) {
  const div = document.createElement('div');
  div.className = 'status-item';
  div.id = 'status-' + name;
  div.innerHTML = `<div class="dot pending"></div><div class="name">${name}</div><div class="state">Waiting…</div>`;
  return div;
}

function updateStatus(name, dotClass, stateText) {
  const el = document.getElementById('status-' + name);
  if (!el) return;
  el.querySelector('.dot').className = 'dot ' + dotClass;
  el.querySelector('.state').textContent = stateText;
}

submitBtn.addEventListener('click', async () => {
  const names = getNames();
  if (names.length === 0) return;

  submitBtn.disabled = true;
  textarea.disabled = true;
  statusWrap.innerHTML = '';

  names.forEach(name => statusWrap.appendChild(makeStatusItem(name)));

  for (let i = 0; i < names.length; i++) {
    const friend = names[i];
    updateStatus(friend, 'opening', 'Opening tab…');

    try {
      const tab = await chrome.tabs.create({ url: FORM_URL, active: false });

      updateStatus(friend, 'filling', 'Waiting for form…');

      await waitForTabLoad(tab.id);

      await delay(1500);

      updateStatus(friend, 'filling', 'Filling form…');

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: fillAndSubmit,
        args: [MY_USERNAME, MY_EMAIL, MY_PHONE, friend]
      });

      updateStatus(friend, 'done', 'Submitted ✓');

    } catch (err) {
      updateStatus(friend, 'error', 'Failed — check tab');
    }

    if (i < names.length - 1) await delay(1200);
  }

  submitBtn.disabled = false;
  textarea.disabled = false;
});

function waitForTabLoad(tabId) {
  return new Promise((resolve) => {
    function listener(id, changeInfo) {
      if (id === tabId && changeInfo.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    }
    chrome.tabs.onUpdated.addListener(listener);
    setTimeout(resolve, 8000);
  });
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// This function runs inside the Snapchat tab
function fillAndSubmit(username, email, phone, friendUsername) {
  function setReactValue(el, value) {
    const proto = el.tagName === 'TEXTAREA'
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
    const nativeSet = Object.getOwnPropertyDescriptor(proto, 'value');
    nativeSet.set.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  function fillByLabel(labelText, value, exact = false) {
    const labels = document.querySelectorAll('label');
    for (const label of labels) {
      const text = label.innerText.toLowerCase().trim();
      const match = exact ? text === labelText.toLowerCase() : text.includes(labelText.toLowerCase());
      if (match) {
        const forId = label.htmlFor || label.getAttribute('for');
        const input = forId
          ? document.getElementById(forId)
          : label.querySelector('input, textarea, select');
        if (input) {
          setReactValue(input, value);
          return true;
        }
      }
    }
    return false;
  }

  function fillSelectByLabel(labelText, optionText) {
    const labels = document.querySelectorAll('label');
    for (const label of labels) {
      const text = label.innerText.toLowerCase().trim();
      if (text.includes(labelText.toLowerCase())) {
        const forId = label.htmlFor || label.getAttribute('for');
        const select = forId ? document.getElementById(forId) : label.querySelector('select');
        if (select) {
          for (const opt of select.options) {
            if (opt.text.toLowerCase().includes(optionText.toLowerCase())) {
              setReactValue(select, opt.value);
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  let attempts = 0;
  const maxAttempts = 20;

  const interval = setInterval(() => {
    attempts++;

    fillByLabel('username', username);
    fillByLabel('email', email);
    fillByLabel('phone', phone);
    fillByLabel('mobile', phone);
    fillByLabel("friend", friendUsername);
    fillSelectByLabel('chat', 'one friend');

    const submitBtn = document.querySelector('input[type="submit"][value="Submit"], button[type="submit"]');
    const allFilled = document.querySelectorAll('input[value]:not([value=""]), textarea:not([value=""])').length;

    if (submitBtn && allFilled >= 2) {
      clearInterval(interval);
      setTimeout(() => submitBtn.click(), 500);
    }

    if (attempts >= maxAttempts) clearInterval(interval);
  }, 600);
}
