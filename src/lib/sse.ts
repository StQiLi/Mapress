export function sseInit(res: any) {
  res.headers.set("Content-Type", "text/event-stream");
  res.headers.set("Cache-Control", "no-cache, no-transform");
  res.headers.set("Connection", "keep-alive");
}

export function sseSend(controller: ReadableStreamDefaultController, data: unknown) {
  controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
}
