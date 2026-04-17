const ACRONYMS = new Set([
  "id", "ip", "url", "tls", "dns", "api", "scim", "idp", "ssl",
  "adp", "pra", "lss", "dr", "icmp", "cname", "fqdn", "tcp", "udp",
  "zpn", "zpa", "zia", "crl", "dto", "san", "udid", "json", "uri",
]);

export function titleCase(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2") // camelCase -> camel Case
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2") // XMLParser -> XML Parser
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) =>
      ACRONYMS.has(w.toLowerCase())
        ? w.toUpperCase()
        : w[0].toUpperCase() + w.slice(1),
    )
    .join(" ");
}
