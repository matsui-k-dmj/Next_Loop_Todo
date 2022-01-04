/// <reference types="cypress" />
describe("index", () => {
  before(() => {
    cy.clearIndexedDB();
  });
  it("visit index", () => {
    cy.visit("/");
    cy.contains("朝食").click();

    cy.contains("Routines").click();

    cy.contains("タスクを追加").click();

    cy.contains("朝食").click();
  });
});
