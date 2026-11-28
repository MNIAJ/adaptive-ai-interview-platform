
Set-Location $PSScriptRoot

$env:DB_URL = "jdbc:postgresql://localhost:5432/interview_platform"
$env:DB_USER = "postgres"
$env:DB_PASSWORD = Read-Host "Enter PostgreSQL password"
$secretPath = Join-Path $PSScriptRoot '.jwt-secret.local'
if (-not $env:JWT_SECRET) {
    if (-not (Test-Path $secretPath)) {
        ([guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N")) | Set-Content -NoNewline $secretPath
    }
    $env:JWT_SECRET = (Get-Content -Raw $secretPath).Trim()
}
if (-not $env:AI_PROVIDER) { $env:AI_PROVIDER = "springai" }
if ($env:AI_PROVIDER -eq "groq" -and -not $env:GROQ_API_KEY) {
    $secureKey = Read-Host "Enter Groq API key" -AsSecureString
    $env:GROQ_API_KEY = [System.Net.NetworkCredential]::new("", $secureKey).Password
}
$env:OLLAMA_URL = "http://localhost:11434"
$env:OLLAMA_MODEL = "llama3.2"
$env:FRONTEND_URL = "http://localhost:5173"

mvn spring-boot:run
