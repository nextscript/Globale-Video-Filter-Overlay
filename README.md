<img src="https://i.ibb.co/bgwB7jRn/89VLz9x.png">

<h2>What this script does</h2>

This userscript adds a global video filter pipeline to all HTML5 "video" elements on any website you visit.
It applies visual enhancements like sharpen/blur, black & white level tuning, optional cinematic color looks, and an adjustable grain reduction / texture control.

It also renders a small on-video overlay UI (icons + sliders). The slider values are stored globally via Tampermonkey storage, so the same settings are used across all sites, all players, and all tabs.
<hr>
<h2>Key features</h2>
<hr>
<ul>
<li>Works on any site with HTML5 videos (streaming sites, embedded players, etc.)</li>
<li>Per-video overlay UI positioned on the video (top-right)</li>
<li>Global persistent settings (one set of values shared everywhere)</li>
<li>Sharpen OR Blur using one slider (negative = blur, positive = sharpen)</li>
<li>Black Level (BL) lift/crush blacks (snap-to-zero)</li>
<li>White Level (WL) highlight “knee” tuning to push/pull bright areas (snap-to-zero)</li>

<li>DN (DeNoise / Texture)</li>
<ul><li>Positive values: grain reduction / smoothing</li><li>Negative values: texture boost (adds micro-contrast detail)</li></ul>
<li>HDR (SDR→HDR look):</li>
<ul><li>Increases local contrast, punch, and highlight shaping</li></ul>
<li>Optional cinematic looks:</li>
<ul><li>Dark & Moody</li><li>Teal & Orange</li><li>Vibrant & Saturated</li></ul>
<li>Color Grading Profile</li>
<ul><li>Green = Movie, Blue = Anime, Red = Gaming, White = User</li></ul>
<li>Grading Settings (G)</li>
<ul><li>Make your own Settings for User Profile</li></ul>
<hr>
<h2>Keyboard shortcuts (toggle on/off)</h2>
All shortcuts use: CTRL + ALT + key
<hr>
<ul>
<li>CTRL + ALT + B → Toggle Base Tone Chain (brightness/contrast/saturation layer)</li>
<li>CTRL + ALT + D → Toggle Dark & Moody</li>
<li>CTRL + ALT + O → Toggle Teal & Orange</li>
<li>CTRL + ALT + V → Toggle Vibrant & Saturated</li>
<li>CTRL + ALT + P → Toggle HDR</li>
<li>CTRL + ALT + C → Profile Cycle (Color Grading)</li>
<li>CTRL + ALT + G → Show/Hide Grading Settings (For User Profile)</li>
<li>CTRL + ALT + I → Show/Hide Export/Import JSON <b style="color:red;">(New)</b></li>
<li>CTRL + ALT + H → Show/Hide the overlay UI (icons + sliders)</li>
<hr>
Notes:
<ul>
<li>The overlay is hidden by default. Press CTRL+ALT+H to display it.</li>
<li>The icons B/D/O/V reflect which modes are currently enabled.</li>
</ul>
<hr>
<h2>Sliders (all global + persistent)</h2>
All slider values are saved automatically and reused everywhere.
All sliders support Snap-to-0 around the center, so you can easily return to neutral.
<hr>
<b>SL — Sharpen/Blur Level (-2.0 … +2.0, step 0.1)</b>
<ul>
<li>< 0 = Blur</li>
<li>> 0 = Sharpen</li>
</ul>

<b>SR — Radius (-2.0 … +2.0, step 0.1)</b>
<ul>
<li>Controls how “wide” the sharpen/blur effect is</li>
<li>Higher = stronger radius / softer influence</li>
</ul>

<b>BL — Black Level (-2.0 … +2.0, step 0.1)</b>
<ul>
<li>Positive lifts blacks (brighter shadows)</li>
<li>Negative crushes blacks (deeper shadows)</li>
</ul>

<b>WL — White Level (-2.0 … +2.0, step 0.1)</b>
<ul>
<li>Positive pushes highlights brighter</li>
<li>Negative compresses highlights (more headroom, less clipping)</li>
</ul>

<b>DN — DeNoise / Texture (-1.5 … +1.5, step 0.1)</b>
<ul>
<li>Positive = grain reduction / smoothing</li>
<li>Negative = texture boost (micro-contrast sharpening)</li>
</ul>

<b>HDR — Pseudo-HDR on/off (-1.0 … +2.0, step 0.1) Default: +0.3</b>
<ul>
<li>Positive = add punch, clarity, deeper highlights, and richer colors</li>
<li>Negative = soften the image, reducing contrast for a smoother look</li>
</ul><br>
<hr>
<h2>Recommended starting presets</h2>
<b>Clean / natural</b>
<ul>
<li>SL: +0.6</li>
<li>SR: +1.0</li>
<li>BL: 0.0</li>
<li>WL: 0.0</li>
<li>DN: +0.5</li>
</ul>
<b>Stronger sharpness</b>
<ul>
<li>SL: +1.2</li>
<li>SR: +1.2</li>
<li>BL: -0.2</li>
<li>WL: -0.1</li>
<li>DN: 0.0</li>
</ul>
<h2>My Personal Preset:</h2>
<hr>
[D] [Movie] / [B][D][User] / [B][D]
<b>Preset Values</b>
<ul>
<li>SL: +1.3</li>
<li>SR: -1.1</li>
<li>BL: +0.3</li>
<li>WL: +0.2</li>
<li>DN: +0.6</li>
<li>HDR: +0.2</li>
</ul>

<b>My User Profile:</b>
<ul>
<li>Contrast: +2.5</li>
<li>Black Level: -1.0</li>
<li>White Level: -0.5</li>
<li>Highlight: -2.5</li>
<li>Shadows: +1.5</li>
<li>Saturation: -0.8</li>
<li>Vibrance: +0.6</li>
<li>Sharpen: -0.6</li>
<li>Gamma: +0.6</li>
<li>Gain: +1.2</li>
<li>Hue-Correction: -0.3</li>
<ul>
