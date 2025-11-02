import { swapLanguages } from "@/utils/language";

describe("swapLanguages", () => {
  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
  ];

  it("should swap input and output languages and text", () => {
    const result = swapLanguages(
      "en",
      [{ code: "es", name: "Spanish", text: "Hola" }],
      "Hello",
      languages
    );

    expect(result?.newInputLang).toBe("es");
    expect(result?.newInputText).toBe("Hola");
    expect(result?.newOutputLanguages[0].code).toBe("en");
    expect(result?.newOutputLanguages[0].text).toBe("Hello");
  });

  it("should return null if input language is auto", () => {
    const result = swapLanguages(
      "auto",
      [{ code: "es", name: "Spanish", text: "Hola" }],
      "Hello",
      languages
    );
    expect(result).toBeNull();
  });

  it("should return null if there are no output languages", () => {
    const result = swapLanguages("en", [], "Hello", languages);
    expect(result).toBeNull();
  });
});
