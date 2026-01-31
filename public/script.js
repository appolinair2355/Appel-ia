async function sendMessage() {
  const input = document.getElementById("question");
  const answer = document.getElementById("answer");
  const loader = document.getElementById("loader");

  answer.innerHTML = "";
  loader.classList.remove("hidden");

  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: input.value })
  });

  const data = await res.json();

  loader.classList.add("hidden");
  answer.innerHTML = data.reply;
}
