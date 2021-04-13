import IUUID from "./IUUID";

export class IFooBar extends IUUID { 
}

export class IFoo extends IFooBar {
  get value() {
    return 'iFoo'
  }
}

export class IBar extends IFooBar {
  get value() {
    return 'iBar'
  }
}