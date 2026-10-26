# Precious & Aaron — CHI-ESON 2026

A multi-page wedding website built with plain HTML, CSS, and vanilla JavaScript. It has no build step or framework and uses relative paths for GitHub Pages.

## Pages

- `index.html` — wedding information, program preview, photo previews, maps, and contact information.
- `gallery.html` — full pre-wedding and traditional-marriage galleries with a keyboard-accessible photo viewer.
- `program.html` — full event timeline with print / save as PDF support.

## Edit wedding details

Edit the `wedding` object in `data.js` for names, copy, date/time, venue, directions search text, coordinator contact, and colours. Use ISO event date-times with the Lagos/WAT offset, for example `2026-10-31T10:00:00+01:00`. Use `"TBD"` for unconfirmed dates.

The wedding program is in `wedding.program.church` and `wedding.program.reception`. Each item can include any of these optional fields:

```js
{
  group: "Ceremony", // Optional heading shared by consecutive program items
  time: "10:00 AM",
  title: "Processional",
  description: "The wedding party and the couple enter.",
  notes: "Guests are kindly asked to stand.",
  hymn: "Hymn title or number",
  speaker: "Name or role"
}
```

Remove any optional property that is not needed. The same program data feeds the home-page summary and the full timeline, so editing it in one place updates both pages. The current order of service is sample content and should be replaced with the family-approved program.

## Photo folders and optimization

Source photos may be kept in `originals/pre-wedding/` and `originals/traditional/`; `originals/` is excluded from Git. For the photos currently supplied, `resizing.py` also falls back to `Pre_Wedding_Shoot/` and `Traditional_Marriage/`.

Install the optimizer dependency into the same Python environment you use to run the script. From the website folder:

```powershell
python -m pip install -r requirements.txt
python resizing.py
```

If using the parent `For_Fun` virtual environment shown in VS Code, run these commands from `For_Fun`:

```powershell
& ".\.venv\Scripts\python.exe" -m pip install -r ".\precious-aaron-wedding\requirements.txt"
& ".\.venv\Scripts\python.exe" ".\precious-aaron-wedding\resizing.py"
```

The explicit interpreter matters: installing Pillow in one Python environment does not make it available in another. The script reports the install command if Pillow is missing. It creates numbered, lowercase JPEGs under:

- `images/pre-wedding/full/` and `images/pre-wedding/thumb/`
- `images/traditional/full/` and `images/traditional/thumb/`

It also refreshes the generated photo manifest near the top of `data.js` from the source files it processed.

Optional venue roadmaps can be added as `images/directions/church-roadmap.png` and `images/directions/reception-roadmap.png`. The roadmap slot stays hidden if the corresponding image is absent. Google Maps remains the primary directions link.

## Preview

Open `index.html` directly or use a static local server from this folder, for example:

```powershell
python -m http.server 8765
```

Then visit `http://localhost:8765/`.

## Deploy to GitHub Pages

1. Create a GitHub repository and add the contents of this folder. Include the `images/` output directories and all three HTML pages; keep `originals/` out of the repository.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the branch containing the website and the `/ (root)` folder, then save.
5. Wait for GitHub Pages to publish and open the URL shown in Pages settings.

Because the links are relative, the same files can also be deployed as a static site to Netlify.

## Still to confirm

The short love-story text, coordinator name and phone number, full church/reception order of service, reception date/time, exact parking and arrival notes, and both junction-by-junction roadmaps are still placeholders or awaiting confirmation. The White Wedding gallery is intentionally empty until photos are available.
