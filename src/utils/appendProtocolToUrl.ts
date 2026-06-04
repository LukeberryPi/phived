const PROTOCOLS = ["https://", "http://"] as const;

export function appendProtocolToUrl(url: string) {
  if (!url) {
    return;
  }

  const startsWithProtocol = PROTOCOLS.some((protocol) =>
    url.startsWith(protocol)
  );

  return startsWithProtocol ? url : `https://${url}`;
}
