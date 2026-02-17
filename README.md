<img src="https://raw.githubusercontent.com/nextscript/Globale-Video-Filter-Overlay/refs/heads/main/preview.png">

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
<ul><li>Green = Movie, Blue = Anime, Red = Gaming, Yellow = EyeCare <b style="color:red;">(New)</b>, White = User</li></ul>
<li>Grading Settings (G)</li>
<ul><li>Make your own Settings for User Profile</li></ul>
<li>Auto-Scene-Match </li>
<ul><li>The script continuously samples frames and gently auto-adjusts brightness/contrast/saturation/hue-rotate to keep exposure, contrast, saturation and color cast more stable/neutral</li></ul>
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
<li>CTRL + ALT + A → Toggle Auto-Scene-Match </li>
<li>CTRL + ALT + I → Show/Hide Export/Import JSON (Screenshot & Recording)</li>
<li>CTRL + ALT + S → Show/Hide Scopes HUD <b style="color:red;">(New)</b></li>
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
<h2>Profile Cycle</h2>

<b>Off</b>
No profile filtering active. Only manual settings (Base, Dark&Moody, Teal&Orange, Vibrant, HDR, RGB Gain) are applied.

<b>Movie</b>
Cinematic look with warm color grading and softer contrast. Optimized for movies and series with natural skin tone reproduction.

<b>Anime</b>
Vibrant, colorful look specifically for anime and animations. Enhances typical anime colors and provides clearer lines.

<b>Gaming</b>
High-contrast, intense look for games. Improves visibility in dark areas and enhances colors for a more immersive gaming experience.

<b>EyeCare</b>
Reduces blue light by 50% for more comfortable viewing during long sessions, especially in the evening. Warmer color temperature similar to night mode features.

<b>User</b>
Your own manual settings. All your personal adjustments from the Grading HUD (contrast, black level, white level, RGB gain, etc.) take effect here.
<hr>
<h2>Auto-Scene-Match</h2>
An intelligent automatic image optimization that adapts to your video content in real-time.

<b>How it works:</b>
The function continuously analyzes the playing video image and calculates optimal values for brightness, contrast, saturation, and color cast. These values are smoothly and fluidly adjusted to the current scene.

<b>What is automatically controlled:</b>
<ul>
<li>Brightness – Adjusts overall brightness to an optimal level</li>
<li>Contrast – Optimizes dynamic range for more depth in the image</li>
<li>Saturation – Brings out colors naturally without oversaturation</li>
<li>Color Cast – Automatically corrects color tints (optional feature)</li>
</ul>
<br>
<b>Special features:</b>
<ul>
<li>Responds to scene changes with faster adaptation</li>
<li>Takes motion into account for more stable analysis</li>
<li>Adaptive algorithm glides smoothly between values (no hard switching)</li>
<li>Cannot analyze DRM-protected videos (uses last good values)</li>
</ul>
<br>
<b>Visual feedback:</b>
A small dot in the video shows the status(If debug=true Default: false):

🟢 Green = Active, no changes
🟢 Light Green = Active and currently adjusting
🔴 Red = No updates (e.g., with DRM)
<br>
<b>Goal:</b>
Always optimally looking videos without manual intervention – especially useful for changing scenes or different video sources.
<hr>
<h2>Scopes HUD</h2>
A professional analysis tool directly in the video that helps you make precise color corrections.

<b>Luma Histogram (Y)</b>
Displays the brightness distribution in the image from black (left) to white (right). Ideal for checking contrast, exposure, and avoiding clipping in highlights or shadows.

<b>RGB Parade</b>
Separate histograms for Red, Green, and Blue side by side. Enables precise analysis of color balance and assists with color correction and white balance.

<b>Saturation Meter</b>
Live display of the average color saturation in the image. Helps detect excessive or insufficient saturation.

<b>Average Values</b>
Shows the mean values for brightness (Y), RGB average, and saturation as numerical readouts.

<b>Special Feature:</b>
The Scopes HUD displays values after applying all your filters – so you see exactly what your settings are doing.
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
<hr>
<h2>My Profile:</h2>
<a href="https://raw.githubusercontent.com/nextscript/Globale-Video-Filter-Overlay/refs/heads/main/My_Profile.json" target="_blank">My_Profile.json</a>
