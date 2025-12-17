# Test n8n webhook directly (PowerShell version)
# Replace with a real email from your Salesforce if you want to test with real data

$body = @{
    emails = @(
        "gustdepie@gmail.com",
        "gdelpieri@getontop.com"
    )
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://n8n.tools.getontop.com/webhook-test/lookup-client-ids" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

