fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'john@gmail.com', password: 'password123' })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
