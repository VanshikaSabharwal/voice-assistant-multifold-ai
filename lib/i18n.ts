export type Language = "en" | "hi";

export const translations = {
  en: {
    headerTitle: "Equipment Troubleshooting",
    connected: "Connected",
    voiceOn: "Voice on",
    voiceOff: "Voice off",
    muteTitle: "Mute spoken replies",
    unmuteTitle: "Unmute spoken replies",
    newConversation: "New conversation",
    recent: "Recent",
    languageLabel: "Language",
    autoDetect: "Auto-detect enabled",
    inputPlaceholder: "Ask about your AC, washing machine, fridge, or microwave…",
    listeningPlaceholder: "Listening…",
    thinkingPlaceholder: "VoiceAssist is thinking…",
    shiftEnterHint: "Shift+Enter for new line",
    recordingHint: "Recording…",
    disclaimer: "VoiceAssist can make mistakes. Verify important information.",
    emptyTitle: "How can I help you today?",
    emptySubtitle: "Ask about your AC, washing machine, refrigerator, or microwave",
    welcomeMessage:
      "Hi! I'm VoiceAssist, your electrical equipment support assistant.\n\nI can help you troubleshoot your AC, washing machine, refrigerator, or microwave. You can type your question or tap the mic to speak — in English or Hindi.",
    micPermissionError: "I couldn't access your microphone. Please check browser permissions and try again.",
    transcribeError: "Sorry, I couldn't transcribe that. Please try speaking again.",
    genericError: "Sorry, something went wrong reaching the assistant. Please try again.",
    readAloud: "Read aloud",
    stopSpeaking: "Stop speaking",
    loadingSpeech: "Loading speech…",
    voiceModeButtonTitle: "Open voice mode",
    voiceModeListening: "Listening…",
    voiceModeThinking: "Thinking…",
    voiceModeSpeaking: "Speaking — tap to interrupt",
    voiceModeTapToStop: "Tap to stop and respond",
    voiceModeClose: "End voice mode",
    deleteConversation: "Delete conversation",
    suggestions: [
      "My AC is not cooling",
      "Washing machine not spinning",
      "Fridge making loud noise",
      "Microwave not heating",
    ],
  },
  hi: {
    headerTitle: "उपकरण समस्या निवारण",
    connected: "जुड़ा हुआ",
    voiceOn: "आवाज़ चालू",
    voiceOff: "आवाज़ बंद",
    muteTitle: "आवाज़ में जवाब बंद करें",
    unmuteTitle: "आवाज़ में जवाब चालू करें",
    newConversation: "नई बातचीत",
    recent: "हाल की बातचीत",
    languageLabel: "भाषा",
    autoDetect: "स्वतः-पहचान सक्षम",
    inputPlaceholder: "अपने AC, वाशिंग मशीन, फ्रिज या माइक्रोवेव के बारे में पूछें…",
    listeningPlaceholder: "सुन रहा हूँ…",
    thinkingPlaceholder: "VoiceAssist सोच रहा है…",
    shiftEnterHint: "नई लाइन के लिए Shift+Enter दबाएँ",
    recordingHint: "रिकॉर्डिंग हो रही है…",
    disclaimer: "VoiceAssist गलतियाँ कर सकता है। महत्वपूर्ण जानकारी स्वयं सत्यापित करें।",
    emptyTitle: "आज मैं आपकी कैसे मदद कर सकता हूँ?",
    emptySubtitle: "अपने AC, वाशिंग मशीन, फ्रिज या माइक्रोवेव के बारे में पूछें",
    welcomeMessage:
      "नमस्ते! मैं VoiceAssist हूँ, आपका इलेक्ट्रिकल उपकरण सहायक।\n\nमैं आपके AC, वाशिंग मशीन, फ्रिज या माइक्रोवेव की समस्या सुलझाने में मदद कर सकता हूँ। आप अपना सवाल टाइप कर सकते हैं या बोलने के लिए माइक दबा सकते हैं — अंग्रेज़ी या हिंदी में।",
    micPermissionError: "मैं आपके माइक्रोफ़ोन तक नहीं पहुँच सका। कृपया ब्राउज़र अनुमतियाँ जाँचें और फिर कोशिश करें।",
    transcribeError: "माफ़ करें, मैं उसे समझ नहीं सका। कृपया फिर से बोलने की कोशिश करें।",
    genericError: "माफ़ करें, सहायक से जुड़ने में कुछ गड़बड़ हुई। कृपया फिर कोशिश करें।",
    readAloud: "सुनें",
    stopSpeaking: "रोकें",
    loadingSpeech: "तैयार हो रहा है…",
    voiceModeButtonTitle: "वॉइस मोड खोलें",
    voiceModeListening: "सुन रहा हूँ…",
    voiceModeThinking: "सोच रहा हूँ…",
    voiceModeSpeaking: "बोल रहा हूँ — रोकने के लिए टैप करें",
    voiceModeTapToStop: "बोलना बंद करने के लिए टैप करें",
    voiceModeClose: "वॉइस मोड बंद करें",
    deleteConversation: "बातचीत हटाएं",
    suggestions: [
      "मेरा AC ठंडा नहीं कर रहा",
      "वाशिंग मशीन घूम नहीं रही",
      "फ्रिज से तेज़ आवाज़ आ रही है",
      "माइक्रोवेव गरम नहीं कर रहा",
    ],
  },
} as const;

export type Translation = {
  [K in keyof typeof translations.en]: (typeof translations.en)[K] extends readonly string[]
    ? readonly string[]
    : string;
};

export function getTranslation(language: Language): Translation {
  return translations[language];
}
