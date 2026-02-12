$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$appDir = Split-Path -Parent $scriptDir
$vbsPath = Join-Path $scriptDir "start.vbs"
$iconPath = Join-Path $appDir "public\icon.ico"

$WshShell = New-Object -ComObject WScript.Shell

# Desktop shortcut
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "Study Visualizer.lnk"
$shortcut = $WshShell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "$env:SYSTEMROOT\System32\wscript.exe"
$shortcut.Arguments = "`"$vbsPath`""
$shortcut.WorkingDirectory = $appDir
$shortcut.Description = "Study Visualizer"
if (Test-Path $iconPath) { $shortcut.IconLocation = $iconPath }
$shortcut.Save()

# Start Menu shortcut
$startMenuDir = Join-Path ([Environment]::GetFolderPath("StartMenu")) "Programs"
$startShortcutPath = Join-Path $startMenuDir "Study Visualizer.lnk"
$startShortcut = $WshShell.CreateShortcut($startShortcutPath)
$startShortcut.TargetPath = "$env:SYSTEMROOT\System32\wscript.exe"
$startShortcut.Arguments = "`"$vbsPath`""
$startShortcut.WorkingDirectory = $appDir
$startShortcut.Description = "Study Visualizer"
if (Test-Path $iconPath) { $startShortcut.IconLocation = $iconPath }
$startShortcut.Save()

Write-Host ""
Write-Host "Shortcuts created:"
Write-Host "  Desktop: $shortcutPath"
Write-Host "  Start Menu: $startShortcutPath"
Write-Host ""
