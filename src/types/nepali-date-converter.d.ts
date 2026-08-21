declare module "@remotemerge/nepali-date-converter" {
  interface ConvertedDate {
    year: number;
    month: number;
    date: number;
    day: string;
  }

  export default class NepaliDateConverter {
    constructor(dateInput: string);

    toAd(): ConvertedDate;

    toBs(): ConvertedDate;
  }
}
