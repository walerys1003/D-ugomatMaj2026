/**
 * Tier 6 zad. 272 — Synthetic API checks (health endpoints).
 */
import { ApiCheck, AssertionBuilder } from "checkly/constructs";

new ApiCheck("health-liveness", {
  name: "Health — liveness",
  activated: true,
  muted: false,
  frequency: 1,
  locations: ["eu-central-1", "eu-west-2"],
  tags: ["health", "critical"],
  degradedResponseTime: 1500,
  maxResponseTime: 5000,
  request: {
    url: "https://dlugomat.pl/api/health",
    method: "GET",
    followRedirects: true,
    assertions: [
      AssertionBuilder.statusCode().equals(200),
      AssertionBuilder.responseTime().lessThan(2000),
    ],
  },
});

new ApiCheck("homepage", {
  name: "Homepage — 200 + LCP element",
  activated: true,
  muted: false,
  frequency: 5,
  locations: ["eu-central-1", "eu-west-2"],
  tags: ["seo", "critical"],
  request: {
    url: "https://dlugomat.pl",
    method: "GET",
    followRedirects: true,
    assertions: [
      AssertionBuilder.statusCode().equals(200),
      AssertionBuilder.textBody().contains("Długomat"),
      AssertionBuilder.responseTime().lessThan(3000),
    ],
  },
});

new ApiCheck("baza-wiedzy-index", {
  name: "Baza wiedzy — index",
  activated: true,
  frequency: 10,
  locations: ["eu-central-1"],
  tags: ["seo"],
  request: {
    url: "https://dlugomat.pl/baza-wiedzy",
    method: "GET",
    assertions: [
      AssertionBuilder.statusCode().equals(200),
      AssertionBuilder.textBody().contains("przedawnienie"),
    ],
  },
});

new ApiCheck("sitemap", {
  name: "Sitemap reachable",
  activated: true,
  frequency: 30,
  locations: ["eu-central-1"],
  tags: ["seo"],
  request: {
    url: "https://dlugomat.pl/sitemap.xml",
    method: "GET",
    assertions: [
      AssertionBuilder.statusCode().equals(200),
      AssertionBuilder.headers("content-type").contains("xml"),
    ],
  },
});

new ApiCheck("openapi-spec", {
  name: "OpenAPI spec exposed",
  activated: true,
  frequency: 60,
  locations: ["eu-central-1"],
  tags: ["api"],
  request: {
    url: "https://dlugomat.pl/api/openapi?format=json",
    method: "GET",
    assertions: [
      AssertionBuilder.statusCode().equals(200),
      AssertionBuilder.jsonBody("$.openapi").contains("3.1"),
    ],
  },
});
