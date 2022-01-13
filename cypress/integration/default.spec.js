/// <reference types="cypress" />
import { format, addDays } from "date-fns";
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

  it("作成", () => {
    cy.visit("/routines");
    cy.wait(1000);
    cy.contains("ルーティンを追加").click();
    const name = "test";
    cy.get("input[name='name']").should("have.value", "").type(name);
    cy.get("input[name='name']").should("have.value", name);
    cy.get("[data-testId='routineItem']").first().contains(name);

    cy.visit("/");
    cy.get("[data-testId='todoItem']").first().contains(name);
  });

  it("2日毎", () => {
    cy.visit("/routines");
    cy.wait(1000);
    cy.contains("ルーティンを追加").click();
    const name = "test";
    cy.get("input[name='name']").should("have.value", "").type(name);
    cy.get("input[name='every']").clear().type("2").should("have.value", "2");

    cy.visit("/");
    cy.get("[data-testId='todoItem']").first().contains(name);

    cy.clock(new Date()); // initialize clock
    cy.tick(1000 * 60 * 60 * 24); // 1日進める
    cy.window().focus(); // データの更新に必要
    cy.contains(format(addDays(new Date(), 1), "M/d E", { locale: ja }));
    cy.wait(100); // アイテムが揃うまで待つ
    cy.get("[data-testId='todoItem']")
      .first()
      .contains(name)
      .should("not.exist");

    const day2 = addDays(new Date(), 2);
    cy.tick(1000 * 60 * 60 * 24); // 1日進める
    cy.window().focus(); // データの更新に必要
    cy.contains(format(day2, "M/d E", { locale: ja }));
    cy.get("[data-testId='todoItem']").first().contains(name);
  });
});
