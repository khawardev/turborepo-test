curl /forgot-password

curl -X 'POST' \
  'http://54.221.221.0:8000/forgot-password' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "khawarsultan663@gmail.com"
}'
resposne:
{
  "message": "If an account with that email exists, a password reset link has been sent."
}


this will recieve in the email and user will click on this

http://localhost:3000/reset-password?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJraGF3YXJzdWx0YW42NjNAZ21haWwuY29tIiwiZXhwIjoxNzYxNTc3MTA0fQ.iPepaGJ9JkkEZoHv8n9Nwf0hrYTBF5R4bkStvvKdQEo

======================
curl /reset-password

curl -X 'POST' \
  'http://54.221.221.0:8000/reset-password' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJraGF3YXJzdWx0YW42NjNAZ21haWwuY29tIiwiZXhwIjoxNzYxNTc3MTA0fQ.iPepaGJ9JkkEZoHv8n9Nwf0hrYTBF5R4bkStvvKdQEo",
  "new_password": "abcdef1234"
}'

{
  "message": "Password has been reset successfully."
}

{
  "detail": "Invalid or expired token"
}

