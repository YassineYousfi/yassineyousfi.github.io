document.querySelectorAll('.github-repo').forEach(async link => {
  const repo = await fetch(`https://api.github.com/repos${new URL(link.href).pathname}`).then(response => response.json())
  if (repo.description) link.after(document.createElement('br'), repo.description)
})

document.querySelectorAll('.github-readme').forEach(async readme => {
  readme.innerHTML = await fetch(`https://api.github.com/repos/${readme.dataset.repo}/readme`, {
    headers: { Accept: 'application/vnd.github.html+json' }
  }).then(response => response.text())
})

document.querySelectorAll('.huggingface-repo').forEach(async link => {
  const path = new URL(link.href).pathname
  const repo = await fetch(`https://huggingface.co/api/${path.startsWith('/datasets/') || path.startsWith('/spaces/') ? path.slice(1) : `models${path}`}`).then(response => response.json())
  if (repo.cardData?.short_description) link.after(document.createElement('br'), repo.cardData.short_description)
})
