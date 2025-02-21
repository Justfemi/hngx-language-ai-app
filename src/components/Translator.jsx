export const initializeTranslator = async (sourceLang, targetLang) => {
  try {
    const translatorCapabilities = await self.ai.translator.capabilities();

    if (!translatorCapabilities.languagePairAvailable(sourceLang, targetLang)) {
      console.log(
        `Translation from ${sourceLang} to ${targetLang} is not supported.`
      );
      return null;
    }

    const translator = await self.ai.translator.create({
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
      monitor(m) {
        m.addEventListener("downloadprogress", (e) => {
          console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
        });
      },
    });

    return translator;
  } catch (error) {
    console.error("Error initializing translator:", error);
    return null;
  }
};

export const translateText = async (sourceLang, targetLang, text) => {
  if (!text.trim()) return "No text provided for translation.";

  if (sourceLang === "Error") {
    return "Translation API isn't available on your device.";
  }

  const availableLanguages = ["en", "es", "pt", "ru", "tr", "fr"];

  if (
    !availableLanguages.includes(sourceLang) ||
    !availableLanguages.includes(targetLang)
  ) {
    return `Translation from ${sourceLang.toUpperCase()} to ${targetLang.toUpperCase()} is not available.`;
  }

  try {
    const translator = await initializeTranslator(sourceLang, targetLang);

    if (!translator) {
      return `Translation from ${sourceLang.toUpperCase()} to ${targetLang.toUpperCase()} is not available on this device.`;
    }

    const translatedText = await translator.translate(text);
    return translatedText;
  } catch (error) {
    console.error("Translation error:", error);
    return "An error occurred while translating.";
  }
};
