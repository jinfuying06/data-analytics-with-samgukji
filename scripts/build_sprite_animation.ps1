param(
    [Parameter(Mandatory = $true)]
    [string]$InputPath,

    [Parameter(Mandatory = $true)]
    [string]$FramesDirectory,

    [Parameter(Mandatory = $true)]
    [string]$OutputStripPath,

    [Parameter(Mandatory = $true)]
    [string]$OutputGifPath,

    [Parameter(Mandatory = $true)]
    [double]$Fps
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

if (-not ("SpriteAnimationBuilder" -as [type])) {
    Add-Type -ReferencedAssemblies "System.Drawing" -TypeDefinition @"
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;

public static class SpriteAnimationBuilder
{
    private static Rectangle FindBounds(Bitmap image, int startX, int endX)
    {
        int minX = endX;
        int minY = image.Height;
        int maxX = startX - 1;
        int maxY = -1;

        for (int y = 0; y < image.Height; y++)
        {
            for (int x = startX; x < endX; x++)
            {
                if (image.GetPixel(x, y).A <= 8) continue;
                minX = Math.Min(minX, x);
                minY = Math.Min(minY, y);
                maxX = Math.Max(maxX, x);
                maxY = Math.Max(maxY, y);
            }
        }

        if (maxX < minX || maxY < minY) throw new InvalidOperationException("Empty frame region.");
        return Rectangle.FromLTRB(minX, minY, maxX + 1, maxY + 1);
    }

    private static Rectangle Expand(Rectangle bounds, int width, int height, int padding)
    {
        int left = Math.Max(0, bounds.Left - padding);
        int top = Math.Max(0, bounds.Top - padding);
        int right = Math.Min(width, bounds.Right + padding);
        int bottom = Math.Min(height, bounds.Bottom + padding);
        return Rectangle.FromLTRB(left, top, right, bottom);
    }

    private static Rectangle OpaqueBounds(Bitmap image)
    {
        return FindBounds(image, 0, image.Width);
    }

    public static string Build(string inputPath, string framesDirectory, string stripPath)
    {
        Directory.CreateDirectory(framesDirectory);
        Directory.CreateDirectory(Path.GetDirectoryName(stripPath));

        using (var source = new Bitmap(inputPath))
        {
            var occupied = new bool[source.Width];
            for (int x = 0; x < source.Width; x++)
            {
                for (int y = 0; y < source.Height; y++)
                {
                    if (source.GetPixel(x, y).A <= 8) continue;
                    occupied[x] = true;
                    break;
                }
            }

            var runs = new List<Rectangle>();
            int runStart = -1;
            for (int x = 0; x <= source.Width; x++)
            {
                bool hasPixel = x < source.Width && occupied[x];
                if (hasPixel && runStart < 0) runStart = x;
                if (!hasPixel && runStart >= 0)
                {
                    runs.Add(Rectangle.FromLTRB(runStart, 0, x, source.Height));
                    runStart = -1;
                }
            }

            // shortcut: tiny internal transparent slits can split one pose; merge the nearest runs until four remain.
            while (runs.Count > 4)
            {
                int mergeAt = 0;
                int smallestGap = Int32.MaxValue;
                for (int i = 0; i < runs.Count - 1; i++)
                {
                    int gap = runs[i + 1].Left - runs[i].Right;
                    if (gap >= smallestGap) continue;
                    smallestGap = gap;
                    mergeAt = i;
                }

                Rectangle merged = Rectangle.FromLTRB(
                    runs[mergeAt].Left,
                    0,
                    runs[mergeAt + 1].Right,
                    source.Height
                );
                runs[mergeAt] = merged;
                runs.RemoveAt(mergeAt + 1);
            }

            if (runs.Count != 4)
                throw new InvalidOperationException("Expected four transparent-gap-separated poses, found " + runs.Count + ".");

            var sourceBounds = new List<Rectangle>();
            int maxWidth = 0;
            int maxHeight = 0;
            foreach (Rectangle run in runs)
            {
                Rectangle rawBounds = FindBounds(source, run.Left, run.Right);
                if (rawBounds.Left == 0 || rawBounds.Top == 0 || rawBounds.Right == source.Width || rawBounds.Bottom == source.Height)
                    throw new InvalidOperationException("A source pose touches the canvas boundary and may already be clipped.");
                Rectangle bounds = Expand(rawBounds, source.Width, source.Height, 8);
                sourceBounds.Add(bounds);
                maxWidth = Math.Max(maxWidth, bounds.Width);
                maxHeight = Math.Max(maxHeight, bounds.Height);
            }

            double scale = Math.Min(390.0 / maxWidth, 230.0 / maxHeight);
            var frames = new List<Bitmap>();
            var report = new List<string>();

            for (int i = 0; i < sourceBounds.Count; i++)
            {
                Rectangle crop = sourceBounds[i];
                int drawWidth = Math.Max(1, (int)Math.Floor(crop.Width * scale));
                int drawHeight = Math.Max(1, (int)Math.Floor(crop.Height * scale));
                int drawX = (420 - drawWidth) / 2;
                int drawY = 250 - drawHeight - 10;

                var frame = new Bitmap(420, 250, PixelFormat.Format32bppArgb);
                using (Graphics graphics = Graphics.FromImage(frame))
                {
                    graphics.Clear(Color.Transparent);
                    graphics.CompositingMode = CompositingMode.SourceCopy;
                    graphics.InterpolationMode = InterpolationMode.NearestNeighbor;
                    graphics.PixelOffsetMode = PixelOffsetMode.Half;
                    graphics.DrawImage(source, new Rectangle(drawX, drawY, drawWidth, drawHeight), crop, GraphicsUnit.Pixel);
                }

                Rectangle outputBounds = OpaqueBounds(frame);
                if (outputBounds.Left < 2 || outputBounds.Top < 2 || outputBounds.Right > 418 || outputBounds.Bottom > 248)
                    throw new InvalidOperationException("Frame " + (i + 1) + " touches the output boundary.");

                string framePath = Path.Combine(framesDirectory, String.Format("frame-{0}.png", i + 1));
                frame.Save(framePath, ImageFormat.Png);
                frames.Add(frame);
                report.Add(String.Format(
                    "frame={0} source={1},{2},{3},{4} output={5},{6},{7},{8}",
                    i + 1,
                    crop.Left, crop.Top, crop.Right - 1, crop.Bottom - 1,
                    outputBounds.Left, outputBounds.Top, outputBounds.Right - 1, outputBounds.Bottom - 1
                ));
            }

            using (var strip = new Bitmap(1680, 250, PixelFormat.Format32bppArgb))
            using (Graphics graphics = Graphics.FromImage(strip))
            {
                graphics.Clear(Color.Transparent);
                graphics.CompositingMode = CompositingMode.SourceCopy;
                for (int i = 0; i < frames.Count; i++) graphics.DrawImageUnscaled(frames[i], i * 420, 0);
                strip.Save(stripPath, ImageFormat.Png);
            }

            foreach (Bitmap frame in frames) frame.Dispose();
            return String.Join(Environment.NewLine, report.ToArray());
        }
    }
}
"@
}

$inputResolved = (Resolve-Path -LiteralPath $InputPath).Path
New-Item -ItemType Directory -Force -Path $FramesDirectory | Out-Null
$stripDirectory = Split-Path -Parent $OutputStripPath
$gifDirectory = Split-Path -Parent $OutputGifPath
New-Item -ItemType Directory -Force -Path $stripDirectory,$gifDirectory | Out-Null

$report = [SpriteAnimationBuilder]::Build($inputResolved, $FramesDirectory, $OutputStripPath)

$ffmpeg = (Get-Command ffmpeg -ErrorAction Stop).Source
$inputPattern = Join-Path $FramesDirectory "frame-%d.png"
& $ffmpeg -hide_banner -loglevel error -y -framerate $Fps -start_number 1 -i $inputPattern `
    -filter_complex "[0:v]split[a][b];[a]palettegen=reserve_transparent=1:transparency_color=ffffff[p];[b][p]paletteuse=alpha_threshold=8" `
    -loop 0 $OutputGifPath

if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $OutputGifPath)) {
    throw "ffmpeg failed to create $OutputGifPath"
}

$report
