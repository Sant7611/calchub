import type { CalculatorContent } from "./calculator-content";

export const nepalLandAreaCalculatorContent: CalculatorContent = {
  slug: "nepal-land-area-converter",
  seo: {
    title: "Nepal Land Area Converter – Ropani, Aana, Bigha, Kattha & Dhur",
    description:
      "Convert Ropani, Aana, Paisa, Daam, Bigha, Kattha and Dhur to square feet, square meters, acres and hectares with Nepali numeral support.",
  },
  intro: [
    "Use the Nepal Land Area Converter to convert the land units commonly used in Nepal: Ropani (रोपनी), Aana (आना), Paisa (पैसा), Daam (दाम), Bigha (बिघा), Kattha (कठ्ठा) and Dhur (धुर). The calculator also converts the same area to square feet, square meters, acres and hectares.",
    "The calculator accepts both English digits and Devanagari digits such as १२३. It also normalizes compound Nepal land measurements into Ropani-Aana-Paisa-Daam and Bigha-Kattha-Dhur notation without rounding intermediate conversion values.",
    "नेपाल जग्गा क्षेत्रफल रूपान्तरणका लागि रोपनी, आना, पैसा, दाम, बिघा, कठ्ठा र धुर प्रविष्ट गर्न सकिन्छ। नतिजा नेपाली वा अंग्रेजी अंकमा हेर्न सकिन्छ। कानुनी वा आधिकारिक क्षेत्रफलका लागि लालपुर्जा तथा नापी अभिलेखलाई आधार मान्नुहोस्।",
  ],
  howToUse: [
    "Choose the Ropani system, Bigha system, standard units or rectangular Plot Area mode.",
    "Enter the land measurement using English digits or Devanagari digits such as २, ५ or १२.५.",
    "Use the language and numeral controls to display labels and results in English or Nepali and with 123 or १२३ digits.",
    "Review the normalized R-A-P-D and B-K-D values together with square feet, square meters, acres and hectares.",
    "For a rectangular plot estimate, enter the length and width in feet or meters. Use official cadastral records for legal land area.",
  ],
  formula: {
    title: "Nepal Land Area Conversion Relationships",
    explanation:
      "The hill-system conversion uses 1 Ropani = 16 Aana = 64 Paisa = 256 Daam = 5,476 square feet. The Terai-system conversion uses 1 Bigha = 20 Kattha = 400 Dhur = 72,900 square feet. Standard metric conversion uses 1 square foot = 0.09290304 square meter. The calculator converts the input to one internal square-foot area and derives every output independently, so rounded display values are never reused in later calculations.",
  },
  faqs: [
    {
      question: "How many square feet are in 1 Ropani (१ रोपनी)?",
      answer:
        "1 Ropani is 5,476 square feet. It is also equal to 16 Aana, 64 Paisa or 256 Daam.",
    },
    {
      question: "How many square feet are in 1 Aana (१ आना)?",
      answer:
        "1 Aana is 342.25 square feet. Four Paisa make one Aana, and 16 Aana make one Ropani.",
    },
    {
      question: "How many Kattha are in 1 Bigha (१ बिघा)?",
      answer:
        "1 Bigha contains 20 Kattha. One Bigha is also 400 Dhur or 72,900 square feet.",
    },
    {
      question: "How many square feet are in 1 Kattha (१ कठ्ठा)?",
      answer:
        "1 Kattha is 3,645 square feet and contains 20 Dhur.",
    },
    {
      question: "Can I enter Nepali Devanagari numbers such as २-५-०-०?",
      answer:
        "The individual calculator fields accept both Latin and Devanagari numerals. Results can also be displayed using Devanagari digits through the १२३ numeral option.",
    },
    {
      question: "What does R-A-P-D notation mean?",
      answer:
        "R-A-P-D represents Ropani-Aana-Paisa-Daam in that order. For example, 1-2-3-0 means 1 Ropani, 2 Aana, 3 Paisa and 0 Daam.",
    },
    {
      question: "Is the calculated area the same as the official Lalpurja area?",
      answer:
        "Not necessarily. This calculator converts the measurements entered and can estimate rectangular plot area. For a legal or official land area, use the area recorded in the Lalpurja/cadastral record or verify it with the relevant Survey Office.",
    },
  ],
};
