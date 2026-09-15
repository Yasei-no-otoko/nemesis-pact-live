# Local synthetic player input for the explicitly opted-in production capture.
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Speech
$fixtureDirectory=Join-Path (Split-Path $PSScriptRoot -Parent) '.work/full-campaign-voice'
New-Item -ItemType Directory -Force -Path $fixtureDirectory | Out-Null
$speaker=New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
 $speaker.SelectVoice('Microsoft Zira Desktop');$speaker.Rate=0
 $phrases=[ordered]@{
  first='Slow your bullets. Send more if you want.'
  correction='Actually, change that. I want stronger reflections instead. My normal shots can be weaker. Reflections, please.'
  mirror='Give me stronger reflected shots. My normal gun can be weaker. Return to Sender.'
  sanctuary='Put a sanctuary at the center. My normal shots can be weaker.'
  duel='No reinforcements. Just you and me. You can attack faster.'
 }
 foreach($item in $phrases.GetEnumerator()){$speaker.SetOutputToWaveFile((Join-Path $fixtureDirectory ($item.Key+'.wav')));$speaker.Speak($item.Value);$speaker.SetOutputToNull()}
 Write-Output 'Five original synthetic player speech fixtures saved locally.'
} finally {$speaker.Dispose()}
