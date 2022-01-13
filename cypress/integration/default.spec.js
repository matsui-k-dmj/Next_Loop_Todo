/// <reference types="cypress" />
import { format } from "date-fns";
import ja from "date-fns/locale/ja";

describe("index", () => {
  beforeEach(() => {
    cy.clearIndexedDB();
  });
  it("初期値と遷移", () => {
    cy.visit("/");
    // Todo
    cy.contains("ログイン");
    cy.contains("日記");
    cy.contains(format(new Date(), "M/d E", { locale: ja }));

    // Routine
    cy.contains("Routines").click();
    cy.contains("ルーティンを追加");
    cy.contains("日記");

    // back to Todo
    cy.contains("Todo").click();
  });
});
