export class Config {
  private _questionTime: number;
  private _loadingTime: number;
  private _checkTime: number;
  private _questionReader: boolean;
  private _audibleSounds: boolean;
  private _inputAssistance: boolean;
  private _numpadRemoval: boolean;
  private _fontSize: boolean;
  private _colourContrast: boolean;
  private _practice: boolean;
  private _nextBetweenQuestions: boolean;

  get questionTime(): number {
    return this._questionTime;
  }

  set questionTime(value: number) {
    this._questionTime = value;
  }

  get loadingTime(): number {
    return this._loadingTime;
  }

  set loadingTime(value: number) {
    this._loadingTime = value;
  }

  get checkTime(): number {
    return this._checkTime;
  }

  set checkTime(value: number) {
    this._checkTime = value;
  }

  get questionReader(): boolean {
    return this._questionReader;
  }

  set questionReader(value: boolean) {
    this._questionReader = value;
  }

  get audibleSounds(): boolean {
    return this._audibleSounds;
  }

  set audibleSounds(value: boolean) {
    this._audibleSounds = value;
  }

  get inputAssistance(): boolean {
    return this._inputAssistance;
  }

  set inputAssistance(value: boolean) {
    this._inputAssistance = value;
  }

  get numpadRemoval(): boolean {
    return this._numpadRemoval;
  }

  set numpadRemoval(value: boolean) {
    this._numpadRemoval = value;
  }

  get fontSize(): boolean {
    return this._fontSize;
  }

  set fontSize(value: boolean) {
    this._fontSize = value;
  }

  get colourContrast(): boolean {
    return this._colourContrast;
  }

  set colourContrast(value: boolean) {
    this._colourContrast = value;
  }

  get practice(): boolean {
    return this._practice;
  }

  set practice(value: boolean) {
    this._practice = value;
  }

  get nextBetweenQuestions(): boolean {
    return this._nextBetweenQuestions;
  }

  set nextBetweenQuestions(value: boolean) {
    this._nextBetweenQuestions = value;
  }
}
