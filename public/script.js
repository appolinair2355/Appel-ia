async function send() {
  const msg = document.getElementById("msg").value;
  const rep = document.getElementById("rep");
  const bar = document.getElementById("progress");
  const fill = document.getElementById("progress-fill");

  rep.innerText = "";
  bar.style.display = "block";
  fill.style.width = "0%";

  // animation de chargement
  let percent = 0;
  const loader = setInterval(() => {
    percent += 5;
    fill.style.width = percent + "%";
    if (percent >= 90) clearInterval(loader);
  }, 100);

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: msg })
  });

  const data = await res.json();

  fill.style.width = "100%";
  setTimeout(() => {
    bar.style.display = "none";
    rep.innerText = data.reply;
  }, 500);
}
```js
async function send() {
  const msg = document.getElementById("msg").value;
  const rep = document.getElementById("rep");

  rep.innerText = "⏳ Réflexion...";

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: msg })
  });

  const data = await res.json();
  rep.innerText = data.reply;
}
