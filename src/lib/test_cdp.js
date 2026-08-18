const wsUrl = process.env.AGY_BROWSER_WS_URL;
if (!wsUrl) {
  console.log("ERROR: AGY_BROWSER_WS_URL not set");
  process.exit(1);
}

const ws = new WebSocket(wsUrl);

ws.onopen = () => {
  console.log("Connected to browser WebSocket");
  ws.send(JSON.stringify({
    id: 1,
    method: "Target.getTargets"
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.id === 1) {
    console.log("Targets list:");
    const targets = data.result.targetInfos;
    targets.forEach(t => {
      console.log(`- ${t.title} (${t.url}) - ID: ${t.targetId}`);
    });
    ws.close();
  }
};

ws.onerror = (err) => {
  console.error("WebSocket Error:", err);
};
