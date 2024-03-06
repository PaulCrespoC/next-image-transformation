Bun.serve({
    port: 3000,
    async fetch(req) {
        const url = new URL(req.url);
        if (url.pathname === "/health") {
            return new Response("OK");
        };
        if (url.pathname.startsWith("/image/")) return await resize(url);
        return Response.redirect("/", 302);
    }
});

const allowedDomains = process.env.ALLOWED_REMOTE_DOMAINS.split(",");
async function resize(url) {
    const preset = "pr:sharp"
    const src = url.pathname.split("/").slice(2).join("/");
    const origin = new URL(src).hostname;
    if (!allowedDomains.includes(origin)) {
        return new Response("Domain not allowed", { status: 403 });
    }
    const width = url.searchParams.get("width") || 0;
    const height = url.searchParams.get("height") || 0;
    const quality = url.searchParams.get("quality") || 75;
    try {
        const image = await fetch(`http://imgproxy:8080/${preset}/resize:fill:${width}:${height}/q:${quality}/plain/${src}`)
        const headers = new Headers(image.headers);
        headers.set("Server", "DynamicResizer");
        return new Response(image.body, {
            headers
        })
    } catch (e) {
        console.log(e)
        return new Response("Error resizing image")
    }
}