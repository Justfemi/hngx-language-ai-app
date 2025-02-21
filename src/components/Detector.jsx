export const initializeLanguageDetector = async () => {
    try {
      const languageDetectorCapabilities = await self.ai.languageDetector.capabilities();
      const canDetect = languageDetectorCapabilities.capabilities;
  
      if (canDetect === "no") {
        console.warn("Language detector is not usable.");
        return null;
      }
  
      let detector;
      if (canDetect === "readily") {
        detector = await self.ai.languageDetector.create();
      } else {
        detector = await self.ai.languageDetector.create({
          monitor(m) {
            m.addEventListener("downloadprogress", (e) => {
              console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
            });
          },
        });
        await detector.ready;
      }
  
      return detector;
    } catch (error) {
      console.error("Error initializing language detector:", error);
      return null;
    }
  };
  
  export const detectLanguage = async (detector, textInput) => {
    if (!detector) return "Detector not ready";
    try {
      const result = await detector.detect(textInput);
      if(result.length > 0 ){
        return result[0].detectedLanguage || "Language not recognised";
      }
      return "Language not recognised";
    } catch (error) {
      console.error("Error detecting language:", error);
      return "Error detecting language";
    }
  };
  