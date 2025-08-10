// GET example from backend
async function getUsers() {
  const res = await fetch('/api/users');
  const data = await res.json();
  console.log('Users from backend:', data);
}

// POST example to backend
async function addUser(name) {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  const data = await res.json();
  console.log('User added:', data);
}

getUsers();

