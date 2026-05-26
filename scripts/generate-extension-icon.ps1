param(
    [string]$OutputPath = (Join-Path $PSScriptRoot "..\media\icon.png"),
    [int]$Size = 512
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

function New-RoundedRectPath {
    param(
        [float]$X,
        [float]$Y,
        [float]$Width,
        [float]$Height,
        [float]$Radius
    )

    $diameter = $Radius * 2
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.StartFigure()
    $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
    $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
    $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
    $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
    $path.CloseFigure()
    return $path
}

function New-PointArray {
    param([object[][]]$Points)

    return $Points | ForEach-Object {
        New-Object System.Drawing.PointF ([float]$_[0]), ([float]$_[1])
    }
}

$outputDirectory = Split-Path -Parent $OutputPath
if (-not (Test-Path $outputDirectory)) {
    New-Item -ItemType Directory -Path $outputDirectory | Out-Null
}

$bitmap = New-Object System.Drawing.Bitmap $Size, $Size
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)

try {
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    $canvasRect = New-Object System.Drawing.Rectangle 0, 0, $Size, $Size
    $baseBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $canvasRect,
        [System.Drawing.ColorTranslator]::FromHtml("#071522"),
        [System.Drawing.ColorTranslator]::FromHtml("#14365A"),
        45.0
    )
    $graphics.FillRectangle($baseBrush, $canvasRect)

    $glowBrushA = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(72, 34, 214, 208))
    $glowBrushB = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(58, 123, 82, 255))
    $glowBrushC = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(48, 16, 158, 255))
    $graphics.FillEllipse($glowBrushA, -70, -40, 280, 280)
    $graphics.FillEllipse($glowBrushB, 240, 10, 320, 320)
    $graphics.FillEllipse($glowBrushC, 120, 300, 320, 180)

    $overlayBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(80, 4, 9, 18))
    $graphics.FillRectangle($overlayBrush, $canvasRect)

    $panelX = 62.0
    $panelY = 82.0
    $panelW = 388.0
    $panelH = 312.0
    $panelPath = New-RoundedRectPath -X $panelX -Y $panelY -Width $panelW -Height $panelH -Radius 34.0
    $panelBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(220, 9, 18, 34))
    $panelBorder = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(130, 119, 220, 255)), 3.0
    $panelShadowBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(38, 0, 0, 0))
    $graphics.TranslateTransform(0, 8)
    $graphics.FillPath($panelShadowBrush, $panelPath)
    $graphics.ResetTransform()
    $graphics.FillPath($panelBrush, $panelPath)
    $graphics.DrawPath($panelBorder, $panelPath)

    $topBarBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(215, 15, 28, 49))
    $graphics.FillRectangle($topBarBrush, $panelX, $panelY, $panelW, 44)

    $controlRed = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(220, 255, 96, 120))
    $controlYellow = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(220, 255, 194, 92))
    $controlGreen = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(220, 56, 205, 129))
    $graphics.FillEllipse($controlRed, 88, 96, 14, 14)
    $graphics.FillEllipse($controlYellow, 110, 96, 14, 14)
    $graphics.FillEllipse($controlGreen, 132, 96, 14, 14)

    $innerPath = New-RoundedRectPath -X 86.0 -Y 136.0 -Width 340.0 -Height 220.0 -Radius 26.0
    $innerState = $graphics.Save()
    $graphics.SetClip($innerPath)

    $wallpaperRect = New-Object System.Drawing.Rectangle 86, 136, 340, 220
    $wallpaperBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $wallpaperRect,
        [System.Drawing.ColorTranslator]::FromHtml("#0E2B47"),
        [System.Drawing.ColorTranslator]::FromHtml("#05111F"),
        90.0
    )
    $graphics.FillRectangle($wallpaperBrush, $wallpaperRect)

    $auroraA = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(52, 64, 255, 223))
    $auroraB = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(40, 127, 102, 255))
    $graphics.FillEllipse($auroraA, 96, 118, 220, 112)
    $graphics.FillEllipse($auroraB, 220, 124, 168, 96)

    $moonBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(235, 230, 246, 255))
    $graphics.FillEllipse($moonBrush, 326, 158, 24, 24)

    $backMountainBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(120, 72, 204, 232))
    $frontMountainBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(220, 11, 50, 74))
    $midMountainBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(180, 24, 96, 136))

    $backMountain = New-PointArray @(
        @(86, 304), @(152, 236), @(214, 270), @(280, 214),
        @(350, 262), @(426, 228), @(426, 356), @(86, 356)
    )
    $midMountain = New-PointArray @(
        @(86, 326), @(140, 276), @(192, 296), @(250, 246),
        @(324, 294), @(380, 250), @(426, 282), @(426, 356), @(86, 356)
    )
    $frontMountain = New-PointArray @(
        @(86, 356), @(86, 332), @(138, 296), @(188, 330),
        @(240, 274), @(298, 328), @(358, 286), @(426, 336), @(426, 356)
    )
    $graphics.FillPolygon($backMountainBrush, $backMountain)
    $graphics.FillPolygon($midMountainBrush, $midMountain)
    $graphics.FillPolygon($frontMountainBrush, $frontMountain)

    $graphics.Restore($innerState)

    $innerBorder = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(95, 172, 235, 255)), 2.0
    $graphics.DrawPath($innerBorder, $innerPath)

    $shieldPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $shieldPoints = New-PointArray @(
        @(256, 148), @(320, 178), @(312, 260),
        @(256, 312), @(200, 260), @(192, 178)
    )
    $shieldPath.AddPolygon($shieldPoints)

    $shieldBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(62, 126, 241, 255))
    $shieldPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(220, 228, 248, 255)), 4.0
    $graphics.FillPath($shieldBrush, $shieldPath)
    $graphics.DrawPath($shieldPen, $shieldPath)

    $checkPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(240, 255, 255, 255)), 7.0
    $checkPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $checkPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $graphics.DrawLines(
        $checkPen,
        (New-PointArray @(
            @(226, 224), @(248, 248), @(288, 204)
        ))
    )

    $codePenA = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(210, 102, 233, 255)), 4.0
    $codePenB = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(210, 144, 250, 152)), 4.0
    $codePenC = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(210, 255, 200, 109)), 4.0
    $graphics.DrawLine($codePenA, 116, 378, 198, 378)
    $graphics.DrawLine($codePenB, 214, 378, 302, 378)
    $graphics.DrawLine($codePenC, 320, 378, 392, 378)
    $graphics.DrawLine($codePenB, 116, 396, 182, 396)
    $graphics.DrawLine($codePenA, 200, 396, 282, 396)
    $graphics.DrawLine($codePenC, 300, 396, 376, 396)

    $watermarkPath = New-RoundedRectPath -X 26.0 -Y 396.0 -Width 92.0 -Height 92.0 -Radius 26.0
    $watermarkBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(78, 7, 19, 33))
    $watermarkBorder = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(138, 113, 236, 255)), 2.0
    $graphics.FillPath($watermarkBrush, $watermarkPath)
    $graphics.DrawPath($watermarkBorder, $watermarkPath)

    $watermarkFont = New-Object System.Drawing.Font("Segoe UI Semibold", 44, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $watermarkBrushText = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(172, 235, 247, 255))
    $graphics.DrawString("C", $watermarkFont, $watermarkBrushText, 47, 411)

    $outerBorder = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(90, 188, 243, 255)), 2.0
    $graphics.DrawRectangle($outerBorder, 1, 1, $Size - 3, $Size - 3)

    $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
}
finally {
    $graphics.Dispose()
    $bitmap.Dispose()
}
