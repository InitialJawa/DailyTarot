import fetch from "node-fetch";

async function test() {
  const res = await fetch("http://localhost:3000/api/chat-master", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
       readingContext: { type: "test", question: "no", interpretation: "...", cards: "The Fool" },
       message: "halo",
       chatHistory: [{ role: "user", content: "hi" }, { role: "assistant", content: "hi back" }]
    })
  });
  console.log(res.status);
  console.log(await res.text());
}
test();
