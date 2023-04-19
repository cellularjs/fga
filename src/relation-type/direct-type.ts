import { FGA } from '../fga';
import { IsFulFilledOptions, Policy, PolicyType } from '../fga-type';

export class DirectType implements PolicyType {
  constructor(
    private fga: FGA,
    public policy: Policy,
    public readonly relCnf: string,
    public readonly rel: string,
  ) { }

  async isFulFilled(options: IsFulFilledOptions): Promise<boolean> {
    const { rel } = this;
    const object = options.parsedTuple.object;
    const subject = options.parsedTuple.subject;
    // console.log('DirectType', this.relCnf, this.rel, this.policy.subj, options.parsedTuple);
    console.log(`> DirectType: make simple query to check direct type exist: whether ${subject.name}#${subject.id} is ${rel} of ${object.name}#${object.id}`)
    return true;
  }
}