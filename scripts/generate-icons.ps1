Add-Type -AssemblyName System.Drawing

function Generate-Icon {
    param (
        [int]$Size,
        [string]$Path,
        [bool]$Maskable = $false
    )

    $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $darkBg = [System.Drawing.Color]::FromArgb(255, 9, 9, 11)
    $orange = [System.Drawing.Color]::FromArgb(255, 255, 107, 0)
    $orangeFaded = [System.Drawing.Color]::FromArgb(160, 255, 107, 0)
    $white = [System.Drawing.Color]::FromArgb(255, 255, 255, 255)

    if ($Maskable) {
        $bgBrush = New-Object System.Drawing.SolidBrush($darkBg)
        $g.FillRectangle($bgBrush, 0, 0, $Size, $Size)
    } else {
        # Rounded rect for regular icons
        $rect = New-Object System.Drawing.Rectangle(0, 0, $Size, $Size)
        $radius = [int]($Size * 0.22)
        $path2 = New-Object System.Drawing.Drawing2D.GraphicsPath
        $path2.AddArc(0, 0, $radius * 2, $radius * 2, 180, 90)
        $path2.AddArc($Size - $radius * 2, 0, $radius * 2, $radius * 2, 270, 90)
        $path2.AddArc($Size - $radius * 2, $Size - $radius * 2, $radius * 2, $radius * 2, 0, 90)
        $path2.AddArc(0, $Size - $radius * 2, $radius * 2, $radius * 2, 90, 90)
        $path2.CloseFigure()
        
        $bgBrush = New-Object System.Drawing.SolidBrush($darkBg)
        $g.FillPath($bgBrush, $path2)
    }

    $scale = $Size / 32.0
    
    # Dashed center line
    $penDashed = New-Object System.Drawing.Pen($orangeFaded, (1.8 * $scale))
    $penDashed.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
    $penDashed.DashPattern = @(2.0, 2.0)
    $g.DrawLine($penDashed, [float](16 * $scale), [float](5 * $scale), [float](16 * $scale), [float](27 * $scale))

    # Horizontal beam
    $penBeam = New-Object System.Drawing.Pen($orange, (2.2 * $scale))
    $penBeam.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $penBeam.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawLine($penBeam, [float](7 * $scale), [float](16 * $scale), [float](25 * $scale), [float](16 * $scale))

    # Brackets
    $penBracket = New-Object System.Drawing.Pen($white, (2.5 * $scale))
    $penBracket.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $penBracket.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $penBracket.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

    # Left bracket path: 12,9 -> 8,9 -> 8,23 -> 12,23
    $leftPts = @(
        [System.Drawing.PointF]::new(12 * $scale, 9 * $scale),
        [System.Drawing.PointF]::new(8 * $scale, 9 * $scale),
        [System.Drawing.PointF]::new(8 * $scale, 23 * $scale),
        [System.Drawing.PointF]::new(12 * $scale, 23 * $scale)
    )
    $g.DrawLines($penBracket, $leftPts)

    # Right bracket path: 20,9 -> 24,9 -> 24,23 -> 20,23
    $rightPts = @(
        [System.Drawing.PointF]::new(20 * $scale, 9 * $scale),
        [System.Drawing.PointF]::new(24 * $scale, 9 * $scale),
        [System.Drawing.PointF]::new(24 * $scale, 23 * $scale),
        [System.Drawing.PointF]::new(20 * $scale, 23 * $scale)
    )
    $g.DrawLines($penBracket, $rightPts)

    # Center circle target
    $circleRadius = 2.4 * $scale
    $orangeBrush = New-Object System.Drawing.SolidBrush($orange)
    $g.FillEllipse($orangeBrush, [float]((16 * $scale) - $circleRadius), [float]((16 * $scale) - $circleRadius), [float]($circleRadius * 2), [float]($circleRadius * 2))

    $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Output "Saved $Path ($Size x $Size)"
}

$publicDir = "D:\Projects\GITHUB\Code_Differ-Beautifier\public"
Generate-Icon -Size 192 -Path "$publicDir\pwa-192x192.png" -Maskable $false
Generate-Icon -Size 512 -Path "$publicDir\pwa-512x512.png" -Maskable $false
Generate-Icon -Size 512 -Path "$publicDir\pwa-maskable-512x512.png" -Maskable $true
Generate-Icon -Size 180 -Path "$publicDir\apple-touch-icon.png" -Maskable $false
