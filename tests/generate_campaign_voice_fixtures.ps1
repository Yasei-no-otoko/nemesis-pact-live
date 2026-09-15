$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$fixtureDirectory = Join-Path $PSScriptRoot '../.work/campaign-voice-fixtures'
New-Item -ItemType Directory -Force -Path $fixtureDirectory | Out-Null
$speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
    $speaker.SelectVoice('Microsoft Zira Desktop')
    $speaker.Rate = 0
    $phrases = [ordered]@{
        first = 'Slow your bullets. Send more if you want.'
        correction = 'Actually, change that. I want stronger reflections instead. My normal shots can be weaker. Reflections, please.'
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
