param(
    [Parameter(Mandatory = $true)]
    [string]$InputPath,

    [Parameter(Mandatory = $true)]
    [string]$OutputPath,

    [int]$Columns = 4
)

Add-Type -AssemblyName System.Drawing

if (-not ("SpriteStripCleaner" -as [type])) {
    Add-Type -ReferencedAssemblies "System.Drawing" -TypeDefinition @"
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;

public static class SpriteStripCleaner
{
    private static bool IsBackgroundCandidate(Color pixel)
    {
        int max = Math.Max(pixel.R, Math.Max(pixel.G, pixel.B));
        int min = Math.Min(pixel.R, Math.Min(pixel.G, pixel.B));
        return min >= 105 && max - min <= 40;
    }

    public static string Clean(string inputPath, string outputPath, int columns)
    {
        using (var source = new Bitmap(inputPath))
        using (var output = new Bitmap(source.Width, source.Height, PixelFormat.Format32bppArgb))
        {
            using (var graphics = Graphics.FromImage(output))
            {
                graphics.DrawImageUnscaled(source, 0, 0);
            }

            int width = output.Width;
            int height = output.Height;
            var visited = new bool[width * height];
            var queue = new Queue<int>();

            Action<int, int> enqueue = (x, y) =>
            {
                int index = y * width + x;
                if (visited[index]) return;
                if (!IsBackgroundCandidate(output.GetPixel(x, y))) return;
                visited[index] = true;
                queue.Enqueue(index);
            };

            for (int x = 0; x < width; x++)
            {
                enqueue(x, 0);
                enqueue(x, height - 1);
            }
            for (int y = 0; y < height; y++)
            {
                enqueue(0, y);
                enqueue(width - 1, y);
            }

            int[] dx = { -1, 0, 1, -1, 1, -1, 0, 1 };
            int[] dy = { -1, -1, -1, 0, 0, 1, 1, 1 };

            while (queue.Count > 0)
            {
                int index = queue.Dequeue();
                int x = index % width;
                int y = index / width;
                output.SetPixel(x, y, Color.Transparent);

                for (int direction = 0; direction < 8; direction++)
                {
                    int nextX = x + dx[direction];
                    int nextY = y + dy[direction];
                    if (nextX < 0 || nextX >= width || nextY < 0 || nextY >= height) continue;
                    enqueue(nextX, nextY);
                }
            }

            output.Save(outputPath, ImageFormat.Png);

            int cellWidth = width / columns;
            var report = new List<string>();
            for (int column = 0; column < columns; column++)
            {
                int startX = column * cellWidth;
                int endX = column == columns - 1 ? width : startX + cellWidth;
                int minX = endX;
                int minY = height;
                int maxX = startX - 1;
                int maxY = -1;

                for (int y = 0; y < height; y++)
                {
                    for (int x = startX; x < endX; x++)
                    {
                        if (output.GetPixel(x, y).A == 0) continue;
                        minX = Math.Min(minX, x);
                        minY = Math.Min(minY, y);
                        maxX = Math.Max(maxX, x);
                        maxY = Math.Max(maxY, y);
                    }
                }

                report.Add(String.Format(
                    "frame={0} bounds={1},{2},{3},{4} cell={5},{6},{7},{8}",
                    column,
                    minX,
                    minY,
                    maxX,
                    maxY,
                    startX,
                    0,
                    endX - 1,
                    height - 1
                ));
            }

            return String.Join(Environment.NewLine, report.ToArray());
        }
    }
}
"@
}

$inputResolved = (Resolve-Path -LiteralPath $InputPath).Path
$outputDirectory = Split-Path -Parent $OutputPath
if (-not (Test-Path -LiteralPath $outputDirectory)) {
    New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
}

[SpriteStripCleaner]::Clean($inputResolved, $OutputPath, $Columns)
