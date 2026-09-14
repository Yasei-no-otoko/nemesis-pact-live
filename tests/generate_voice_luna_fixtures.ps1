$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$fixtureDirectory = Join-Path $PSScriptRoot '../.work/voice-luna-fixtures'
New-Item -ItemType Directory -Force -Path $fixtureDirectory | Out-Null
$speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
    $speaker.SelectVoice('Microsoft Zira Desktop')
    $speaker.Rate = 0
    $phrases = [ordered]@{
        left = 'Please put the sanctuary on the left.'
        correction = 'Actually, change that. Put the sanctuary on the right. Right side. I accept reinforcements.'
        amendment = 'Remove the sanctuary. Slow your bullets and strengthen my reflections. My gun can be weaker.'
    }
    foreach ($item in $phrases.GetEnumerator()) {
        $file = Join-Path $fixtureDirectory ($item.Key + '.wav')
        $speaker.SetOutputToWaveFile($file)
        $speaker.Speak($item.Value)
        $speaker.SetOutputToNull()
        Write-Output ($item.Key + ': ' + $item.Value)
    }
} finally {
    $speaker.Dispose()
}
