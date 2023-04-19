import { FGA } from '../fga';
import { Policy, PolicyType, IsFulFilledOptions } from '../fga-type';

export class RefType implements PolicyType {
  constructor(
    private readonly fga: FGA,
    private readonly policy: Policy,
    public readonly ref: string,
    public readonly rel: string,
  ) { }

  async isFulFilled(options: IsFulFilledOptions): Promise<boolean> {
    const { fga, policy, ref } = this;

    const compiledPolicy = fga.compiledPolicies.get(policy.subj);
    if (!compiledPolicy) {
      throw new Error(`Invalid RefType, there is no reference for "${policy.subj}"`);
    };

    const relCnf = compiledPolicy.rels[ref];
    if (!relCnf) {
      throw new Error(`RefType, there is no relation called "${ref}" in "${policy.subj}" subject`);
    }

    return relCnf.isFulFilled(options);
  }
}
