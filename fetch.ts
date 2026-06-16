import https from "https";

https.get("https://api.github.com/repos/lalesleon13-hash/Tarot/git/trees/main?recursive=1", {
  headers: { "User-Agent": "Node.js" }
}, (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => {
    const list = JSON.parse(data);
    const images = list.tree.filter((t: any) => t.path.startsWith('RWS_Tarot_'));
    images.forEach((i: any) => console.log(i.path));
  });
});
