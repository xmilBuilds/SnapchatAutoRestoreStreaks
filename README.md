# 👻 Snap Streak Reset — Chrome Extension

Automatically fills and submits Snapchat streak reset forms for multiple friends at once. Opens one tab per friend, waits for the form to load, fills in your details, and clicks Submit.

---

## Before You Install — Edit Your Details

Open **`popup.js`** in any text editor (Notepad, VS Code, etc). At the very top of the file you'll see these three lines:

```js
const MY_USERNAME = 'john.43';
const MY_EMAIL = 'john@gmail.com';
const MY_PHONE = '+441234567890';
```

Replace the values with your own:

| Line | What to change | Example |
|------|---------------|---------|
| `MY_USERNAME` | Your Snapchat username | `'your_snap_name'` |
| `MY_EMAIL` | Email linked to your Snapchat account | `'you@email.com'` |
| `MY_PHONE` | Your mobile number (include country code) | `'+447700900123'` |

> ⚠️ **Don't remove the single quotes** around each value — just replace the text inside them.

That's the only file you need to edit. Leave everything else alone.

---

## Installing in Chrome

1. Make sure you've saved your changes to `popup.js`
2. Open Chrome and go to `chrome://extensions`
3. Toggle **Developer mode** on (switch in the top-right corner)
4. Click **Load unpacked**
5. Select the folder that contains `manifest.json` — make sure `manifest.json` is directly inside the folder you select, not inside a subfolder

The 👻 icon will appear in your Chrome toolbar. If you don't see it, click the puzzle piece icon and pin it.

---

## How to Use

1. Click the 👻 extension icon in your toolbar
2. Type your friends' Snapchat usernames in the box — **one username per line**
3. Click **Reset Streaks**
4. The extension opens one tab per friend in the background, fills the form, and submits it
5. Watch the status dots — yellow means in progress, green means submitted ✓

---

## Troubleshooting

**Status shows "Failed — check tab"**
The form may have loaded differently than expected. Open that tab manually and check if the form is filled in — you may just need to click Submit yourself.

**Nothing happens when I click the extension icon**
Make sure you selected the correct folder during "Load unpacked" — it must be the folder where `manifest.json` sits directly inside.

**Form opens but fields are empty**
Snapchat may have updated their form layout. The extension retries for ~12 seconds — wait a moment before assuming it failed.

---

## Notes

- Don't submit too many at once — stick to a reasonable number to avoid your requests being flagged as spam
- This extension only works on `help.snapchat.com` — it has no access to any other sites or your browser data
- If Snapchat changes their form structure in the future the auto-fill may stop working
