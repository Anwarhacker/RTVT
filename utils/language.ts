export const swapLanguages = (
  inputLanguage: string,
  outputLanguages: any[],
  inputText: string,
  languages: any[]
) => {
  if (inputLanguage === "auto" || outputLanguages.length === 0) {
    return null;
  }

  const firstOutputLang = outputLanguages[0];
  const newInputLang = firstOutputLang.code;
  const newOutputLang = inputLanguage;

  const inputTextContent = inputText;
  const outputTextContent = firstOutputLang.text;

  const newOutputLanguages = [
    {
      ...firstOutputLang,
      code: newOutputLang,
      name:
        languages.find((l) => l.code === newOutputLang)?.name ||
        newOutputLang,
      text: inputTextContent,
    },
    ...outputLanguages.slice(1),
  ];

  return {
    newInputLang,
    newInputText: outputTextContent,
    newOutputLanguages,
  };
};
