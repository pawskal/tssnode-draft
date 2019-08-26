export abstract class IInjectedService {
  stub!: string
};

export class InjectedService extends IInjectedService {
  stub!: string
  constructor(opts: any) {
    super();
    Object.assign(this, opts);
  }
}
