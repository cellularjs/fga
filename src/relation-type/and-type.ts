import { FGA } from '../fga';
import { IsFulFilledOptions, Policy, PolicyType, ValidType } from '../fga-type';

export class AndType implements PolicyType {
  constructor(
    private fga: FGA,
    private policy: Policy,
    public types: ValidType[],
  ) { }

  async isFulFilled(options: IsFulFilledOptions): Promise<boolean> {
    for (let i = 0; i < this.types.length; i++) {
      const isInvalid = await this.types[i].isFulFilled(options);
      if (!isInvalid) return false;
    }

    return true;
  }
}
