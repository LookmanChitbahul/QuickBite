Placeholder images were not downloadable from the internet in this environment.

To add local images for the onboarding screens, place PNG files at:
- assets/images/icon.png
- assets/images/onboard_browse.png
- assets/images/onboard_fast.png

Or run the PowerShell commands below from the project root to download placeholders (requires internet access):

Set-Location -Path "c:\Users\23054\Desktop\quickbite"
Invoke-WebRequest -Uri "https://via.placeholder.com/96.png?text=QB" -OutFile ".\assets\images\icon.png" -UseBasicParsing
Invoke-WebRequest -Uri "https://via.placeholder.com/96.png?text=Browse" -OutFile ".\assets\images\onboard_browse.png" -UseBasicParsing
Invoke-WebRequest -Uri "https://via.placeholder.com/96.png?text=Fast" -OutFile ".\assets\images\onboard_fast.png" -UseBasicParsing

If you'd like, I can retry downloading these for you — tell me to retry or paste your own image files and I'll wire them into the UI.