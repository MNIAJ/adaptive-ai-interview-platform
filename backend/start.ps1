
Set-Location $PSScriptRoot

$env:DB_URL = "jdbc:postgresql://localhost:5432/interview_platform"
$env:DB_USER = "postgres"
$env:DB_PASSWORD = Read-Host "Enter PostgreSQL password"
$env:JWT_SECRET = [guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N")
$env:AI_PROVIDER = "springai"
$env:OLLAMA_URL = "http://localhost:11434"
$env:OLLAMA_MODEL = "llama3.2"
$env:FRONTEND_URL = "http://localhost:5173"

mvn spring-boot:run
