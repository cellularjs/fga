import { FGA } from '../fga';
import { IsFulFilledOptions, Policy, PolicyType, ValidType } from '../fga-type';

export class OneOfType implements PolicyType {
  constructor(
    private fga: FGA,
    private policy: Policy,
    public readonly types: ValidType[],
  ) { }

  async isFulFilled(options: IsFulFilledOptions) {
    for (let i = 0; i < this.types.length; i++) {
      const isInvalid = await this.types[i].isFulFilled(options);
      if (isInvalid) return true;
    }

    return false;
  }
}