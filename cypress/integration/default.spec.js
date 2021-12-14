/// <reference types="cypress" />

describe("index", () => {
  it("visit index", () => {
    cy.visit("/");
  });
});
