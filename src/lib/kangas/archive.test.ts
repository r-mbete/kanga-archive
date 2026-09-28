import { describe, expect, it } from "vitest";
import { archiveHref, pageCount, parsePage } from "./archive";

describe("parsePage", () => {
  it.each([
    [undefined, 1],
    ["1", 1],
    ["3", 3],
    [["2", "5"], 2],
    ["0", 1],
    ["-2", 1],
    ["2.5", 1],
    ["abc", 1],
    ["", 1],
    ["99999999999999999999", 1],
  ])("reads %j as page %i", (value, expected) => {
    expect(parsePage(value)).toBe(expected);
  });
});

describe("pageCount", () => {
  it("rounds up and never drops below one page", () => {
    expect(pageCount(0, 24)).toBe(1);
    expect(pageCount(24, 24)).toBe(1);
    expect(pageCount(25, 24)).toBe(2);
  });
});

describe("archiveHref", () => {
  it("gives page 1 the bare archive URL", () => {
    expect(archiveHref(1)).toBe("/archive");
    expect(archiveHref(2)).toBe("/archive?page=2");
  });
});
